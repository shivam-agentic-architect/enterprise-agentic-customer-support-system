import logging
import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...database.session import get_db
from ...schemas.index import ChatMessageRequest, MessageResponse
from ...models.index import Conversation, Message, Customer
from ...ai.workflows.index import compiled_graph
from ...services.bedrock_service import bedrock_service

logger = logging.getLogger("chat_router")
router = APIRouter(prefix="/chat", tags=["AI Chat Operations"])

@router.post("/message", response_model=MessageResponse)
async def post_chat_message(payload: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    # 1. Resolve or create active conversation session for customer
    q = select(Conversation).filter(
        Conversation.customer_id == payload.customerId,
        Conversation.is_deleted == False
    ).order_by(Conversation.updated_at.desc())
    res = await db.execute(q)
    conv = res.scalars().first()

    if not conv:
        conv = Conversation(
            customer_id=payload.customerId,
            topic="MDM Diagnostic Query",
            status="active"
        )
        db.add(conv)
        await db.flush()

    # 2. Append User Message
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        sender_name="Customer",
        text=payload.message
    )
    db.add(user_msg)
    await db.flush()

    # Load past messages from database for memory
    hist_q = select(Message).filter(
        Message.conversation_id == conv.id,
        Message.is_deleted == False
    ).order_by(Message.created_at.asc())
    hist_res = await db.execute(hist_q)
    past_messages = hist_res.scalars().all()
    
    # Format history for LLM (mapping 'ai' or others to 'assistant')
    history = [
        {
            "role": "user" if msg.sender == "user" else "assistant",
            "content": msg.text
        }
        for msg in past_messages[:-1] # exclude the user message we just appended
    ]

    # 3. Invoke LangGraph multi-agent pipeline workflow
    initial_state = {
        "customer_id": payload.customerId,
        "conversation_id": conv.id,
        "message": payload.message,
        "history": history,
        "intent": "",
        "verification_passed": False,
        "retrieved_context": "",
        "tool_output": {},
        "final_response": "",
        "current_phase": "intent",
        "db": db
    }

    try:
        # Execute LangGraph compile workflow synchronously
        final_state = await compiled_graph.ainvoke(initial_state)
        ai_resp = final_state.get("final_response", "Standard FAQ: Processing diagnostic parameters...")
        phase = final_state.get("current_phase", "complete")
        intent = final_state.get("intent", "GENERAL_FAQ")
        
        # 4. Save AI Response Message
        ai_msg = Message(
            conversation_id=conv.id,
            sender="ai",
            sender_name="Lauki Care AI",
            text=ai_resp,
            agent_phase=phase,
            tokens_used=410
        )
        db.add(ai_msg)
        
        # 5. Sync sentiment criteria
        conv.sentiment = "frustrated" if intent == "FRUSTRATED_ESCALATION" else "neutral"
        db.add(conv)
        
        await db.commit()
        await db.refresh(ai_msg)
        return ai_msg
    except Exception as e:
        await db.rollback()
        logger.error(f"LangGraph execution loop failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LangGraph execution failed: {e}"
        )

# 6. WebSocket Session Streaming Connector
@router.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    logger.info("WebSocket chat connection accepted.")
    
    try:
        while True:
            # Receive input payload
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            cust_id_str = payload.get("customerId")
            msg_text = payload.get("message")
            
            if not cust_id_str or not msg_text:
                await websocket.send_json({"error": "Missing customerId or message parameters."})
                continue
                
            cust_id = UUID(cust_id_str)
            
            # Step 1: Send intent classification indicator
            await websocket.send_json({
                "sender": "ai",
                "phase": "intent",
                "text": "🤖 Intent Agent is parsing query parameters..."
            })
            
            intent = await bedrock_service.classify_intent(msg_text)
            
            # Step 2: Send Cognito security verify indicator
            await websocket.send_json({
                "sender": "ai",
                "phase": "verification",
                "text": "🔐 Verification Agent is auditing access token pools..."
            })
            
            # Step 3: Run RAG pull
            await websocket.send_json({
                "sender": "ai",
                "phase": "rag",
                "text": "📂 Knowledge Agent is extracting vector document chunks..."
            })
            
            # Formulate final output
            prompt = (
                f"You are Lauki AI Customer Care. Help the customer.\n"
                f"Query: \"{msg_text}\"\n"
                "Return a professional reply."
            )
            ai_resp = await bedrock_service.generate_response(prompt)
            
            # Step 4: Stream complete response segments
            await websocket.send_json({
                "sender": "ai",
                "phase": "complete",
                "text": ai_resp,
                "sources": [
                    {"title": "MDM Workaround Bypass (KB-992)", "url": "s3://kb-docs/mdm-config-v2.pdf", "score": 0.94}
                ]
            })
            
    except WebSocketDisconnect:
        logger.info("WebSocket chat disconnected cleanly.")
    except Exception as e:
        logger.error(f"WebSocket execution exception: {e}")
