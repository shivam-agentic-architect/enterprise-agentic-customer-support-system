from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ...database.session import get_db
from ...schemas.index import AgentActivityResponse
from ...models.index import AgentActivity

router = APIRouter(prefix="/agents", tags=["AI Agents"])

@router.get("/", response_model=List[AgentActivityResponse])
async def list_agents(db: AsyncSession = Depends(get_db)):
    query = select(AgentActivity).filter(AgentActivity.is_deleted == False).order_by(AgentActivity.agent_name.asc())
    result = await db.execute(query)
    agents = result.scalars().all()
    
    # Return mapping
    return agents
