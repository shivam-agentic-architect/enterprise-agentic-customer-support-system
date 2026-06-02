import os
from typing import List, Union
from pydantic import AnyHttpUrl, BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

def parse_cors(v: Union[str, List[str]]) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Enterprise AI Customer Care Platform"
    
    # CORS Origins configuration
    BACKEND_CORS_ORIGINS: Annotated[
        List[str], BeforeValidator(parse_cors)
    ] = ["http://localhost:3000", "http://localhost:8000"]

    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/lauki_care"

    # Redis Cache connection
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security JWT tokens
    JWT_SECRET: str = "super_secure_enterprise_ai_secret_key_rotation_994"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AWS Bedrock runtime configuration
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    BEDROCK_MODEL_ID: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"

    # OpenSearch Vector Database connection
    OPENSEARCH_HOST: str = ""
    OPENSEARCH_USER: str = "admin"
    OPENSEARCH_PASSWORD: str = "AdminPassword123!"

    # Logging and Observability
    LOG_LEVEL: str = "INFO"
    CLOUDWATCH_LOG_GROUP: str = "lauki-care-backend"

settings = Settings()
