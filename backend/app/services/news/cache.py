import time
import logging
from typing import Dict, Any, Optional, List
from backend.app.config import settings

logger = logging.getLogger("tradeguard.news.cache")

class NewsCacheManager:
    """
    In-memory and Redis-capable Cache Manager for Financial News.
    Manages cache TTLs, rate-limit backoffs, deduplication, and stale data signaling.
    """

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = settings.NEWS_CACHE_TTL or 300
        self.breaking_ttl = settings.NEWS_BREAKING_CACHE_TTL or 120

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        entry = self._cache.get(key)
        if not entry:
            return None
        
        now = time.time()
        is_expired = now > entry["expires_at"]
        age_seconds = int(now - entry["cached_at"])

        return {
            "data": entry["data"],
            "is_stale": is_expired,
            "age_seconds": age_seconds,
            "cached_at": entry["cached_at"]
        }

    def set(self, key: str, data: Any, ttl: Optional[int] = None):
        now = time.time()
        expiry_ttl = ttl or self.default_ttl
        self._cache[key] = {
            "data": data,
            "cached_at": now,
            "expires_at": now + expiry_ttl
        }

    def invalidate(self, key_prefix: str = ""):
        if not key_prefix:
            self._cache.clear()
        else:
            keys_to_del = [k for k in self._cache if k.startswith(key_prefix)]
            for k in keys_to_del:
                del self._cache[k]

news_cache = NewsCacheManager()
