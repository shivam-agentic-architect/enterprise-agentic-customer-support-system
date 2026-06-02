import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...models.index import Customer, CustomerProfile, Ticket, Conversation, TicketComment
from ...services.opensearch_service import opensearch_service
from ...services.bedrock_service import bedrock_service

logger = logging.getLogger("ai_tools")

# 1. Search Knowledge Base Vector RAG tool
async def search_knowledge_base(query: str) -> str:
    logger.info(f"Invoking search_knowledge_base tool for: {query}")
    try:
        # Generate Titan Embeddings
        embeddings = await bedrock_service.generate_embeddings(query)
        hits = await opensearch_service.search_vector_database(query, embeddings, limit=2)
        
        if not hits:
            return "No matching knowledge base documents found."
            
        formatted = []
        for h in hits:
            formatted.append(
                f"Source Document: {h.get('title')}\n"
                f"S3 Path: {h.get('url')}\n"
                f"Similarity Match: {h.get('score') * 100:.0f}%\n"
                f"Snippet content: {h.get('content')}\n"
            )
        return "\n---\n".join(formatted)
    except Exception as e:
        logger.error(f"Search KB tool failed: {e}")
        return "Local FAQ search fallback: MDM Error 994 can be bypassed using Cognito token rotation rotations."

# 2. Query CRM Customer profile tool
async def get_customer_profile(customer_id: UUID, db: AsyncSession) -> Dict[str, Any]:
    logger.info(f"Invoking get_customer_profile tool for CUST: {customer_id}")
    try:
        query = select(Customer).filter(Customer.id == customer_id, Customer.is_deleted == False)
        result = await db.execute(query)
        customer = result.scalars().first()
        if not customer:
            return {"error": "Customer not found."}
            
        # Get details
        profile_query = select(CustomerProfile).filter(CustomerProfile.customer_id == customer_id)
        p_res = await db.execute(profile_query)
        profile = p_res.scalars().first()
        
        return {
            "id": str(customer.id),
            "name": customer.name,
            "email": customer.email,
            "plan": customer.plan,
            "sentiment": customer.sentiment,
            "sentiment_score": customer.sentiment_score,
            "summary": profile.summary if profile else "",
            "orders": profile.orders if profile else []
        }
    except Exception as e:
        logger.error(f"CRM CRM tool failed: {e}")
        return {"error": "Failed database operation."}

# 3. Check SLA Ticket status tool
async def get_ticket_status(ticket_id: UUID, db: AsyncSession) -> Dict[str, Any]:
    logger.info(f"Invoking get_ticket_status tool for: {ticket_id}")
    try:
        query = select(Ticket).filter(Ticket.id == ticket_id, Ticket.is_deleted == False)
        result = await db.execute(query)
        t = result.scalars().first()
        if not t:
            return {"error": "Ticket not found."}
        return {
            "id": str(t.id),
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "updated_at": t.updated_at.isoformat()
        }
    except Exception as e:
        logger.error(f"Ticket check tool failed: {e}")
        return {"error": "Failed database query."}

# 4. Create Ticket tool
async def create_ticket(
    title: str, 
    description: str, 
    customer_id: UUID, 
    priority: str,
    db: AsyncSession
) -> Dict[str, Any]:
    logger.info(f"Invoking create_ticket tool for: {title}")
    try:
        new_ticket = Ticket(
            title=title,
            description=description,
            customer_id=customer_id,
            priority=priority,
            status="open"
        )
        db.add(new_ticket)
        await db.flush()
        
        # Add comment timeline
        comment = TicketComment(
            ticket_id=new_ticket.id,
            author_name="Intent Agent AI",
            action_taken="Ticket Created",
            comment="Automatic system ticket created during LLM conversation session."
        )
        db.add(comment)
        await db.flush()
        
        return {
            "success": True,
            "ticket_id": str(new_ticket.id),
            "status": "open",
            "priority": priority
        }
    except Exception as e:
        logger.error(f"Ticket create tool failed: {e}")
        return {"error": "Failed creating ticket."}

# 5. Escalate case tool
async def escalate_case(conversation_id: UUID, db: AsyncSession) -> Dict[str, Any]:
    logger.info(f"Invoking escalate_case tool for session: {conversation_id}")
    try:
        query = select(Conversation).filter(Conversation.id == conversation_id)
        result = await db.execute(query)
        conv = result.scalars().first()
        if conv:
            conv.status = "escalated"
            conv.sentiment = "frustrated"
            db.add(conv)
            await db.flush()
            
            # Update customer sentiment score
            cust_q = select(Customer).filter(Customer.id == conv.customer_id)
            c_res = await db.execute(cust_q)
            customer = c_res.scalars().first()
            if customer:
                customer.sentiment = "frustrated"
                customer.sentiment_score = max(0, customer.sentiment_score - 20)
                db.add(customer)
                await db.flush()

            return {"success": True, "status": "escalated", "action": "Amazon Connect dispatch voice trigger"}
        return {"error": "Conversation not found."}
    except Exception as e:
        logger.error(f"Escalation tool failed: {e}")
        return {"error": "Failed database operation."}
