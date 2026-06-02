from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...database.session import get_db
from ...schemas.index import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
from ...models.index import Conversation, Message, Customer

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    query = select(Conversation).filter(Conversation.is_deleted == False).order_by(Conversation.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    convs = result.scalars().all()
    
    # Map customer titles dynamically
    results = []
    for c in convs:
        cust_q = select(Customer).filter(Customer.id == c.customer_id)
        cust_res = await db.execute(cust_q)
        cust = cust_res.scalars().first()
        
        results.append({
            "id": c.id,
            "customer_id": c.customer_id,
            "customer_name": cust.name if cust else "Unknown User",
            "customer_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330" if cust else None,
            "status": c.status,
            "sentiment": c.sentiment,
            "topic": c.topic,
            "created_at": c.created_at
        })
    return results

@router.get("/{id}", response_model=ConversationResponse)
async def get_conversation(id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Conversation).filter(Conversation.id == id, Conversation.is_deleted == False)
    result = await db.execute(query)
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation session not found.")

    cust_q = select(Customer).filter(Customer.id == c.customer_id)
    cust_res = await db.execute(cust_q)
    cust = cust_res.scalars().first()

    # Load messages
    msg_q = select(Message).filter(Message.conversation_id == id, Message.is_deleted == False).order_by(Message.created_at.asc())
    msg_res = await db.execute(msg_q)
    messages = msg_res.scalars().all()

    return {
        "id": c.id,
        "customer_id": c.customer_id,
        "customer_name": cust.name if cust else "Unknown User",
        "customer_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330" if cust else None,
        "status": c.status,
        "sentiment": c.sentiment,
        "topic": c.topic,
        "messages": messages,
        "created_at": c.created_at
    }

@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(obj_in: ConversationCreate, db: AsyncSession = Depends(get_db)):
    # Verify customer exists
    cust_q = select(Customer).filter(Customer.id == obj_in.customer_id, Customer.is_deleted == False)
    cust_res = await db.execute(cust_q)
    cust = cust_res.scalars().first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer target not found.")

    conv = Conversation(
        customer_id=obj_in.customer_id,
        topic=obj_in.topic,
        status="active",
        sentiment=cust.sentiment
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    
    return {
        "id": conv.id,
        "customer_id": conv.customer_id,
        "customer_name": cust.name,
        "status": conv.status,
        "sentiment": conv.sentiment,
        "topic": conv.topic,
        "messages": [],
        "created_at": conv.created_at
    }

@router.post("/{id}/message", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def add_message(id: UUID, obj_in: MessageCreate, db: AsyncSession = Depends(get_db)):
    # Verify conversation
    c_q = select(Conversation).filter(Conversation.id == id, Conversation.is_deleted == False)
    c_res = await db.execute(c_q)
    if not c_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation session not found.")

    msg = Message(
        conversation_id=id,
        **obj_in.model_dump()
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg
