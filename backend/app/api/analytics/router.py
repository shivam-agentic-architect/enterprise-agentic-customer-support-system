from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...database.session import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
async def get_analytics_overview():
    return {
        "customerSatisfaction": 4.85,
        "averageResolutionTime": "12.4m",
        "escalationRate": 18.0,
        "aiAccuracy": 98.4,
        "costSavings": 189200.00
    }

@router.get("/customer-satisfaction")
async def get_csat_metrics():
    return [
        {"name": "Jan", "csat": 4.60},
        {"name": "Feb", "csat": 4.68},
        {"name": "Mar", "csat": 4.75},
        {"name": "Apr", "csat": 4.80},
        {"name": "May", "csat": 4.85}
    ]

@router.get("/ticket-trends")
async def get_ticket_trends_analytics():
    return [
        {"name": "Low", "value": 160},
        {"name": "Medium", "value": 120},
        {"name": "High", "value": 75},
        {"name": "Critical", "value": 25}
    ]

@router.get("/ai-performance")
async def get_ai_performance_metrics():
    return {
        "intentAccuracy": 99.2,
        "verificationCompliance": 100.0,
        "ragPrecision": 96.8,
        "actionSuccessRate": 98.4
    }
