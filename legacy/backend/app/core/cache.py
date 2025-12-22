"""
Response caching for AI API calls.
Reduces API costs by caching identical prompts.
Uses Redis if available, falls back to in-memory LRU cache.
"""

import hashlib
import json
import logging
from collections import OrderedDict
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class ResponseCache:
    """
    Cache for AI-generated responses.
    Supports Redis (distributed) and in-memory (local) storage.
    """

    DEFAULT_TTL = 3600  # 1 hour
    MAX_MEMORY_ENTRIES = 1000  # Maximum in-memory cache entries
    CACHE_KEY_PREFIX = "talkstudio:ai:response"

    def __init__(self, redis_url: str | None = None, ttl: int = DEFAULT_TTL):
        self.ttl = ttl
        self._redis_client = None
        self._use_redis = False
        self._memory_cache: OrderedDict[str, dict[str, Any]] = OrderedDict()

        if redis_url:
            self._init_redis(redis_url)

    def _init_redis(self, redis_url: str) -> None:
        """Initialize Redis connection."""
        try:
            import redis
            self._redis_client = redis.from_url(redis_url, socket_connect_timeout=2)
            self._redis_client.ping()
            self._use_redis = True
            logger.info("ResponseCache: Using Redis storage")
        except ImportError:
            logger.warning("ResponseCache: redis package not installed, using memory")
        except Exception as e:
            logger.warning(
                "ResponseCache: Redis connection failed (%s), using memory",
                type(e).__name__
            )

    @staticmethod
    def generate_cache_key(
        prompt: str,
        message_count: int,
        style: str,
        language: str,
        provider: str,
    ) -> str:
        """
        Generate a deterministic cache key from request parameters.
        Uses SHA256 hash for consistent key length.
        """
        key_data = json.dumps({
            "prompt": prompt.strip().lower(),
            "message_count": message_count,
            "style": style,
            "language": language,
            "provider": provider,
        }, sort_keys=True, ensure_ascii=False)

        hash_digest = hashlib.sha256(key_data.encode()).hexdigest()[:32]
        return f"{ResponseCache.CACHE_KEY_PREFIX}:{hash_digest}"

    def get(self, cache_key: str) -> dict[str, Any] | None:
        """
        Retrieve cached response.
        Returns None if not found or expired.
        """
        if self._use_redis and self._redis_client:
            return self._get_redis(cache_key)
        return self._get_memory(cache_key)

    def _get_redis(self, cache_key: str) -> dict[str, Any] | None:
        """Get from Redis."""
        try:
            data = self._redis_client.get(cache_key)
            if data:
                cached = json.loads(data)
                logger.debug("Cache HIT (Redis): %s", cache_key)
                return cached
            logger.debug("Cache MISS (Redis): %s", cache_key)
            return None
        except Exception as e:
            logger.warning("Redis get failed: %s", e)
            return self._get_memory(cache_key)

    def _get_memory(self, cache_key: str) -> dict[str, Any] | None:
        """Get from in-memory cache."""
        if cache_key not in self._memory_cache:
            logger.debug("Cache MISS (Memory): %s", cache_key)
            return None

        entry = self._memory_cache[cache_key]

        # Check expiration
        if entry.get("expires_at", 0) < datetime.now(timezone.utc).timestamp():
            del self._memory_cache[cache_key]
            logger.debug("Cache EXPIRED (Memory): %s", cache_key)
            return None

        # Move to end for LRU
        self._memory_cache.move_to_end(cache_key)
        logger.debug("Cache HIT (Memory): %s", cache_key)
        return entry.get("data")

    def set(self, cache_key: str, data: dict[str, Any], ttl: int | None = None) -> bool:
        """
        Store response in cache.
        Returns True if successful.
        """
        ttl = ttl or self.ttl

        if self._use_redis and self._redis_client:
            success = self._set_redis(cache_key, data, ttl)
            if success:
                return True

        return self._set_memory(cache_key, data, ttl)

    def _set_redis(self, cache_key: str, data: dict[str, Any], ttl: int) -> bool:
        """Set in Redis."""
        try:
            serialized = json.dumps(data, ensure_ascii=False, default=str)
            self._redis_client.setex(cache_key, ttl, serialized)
            logger.debug("Cache SET (Redis): %s, TTL=%d", cache_key, ttl)
            return True
        except Exception as e:
            logger.warning("Redis set failed: %s", e)
            return False

    def _set_memory(self, cache_key: str, data: dict[str, Any], ttl: int) -> bool:
        """Set in memory cache with LRU eviction."""
        # Evict oldest entries if at capacity
        while len(self._memory_cache) >= self.MAX_MEMORY_ENTRIES:
            self._memory_cache.popitem(last=False)

        self._memory_cache[cache_key] = {
            "data": data,
            "expires_at": datetime.now(timezone.utc).timestamp() + ttl,
        }
        logger.debug("Cache SET (Memory): %s, TTL=%d", cache_key, ttl)
        return True

    def delete(self, cache_key: str) -> bool:
        """Delete cache entry."""
        deleted = False

        if self._use_redis and self._redis_client:
            try:
                self._redis_client.delete(cache_key)
                deleted = True
            except Exception:
                pass

        if cache_key in self._memory_cache:
            del self._memory_cache[cache_key]
            deleted = True

        return deleted

    def clear(self) -> int:
        """Clear all cache entries. Returns count of cleared entries."""
        count = 0

        if self._use_redis and self._redis_client:
            try:
                pattern = f"{self.CACHE_KEY_PREFIX}:*"
                keys = self._redis_client.keys(pattern)
                if keys:
                    count += self._redis_client.delete(*keys)
            except Exception as e:
                logger.warning("Redis clear failed: %s", e)

        memory_count = len(self._memory_cache)
        self._memory_cache.clear()
        count += memory_count

        logger.info("Cache cleared: %d entries", count)
        return count

    def stats(self) -> dict[str, Any]:
        """Get cache statistics."""
        stats = {
            "backend": "redis" if self._use_redis else "memory",
            "memory_entries": len(self._memory_cache),
            "max_memory_entries": self.MAX_MEMORY_ENTRIES,
            "ttl_seconds": self.ttl,
        }

        if self._use_redis and self._redis_client:
            try:
                pattern = f"{self.CACHE_KEY_PREFIX}:*"
                stats["redis_entries"] = len(self._redis_client.keys(pattern))
            except Exception:
                stats["redis_entries"] = "unknown"

        return stats


# Global cache instance
response_cache = ResponseCache(
    redis_url=settings.redis_url,
    ttl=ResponseCache.DEFAULT_TTL,
)
