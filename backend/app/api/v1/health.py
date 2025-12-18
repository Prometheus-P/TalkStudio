"""Health check endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Request

from app.core.config import settings
from app.core.rate_limiter import get_client_ip, quota_manager

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.environment,
    }


@router.get("/health/detailed")
async def detailed_health_check(request: Request):
    """Detailed health check with service status."""
    client_ip = get_client_ip(request)
    remaining_quota = quota_manager.get_remaining(client_ip)

    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.environment,
        "version": "2.0.0",
        "services": {
            "openai": bool(settings.openai_api_key),
            "upstage": bool(settings.upstage_api_key),
            "redis": settings.redis_url is not None,
        },
        "rate_limits": {
            "per_minute": settings.rate_limit_per_minute,
            "per_day": settings.rate_limit_per_day,
            "your_remaining_today": remaining_quota,
        },
    }


@router.get("/quota")
async def get_quota_status(request: Request):
    """Get current quota status for the client."""
    client_ip = get_client_ip(request)
    remaining = quota_manager.get_remaining(client_ip)

    return {
        "remaining": remaining,
        "limit": quota_manager.daily_limit,
        "reset": "midnight UTC",
    }
