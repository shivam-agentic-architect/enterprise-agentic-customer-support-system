from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...database.session import get_db
from ...schemas.index import TicketCreate, TicketUpdate, TicketResponse, TicketCommentCreate, TicketCommentResponse
from ...models.index import Ticket, TicketComment, Customer

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/", response_model=List[TicketResponse])
async def list_tickets(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    query = select(Ticket).filter(Ticket.is_deleted == False).order_by(Ticket.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    results = []
    for t in tickets:
        cust_q = select(Customer).filter(Customer.id == t.customer_id)
        cust_res = await db.execute(cust_q)
        cust = cust_res.scalars().first()
        
        results.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "customer_id": t.customer_id,
            "customer_name": cust.name if cust else "Unknown Customer",
            "assigned_to": t.assigned_to,
            "status": t.status,
            "priority": t.priority,
            "created_at": t.created_at,
            "updated_at": t.updated_at
        })
    return results

@router.get("/{id}", response_model=TicketResponse)
async def get_ticket(id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Ticket).filter(Ticket.id == id, Ticket.is_deleted == False)
    result = await db.execute(query)
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    cust_q = select(Customer).filter(Customer.id == t.customer_id)
    cust_res = await db.execute(cust_q)
    cust = cust_res.scalars().first()

    # Load comments
    com_q = select(TicketComment).filter(TicketComment.ticket_id == id).order_by(TicketComment.created_at.asc())
    com_res = await db.execute(com_q)
    comments = com_res.scalars().all()

    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "customer_id": t.customer_id,
        "customer_name": cust.name if cust else "Unknown Customer",
        "assigned_to": t.assigned_to,
        "status": t.status,
        "priority": t.priority,
        "comments": comments,
        "created_at": t.created_at,
        "updated_at": t.updated_at
    }

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket_endpoint(obj_in: TicketCreate, db: AsyncSession = Depends(get_db)):
    # Verify customer
    cust_q = select(Customer).filter(Customer.id == obj_in.customer_id, Customer.is_deleted == False)
    cust_res = await db.execute(cust_q)
    cust = cust_res.scalars().first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    ticket = Ticket(**obj_in.model_dump())
    db.add(ticket)
    await db.flush()

    # Add initial comment
    comment = TicketComment(
        ticket_id=ticket.id,
        author_name="System",
        action_taken="Ticket Created",
        comment=f"Support ticket successfully opened for {cust.name}."
    )
    db.add(comment)
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "customer_id": ticket.customer_id,
        "customer_name": cust.name,
        "assigned_to": ticket.assigned_to,
        "status": ticket.status,
        "priority": ticket.priority,
        "comments": [comment],
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at
    }

@router.put("/{id}", response_model=TicketResponse)
async def update_ticket(id: UUID, obj_in: TicketUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Ticket).filter(Ticket.id == id, Ticket.is_deleted == False)
    result = await db.execute(query)
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    update_data = obj_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(t, k, v)

    # If status/priority changed, add timeline trace comment
    if "status" in update_data:
        comment = TicketComment(
            ticket_id=id,
            author_name="Admin Operations",
            action_taken="Status Change",
            comment=f"Ticket status modified to: {update_data['status'].upper()}"
        )
        db.add(comment)

    db.add(t)
    await db.commit()
    
    # Reload complete specs
    return await get_ticket(id, db)

@router.delete("/{id}")
async def delete_ticket(id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Ticket).filter(Ticket.id == id, Ticket.is_deleted == False)
    result = await db.execute(query)
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    t.is_deleted = True
    db.add(t)
    await db.commit()
    return {"message": "Ticket soft-deleted successfully."}
