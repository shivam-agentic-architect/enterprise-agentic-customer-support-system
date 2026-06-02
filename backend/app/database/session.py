import socket
import logging
from urllib.parse import urlparse
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from ..core.config import settings

logger = logging.getLogger("database_session")

def is_database_online(url: str) -> bool:
    try:
        if "sqlite" in url:
            return True
        # Safely parse the hostname and port
        cleaned_url = url.replace("postgresql+asyncpg://", "http://")
        parsed = urlparse(cleaned_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432
        
        # Test TCP connection
        with socket.create_connection((host, port), timeout=1.0) as s:
            return True
    except Exception:
        return False

db_url = settings.DATABASE_URL
if not is_database_online(db_url):
    fallback_url = "sqlite+aiosqlite:///./lauki_care.db"
    logger.warning(
        f"PostgreSQL database at {db_url} is unreachable. "
        f"Falling back to local SQLite database: {fallback_url}"
    )
    db_url = fallback_url

is_sqlite = "sqlite" in db_url

if is_sqlite:
    engine = create_async_engine(
        db_url,
        echo=False
    )
else:
    engine = create_async_engine(
        db_url,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

# Async Session Maker pool
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base model class definition
Base = declarative_base()

# Database session dependency injection helper
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
