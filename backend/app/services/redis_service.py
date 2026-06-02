import json
import logging
import functools
from typing import Any, Callable, Optional
import redis.asyncio as redis
from ..core.config import settings

logger = logging.getLogger("redis_service")

class RedisService:
    def __init__(self):
        self.active = False
        try:
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            self.active = True
            logger.info("Redis cache engine connected successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Redis cache: {e}")
            self.memory_cache = {}

    async def get(self, key: str) -> Optional[str]:
        if self.active:
            try:
                return await self.client.get(key)
            except Exception as e:
                logger.error(f"Redis get failed: {e}")
        
        # Fallback to local memory cache
        if hasattr(self, "memory_cache"):
            return self.memory_cache.get(key)
        return None

    async def set(self, key: str, value: str, expire: int = 300) -> bool:
        if self.active:
            try:
                await self.client.set(key, value, ex=expire)
                return True
            except Exception as e:
                logger.error(f"Redis set failed: {e}")
                
        # Fallback to local memory cache
        if hasattr(self, "memory_cache"):
            self.memory_cache[key] = value
        return True

    async def delete(self, key: str) -> bool:
        if self.active:
            try:
                await self.client.delete(key)
                return True
            except Exception as e:
                logger.error(f"Redis delete failed: {e}")
        
        # Fallback to local memory cache
        if hasattr(self, "memory_cache") and key in self.memory_cache:
            del self.memory_cache[key]
        return True

redis_service = RedisService()

# Caching decorator helper for FastAPI routing endpoints
def cache_response(expire: int = 300):
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # We generate a unique cache key based on function name, positional arguments, and keyword parameters
            # Filter out non-serializable arguments (like database sessions)
            serializable_kwargs = {
                k: str(v) for k, v in kwargs.items() 
                if k not in ["db", "current_user", "session", "request"]
            }
            cache_key = f"cache:{func.__name__}:{hash(frozenset(serializable_kwargs.items()))}"
            
            cached = await redis_service.get(cache_key)
            if cached:
                try:
                    return json.loads(cached)
                except Exception:
                    return cached

            # Execute actual controller function
            result = await func(*args, **kwargs)
            
            try:
                # Convert schemas / dicts to JSON serializable objects
                if hasattr(result, "model_dump"):
                    serializable = result.model_dump()
                elif isinstance(result, list):
                    serializable = [item.model_dump() if hasattr(item, "model_dump") else item for item in result]
                else:
                    serializable = result
                await redis_service.set(cache_key, json.dumps(serializable), expire)
            except Exception as e:
                logger.error(f"Failed to serialize cache output: {e}")
                
            return result
        return wrapper
    return decorator
