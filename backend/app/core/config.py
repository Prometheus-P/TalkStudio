"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # AI API Keys
    openai_api_key: str = ""
    upstage_api_key: str = ""

    # Rate Limiting
    rate_limit_per_minute: int = 30
    rate_limit_per_day: int = 500

    # Redis (optional)
    redis_url: str | None = None

    # Logging
    log_level: str = "INFO"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str) -> str:
        """Ensure CORS origins is a string."""
        if isinstance(v, list):
            return ",".join(v)
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
