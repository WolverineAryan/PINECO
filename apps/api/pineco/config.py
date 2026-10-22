import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_ENV: str = "development"
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "sqlite:///./pineco.db"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://pineco.vercel.app"

    # Server-side AI provider configuration
    LLM_PROVIDER: str = "openai"  # openai, gemini, anthropic, groq, mock
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_BASE_URL: str = ""

    MAX_UPLOAD_MB: int = 10

    # Default demo workspace and user identifiers
    DEFAULT_WORKSPACE_ID: str = "ws-demo-enterprise-001"
    DEFAULT_USER_CREATOR: str = "usr-creator-sarah"
    DEFAULT_USER_MANAGER: str = "usr-manager-marcus"
    DEFAULT_USER_REVIEWER: str = "usr-reviewer-elena"
    DEFAULT_USER_ADMIN: str = "usr-admin-alex"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
