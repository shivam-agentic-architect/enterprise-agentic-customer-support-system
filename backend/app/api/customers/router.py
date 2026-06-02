from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...database.session import get_db
from ...schemas.index import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerProfileResponse
from ...models.index import Customer, CustomerProfile, Ticket

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/", response_model=List[CustomerResponse])
async def list_customers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    query = select(Customer).filter(Customer.is_deleted == False).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{id}", response_model=CustomerResponse)
async def get_customer(id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Customer).filter(Customer.id == id, Customer.is_deleted == False)
    result = await db.execute(query)
    cust = result.scalars().first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return cust

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(obj_in: CustomerCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate
    chk_q = select(Customer).filter(Customer.email == obj_in.email, Customer.is_deleted == False)
    chk_r = await db.execute(chk_q)
    if chk_r.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists.")

    cust = Customer(**obj_in.model_dump())
    db.add(cust)
    await db.flush()

    # Generate Profile placeholder
    prof = CustomerProfile(
        customer_id=cust.id,
        summary=f"Enterprise profile created for {cust.name}.",
        orders=[]
    )
    db.add(prof)
    await db.commit()
    await db.refresh(cust)
    return cust

@router.put("/{id}", response_model=CustomerResponse)
async def update_customer(id: UUID, obj_in: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Customer).filter(Customer.id == id, Customer.is_deleted == False)
    result = await db.execute(query)
    cust = result.scalars().first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    for k, v in obj_in.model_dump(exclude_unset=True).items():
        setattr(cust, k, v)
        
    db.add(cust)
    await db.commit()
    await db.refresh(cust)
    return cust

@router.delete("/{id}")
async def delete_customer(id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(Customer).filter(Customer.id == id, Customer.is_deleted == False)
    result = await db.execute(query)
    cust = result.scalars().first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    cust.is_deleted = True
    db.add(cust)
    await db.commit()
    return {"message": "Customer soft-deleted successfully."}

@router.get("/{id}/profile", response_model=CustomerProfileResponse)
async def get_customer_profile(id: UUID, db: AsyncSession = Depends(get_db)):
    # Query customer
    cust_q = select(Customer).filter(Customer.id == id, Customer.is_deleted == False)
    cust_res = await db.execute(cust_q)
    cust = cust_res.scalars().first()
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    # Query profiles
    prof_q = select(CustomerProfile).filter(CustomerProfile.customer_id == id)
    prof_res = await db.execute(prof_q)
    prof = prof_res.scalars().first()

    # Query tickets
    tix_q = select(Ticket).filter(Ticket.customer_id == id, Ticket.is_deleted == False)
    tix_res = await db.execute(tix_q)
    tix = tix_res.scalars().all()

    # Dynamic suggestions
    recs = [
        "Waive next accessory tier charge as a corporate goodwill gesture.",
        "Verify security token encryption protocols via Verification Agent logs."
    ]

    return {
        "id": cust.id,
        "name": cust.name,
        "email": cust.email,
        "phone": cust.phone,
        "plan": cust.plan,
        "sentiment": cust.sentiment,
        "sentiment_score": cust.sentiment_score,
        "summary": prof.summary if prof else "",
        "orders": prof.orders if prof else [],
        "tickets": tix,
        "ai_recommendations": recs
    }
