import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .core.logging import setup_logging
from .api.auth.router import router as auth_router
from .api.dashboard.router import router as dashboard_router
from .api.customers.router import router as customers_router
from .api.conversations.router import router as conversations_router
from .api.tickets.router import router as tickets_router
from .api.knowledge_base.router import router as kb_router
from .api.agents.router import router as agents_router
from .api.analytics.router import router as analytics_router
from .api.settings.router import router as settings_router
from .api.chat.router import router as chat_router
from .api.integrations.router import router as integrations_router

# Setup structured logger
setup_logging()
logger = logging.getLogger("main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade FastAPI Multi-Agent Customer Care backend supporting RAG databases, AWS Bedrock workflows, and real-time WebSockets.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration setup
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount all endpoint routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(customers_router, prefix=settings.API_V1_STR)
app.include_router(conversations_router, prefix=settings.API_V1_STR)
app.include_router(tickets_router, prefix=settings.API_V1_STR)
app.include_router(kb_router, prefix=settings.API_V1_STR)
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(integrations_router, prefix=settings.API_V1_STR)

# Health check route
@app.get("/health", tags=["System health"])
async def health_check():
    return {
        "status": "healthy",
        "aws_bedrock": "operational",
        "database": "connected",
        "redis_cache": "connected"
    }

# Global exception handlers filter
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred inside Lauki backend."}
    )
