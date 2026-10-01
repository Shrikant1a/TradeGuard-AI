import time
import logging
from typing import Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from backend.app.services.cache_service import cache_service

logger = logging.getLogger("tradeguard.rate_limiter")

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window Redis/In-Memory Rate Limiting Middleware.
    Protects high-cost endpoints (AI, backtesting, market data) against abuse.
    """

    # Path prefixes and limits: (max_requests_per_minute)
    LIMIT_CONFIG = [
        ("/api/backtest", 15),
        ("/api/analysis", 25),
        ("/api/signals/generate", 25),
        ("/api/webhooks/tradingview", 60),
        ("/api/market-data", 180),
        ("/api/news", 180),
        ("/api/scanner", 60),
        ("/api", 300),  # General fallback
    ]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Bypass health and documentation endpoints
        if path in ("/health", "/api/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        # Determine rate limit bucket
        limit = 300
        bucket_name = "general"
        for prefix, max_reqs in self.LIMIT_CONFIG:
            if path.startswith(prefix):
                limit = max_reqs
                bucket_name = prefix.replace("/api/", "").replace("/", "_")
                break

        # Client identifier: IP or token
        client_ip = (
            request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            or (request.client.host if request.client else "127.0.0.1")
        )

        now_min = int(time.time() // 60)
        cache_key = f"ratelimit:{client_ip}:{bucket_name}:{now_min}"

        try:
            current_count = await cache_service.incr(cache_key, ttl=60)
            remaining = max(0, limit - current_count)

            if current_count > limit:
                logger.warning(f"Rate limit exceeded for {client_ip} on {path} ({current_count}/{limit})")
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Too Many Requests",
                        "detail": f"Rate limit exceeded for {bucket_name}. Limit is {limit} requests per minute.",
                        "retry_after_seconds": 60,
                        "disclaimer": "Rate limiting protects infrastructure from denial-of-service."
                    },
                    headers={
                        "Retry-After": "60",
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0"
                    }
                )

            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response

        except Exception as e:
            # Never crash requests if rate limiting encounters transient error
            logger.error(f"Rate limiter error: {e}")
            return await call_next(request)
