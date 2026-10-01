import asyncio
import json
import logging
import time
from typing import Any, Dict, Optional, Union
from backend.app.config import settings

logger = logging.getLogger("tradeguard.cache")

class ResilientCacheService:
    """
    Unified Redis Cache Service with Zero-Downtime In-Memory Fallback.
    Handles serialization, TTL expiration, metrics (hits/misses),
    and automatic failover when Redis is unreachable or unconfigured.
    """

    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self._redis_client = None
        self._is_redis_connected = False
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        
        # Metrics
        self.hits = 0
        self.misses = 0
        self.sets = 0

    async def initialize(self):
        """Attempts to connect to Redis if REDIS_URL is provided"""
        if not self.redis_url:
            logger.info("No REDIS_URL configured; using high-performance In-Memory cache engine.")
            self._is_redis_connected = False
            return

        try:
            import redis.asyncio as aioredis
            self._redis_client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0
            )
            await self._redis_client.ping()
            self._is_redis_connected = True
            logger.info("Connected successfully to Redis server.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis ({e}); falling back to In-Memory cache.")
            self._is_redis_connected = False

    @property
    def is_redis_active(self) -> bool:
        return self._is_redis_connected

    async def get(self, key: str) -> Optional[str]:
        """Fetch raw string from Redis or memory fallback"""
        if self._is_redis_connected and self._redis_client:
            try:
                val = await self._redis_client.get(key)
                if val is not None:
                    self.hits += 1
                    return val
                self.misses += 1
                return None
            except Exception as e:
                logger.warning(f"Redis get failed ({e}), falling back to memory.")
                self._is_redis_connected = False

        # Memory fallback
        async with self._lock:
            entry = self._memory_cache.get(key)
            if not entry:
                self.misses += 1
                return None
            if entry["expires_at"] and time.time() > entry["expires_at"]:
                del self._memory_cache[key]
                self.misses += 1
                return None
            self.hits += 1
            return entry["value"]

    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """Store string in Redis or memory fallback with TTL in seconds"""
        self.sets += 1
        if self._is_redis_connected and self._redis_client:
            try:
                if ttl:
                    await self._redis_client.setex(key, ttl, value)
                else:
                    await self._redis_client.set(key, value)
                return True
            except Exception as e:
                logger.warning(f"Redis set failed ({e}), falling back to memory.")
                self._is_redis_connected = False

        # Memory fallback
        async with self._lock:
            expires_at = time.time() + ttl if ttl else None
            self._memory_cache[key] = {
                "value": value,
                "expires_at": expires_at
            }
            # Periodic memory prune if exceeding 5000 items
            if len(self._memory_cache) > 5000:
                self._prune_memory_cache()
            return True

    async def get_json(self, key: str) -> Optional[Any]:
        """Fetch and deserialize JSON from cache"""
        raw = await self.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    async def set_json(self, key: str, data: Any, ttl: Optional[int] = None) -> bool:
        """Serialize and store JSON in cache with TTL"""
        try:
            raw = json.dumps(data, default=str)
            return await self.set(key, raw, ttl=ttl)
        except Exception as e:
            logger.error(f"Cache serialization error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Remove key from cache"""
        if self._is_redis_connected and self._redis_client:
            try:
                await self._redis_client.delete(key)
            except Exception:
                pass
        async with self._lock:
            self._memory_cache.pop(key, None)
        return True

    async def incr(self, key: str, ttl: Optional[int] = None) -> int:
        """Atomic increment for rate-limiting counters"""
        if self._is_redis_connected and self._redis_client:
            try:
                val = await self._redis_client.incr(key)
                if val == 1 and ttl:
                    await self._redis_client.expire(key, ttl)
                return val
            except Exception as e:
                logger.warning(f"Redis incr failed ({e}), falling back to memory.")
                self._is_redis_connected = False

        async with self._lock:
            now = time.time()
            entry = self._memory_cache.get(key)
            if not entry or (entry["expires_at"] and now > entry["expires_at"]):
                self._memory_cache[key] = {
                    "value": "1",
                    "expires_at": now + ttl if ttl else None
                }
                return 1
            else:
                new_val = int(entry["value"]) + 1
                entry["value"] = str(new_val)
                return new_val

    def _prune_memory_cache(self):
        now = time.time()
        expired = [k for k, v in self._memory_cache.items() if v["expires_at"] and now > v["expires_at"]]
        for k in expired:
            del self._memory_cache[k]

    def get_stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_ratio = round((self.hits / total) * 100, 2) if total > 0 else 0.0
        return {
            "backend": "redis" if self._is_redis_connected else "in_memory",
            "hits": self.hits,
            "misses": self.misses,
            "sets": self.sets,
            "hit_ratio_pct": hit_ratio,
            "memory_cache_entries": len(self._memory_cache)
        }

# Global Singleton
cache_service = ResilientCacheService()
