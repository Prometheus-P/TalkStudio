"""
Rate limiting configuration using slowapi with Redis persistence.
Automatically falls back to in-memory storage if Redis is unavailable.
"""

import logging
import time
from collections import defaultdict
from typing import Callable

from fastapi import HTTPException, Request, status
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_client_ip(request: Request) -> str:
    """
    Extract client IP address from request.
    Handles X-Forwarded-For header for reverse proxy setups.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request) or "unknown"


def _get_storage_uri() -> str:
    """
    Determine storage URI with Redis fallback.
    Returns Redis URI if available and connectable, otherwise memory.
    """
    redis_url = settings.redis_url

    if not redis_url:
        logger.info("Rate limiter: No Redis URL configured, using memory storage")
        return "memory://"

    try:
        import redis
        client = redis.from_url(redis_url, socket_connect_timeout=2)
        client.ping()
        logger.info("Rate limiter: Connected to Redis at %s", redis_url.split("@")[-1])
        return redis_url
    except ImportError:
        logger.warning("Rate limiter: redis package not installed, using memory storage")
        return "memory://"
    except Exception as e:
        logger.warning(
            "Rate limiter: Redis connection failed (%s), falling back to memory storage",
            type(e).__name__
        )
        return "memory://"


_storage_uri = _get_storage_uri()
limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
    storage_uri=_storage_uri,
)


class DailyQuotaManager:
    """
    Manages daily request quotas per IP.
    Uses Redis if available, falls back to in-memory storage.
    Includes automatic cleanup to prevent memory leaks.
    """

    MAX_MEMORY_ENTRIES = 10000  # Maximum in-memory entries to prevent memory leak
    CLEANUP_THRESHOLD = 8000   # Trigger cleanup when entries exceed this

    def __init__(self, daily_limit: int = 500, redis_url: str | None = None):
        self.daily_limit = daily_limit
        self._redis_client = None
        self._use_redis = False
        self._memory_counters: dict[str, dict[str, int]] = defaultdict(
            lambda: {"count": 0, "reset_day": 0}
        )
        self._last_cleanup_day = 0

        if redis_url:
            self._init_redis(redis_url)

    def _init_redis(self, redis_url: str) -> None:
        """Initialize Redis connection for quota storage."""
        try:
            import redis
            self._redis_client = redis.from_url(redis_url, socket_connect_timeout=2)
            self._redis_client.ping()
            self._use_redis = True
            logger.info("DailyQuotaManager: Using Redis storage")
        except ImportError:
            logger.warning("DailyQuotaManager: redis package not installed")
        except Exception as e:
            logger.warning(
                "DailyQuotaManager: Redis connection failed (%s), using memory",
                type(e).__name__
            )

    def _cleanup_old_entries(self) -> int:
        """
        Remove expired entries from in-memory storage.
        Returns the number of entries removed.
        """
        current_day = self._get_current_day()

        # Skip if already cleaned today
        if self._last_cleanup_day == current_day:
            return 0

        expired_ips = [
            ip for ip, data in self._memory_counters.items()
            if data["reset_day"] != current_day
        ]

        for ip in expired_ips:
            del self._memory_counters[ip]

        self._last_cleanup_day = current_day

        if expired_ips:
            logger.info(
                "DailyQuotaManager: Cleaned up %d expired entries", len(expired_ips)
            )

        return len(expired_ips)

    def _maybe_cleanup(self) -> None:
        """
        Trigger cleanup if memory usage exceeds threshold.
        Prevents unbounded memory growth in long-running processes.
        """
        entry_count = len(self._memory_counters)

        if entry_count >= self.CLEANUP_THRESHOLD:
            self._cleanup_old_entries()
            remaining = len(self._memory_counters)

            # If still over limit after cleanup, remove oldest entries
            if remaining >= self.MAX_MEMORY_ENTRIES:
                # Sort by count (lowest first) and remove excess
                sorted_ips = sorted(
                    self._memory_counters.items(),
                    key=lambda x: x[1]["count"]
                )
                to_remove = remaining - self.CLEANUP_THRESHOLD
                for ip, _ in sorted_ips[:to_remove]:
                    del self._memory_counters[ip]

                logger.warning(
                    "DailyQuotaManager: Force-removed %d entries to prevent memory overflow",
                    to_remove
                )

    def _get_current_day(self) -> int:
        """Get current day as integer (days since epoch)."""
        return int(time.time() // 86400)

    def _get_redis_key(self, client_ip: str) -> str:
        """Generate Redis key for client quota."""
        day = self._get_current_day()
        return f"talkstudio:quota:{day}:{client_ip}"

    def check_quota(self, client_ip: str) -> tuple[bool, int]:
        """
        Check if client has remaining quota.
        Returns (has_quota, remaining_count).
        """
        if self._use_redis and self._redis_client:
            return self._check_quota_redis(client_ip)
        return self._check_quota_memory(client_ip)

    def _check_quota_redis(self, client_ip: str) -> tuple[bool, int]:
        """Check quota using Redis."""
        try:
            key = self._get_redis_key(client_ip)
            count = self._redis_client.get(key)
            current_count = int(count) if count else 0
            remaining = self.daily_limit - current_count
            return remaining > 0, max(0, remaining)
        except Exception:
            return self._check_quota_memory(client_ip)

    def _check_quota_memory(self, client_ip: str) -> tuple[bool, int]:
        """Check quota using in-memory storage."""
        # Trigger cleanup if needed
        self._maybe_cleanup()

        current_day = self._get_current_day()
        client_data = self._memory_counters[client_ip]

        if client_data["reset_day"] != current_day:
            client_data["count"] = 0
            client_data["reset_day"] = current_day

        remaining = self.daily_limit - client_data["count"]
        return remaining > 0, max(0, remaining)

    def increment(self, client_ip: str) -> int:
        """Increment counter and return new remaining count."""
        if self._use_redis and self._redis_client:
            return self._increment_redis(client_ip)
        return self._increment_memory(client_ip)

    def _increment_redis(self, client_ip: str) -> int:
        """Increment using Redis."""
        try:
            key = self._get_redis_key(client_ip)
            pipe = self._redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, 86400)
            results = pipe.execute()
            new_count = results[0]
            return max(0, self.daily_limit - new_count)
        except Exception:
            return self._increment_memory(client_ip)

    def _increment_memory(self, client_ip: str) -> int:
        """Increment using in-memory storage."""
        current_day = self._get_current_day()
        client_data = self._memory_counters[client_ip]

        if client_data["reset_day"] != current_day:
            client_data["count"] = 0
            client_data["reset_day"] = current_day

        client_data["count"] += 1
        return max(0, self.daily_limit - client_data["count"])

    def get_remaining(self, client_ip: str) -> int:
        """Get remaining quota for a client."""
        _, remaining = self.check_quota(client_ip)
        return remaining


quota_manager = DailyQuotaManager(
    daily_limit=settings.rate_limit_per_day,
    redis_url=settings.redis_url,
)


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

    quota_manager.increment(client_ip)


async def quota_headers_middleware(request: Request, call_next: Callable):
    """Middleware to add quota information to response headers."""
    response = await call_next(request)

    try:
        client_ip = get_client_ip(request)
        remaining = quota_manager.get_remaining(client_ip)
        response.headers["X-Daily-Quota-Remaining"] = str(remaining)
        response.headers["X-Daily-Quota-Limit"] = str(quota_manager.daily_limit)
    except Exception:
        pass

    return response
