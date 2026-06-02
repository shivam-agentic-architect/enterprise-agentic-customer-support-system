from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...database.session import get_db
from ...schemas.index import SystemConfigUpdate
from ...core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/")
async def get_settings():
    return {
        "bedrockModel": settings.BEDROCK_MODEL_ID,
        "temperature": settings.ACCESS_TOKEN_EXPIRE_MINUTES, # Cache / param mapping
        "maxTokens": 2000,
        "systemPrompt": "You are Lauki AI Customer Care Agent routing customer MDM queries safely."
    }

@router.post("/", status_code=status.HTTP_200_OK)
async def update_settings(config: SystemConfigUpdate):
    # Simulate updating configurations variables
    settings.BEDROCK_MODEL_ID = config.bedrockModel
    
    return {
        "message": "AWS Bedrock runtime settings successfully updated.",
        "config": config
    }
