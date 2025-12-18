"""Rate limiting configuration using slowapi."""

import time
from collections import defaultdict
from typing import Callable

from fastapi import HTTPException, Request, status
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings


def get_client_ip(request: Request) -> str:
    """
    Extract client IP address from request.
    Handles X-Forwarded-For header for reverse proxy setups.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Take the first IP (original client)
        return forwarded.split(",")[0].strip()
    return get_remote_address(request) or "unknown"


# Initialize rate limiter
limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
    storage_uri=settings.redis_url if settings.redis_url else "memory://",
)


class DailyQuotaManager:
    """
    Manages daily request quotas per IP.
    Uses in-memory storage (reset on restart).
    For production, use Redis.
    """

    def __init__(self, daily_limit: int = 500):
        self.daily_limit = daily_limit
        self._counters: dict[str, dict[str, int]] = defaultdict(
            lambda: {"count": 0, "reset_day": 0}
        )

    def _get_current_day(self) -> int:
        """Get current day as integer (days since epoch)."""
        return int(time.time() // 86400)

    def check_quota(self, client_ip: str) -> tuple[bool, int]:
        """
        Check if client has remaining quota.
        Returns (has_quota, remaining_count).
        """
        current_day = self._get_current_day()
        client_data = self._counters[client_ip]

        # Reset if it's a new day
        if client_data["reset_day"] != current_day:
            client_data["count"] = 0
            client_data["reset_day"] = current_day

        remaining = self.daily_limit - client_data["count"]
        return remaining > 0, max(0, remaining)

    def increment(self, client_ip: str) -> int:
        """Increment counter and return new remaining count."""
        current_day = self._get_current_day()
        client_data = self._counters[client_ip]

        if client_data["reset_day"] != current_day:
            client_data["count"] = 0
            client_data["reset_day"] = current_day

        client_data["count"] += 1
        return max(0, self.daily_limit - client_data["count"])

    def get_remaining(self, client_ip: str) -> int:
        """Get remaining quota for a client."""
        _, remaining = self.check_quota(client_ip)
        return remaining


# Global quota manager instance
quota_manager = DailyQuotaManager(daily_limit=settings.rate_limit_per_day)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors."""
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail={
            "error": "rate_limit_exceeded",
            "message": f"Rate limit exceeded: {exc.detail}",
            "retry_after": getattr(exc, "retry_after", 60),
        },
    )


def check_daily_quota(request: Request) -> None:
    """
    Dependency to check daily quota before processing request.
    Raises HTTPException if quota is exceeded.
    """
    client_ip = get_client_ip(request)
    has_quota, remaining = quota_manager.check_quota(client_ip)

    if not has_quota:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "daily_quota_exceeded",
                "message": "Daily request quota exceeded. Please try again tomorrow.",
                "remaining": 0,
                "limit": quota_manager.daily_limit,
            },
        )

    # Increment the counter
    quota_manager.increment(client_ip)


def quota_headers_middleware(request: Request, call_next: Callable):
    """Middleware to add quota information to response headers."""
    client_ip = get_client_ip(request)
    remaining = quota_manager.get_remaining(client_ip)

    response = call_next(request)
    response.headers["X-Daily-Quota-Remaining"] = str(remaining)
    response.headers["X-Daily-Quota-Limit"] = str(quota_manager.daily_limit)

    return response
