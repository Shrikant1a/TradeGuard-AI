from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from sqlalchemy import text

from backend.app.config import settings
from backend.app.db.database import engine, Base
from backend.app.api.middleware.rate_limiter import RateLimitMiddleware
from backend.app.services.cache_service import cache_service
from backend.app.services.job_queue import job_queue
from backend.app.services.news.worker import news_ingestion_worker
from backend.app.services.circuit_breaker import (
    market_circuit_breaker, news_circuit_breaker, stellar_circuit_breaker, ai_circuit_breaker
)
from backend.app.api.routes import (
    assets,
    market_data,
    analysis,
    signals,
    backtest,
    paper_trades,
    portfolio,
    risk,
    webhooks,
    blockchain,
    strategies,
    alerts,
    copilot,
    scanner,
    news,
    bot_training
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tradeguard")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="TradeGuard AI - AI-Powered Trading Intelligence with Blockchain-Verified Decisions",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)

# 2. GZip Response Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3. CORS configuration for Next.js frontend
configured_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
if settings.ENVIRONMENT == "development" and not any("localhost" in o for o in configured_origins):
    configured_origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(assets.router)
app.include_router(market_data.router)
app.include_router(analysis.router)
app.include_router(signals.router)
app.include_router(backtest.router)
app.include_router(paper_trades.router)
app.include_router(portfolio.router)
app.include_router(risk.router)
app.include_router(webhooks.router)
app.include_router(blockchain.router)
app.include_router(strategies.router)
app.include_router(alerts.router)
app.include_router(copilot.router)
app.include_router(scanner.router)
app.include_router(news.router)
app.include_router(bot_training.router)

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing TradeGuard AI infrastructure...")

    # Optional Sentry Monitoring
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=settings.ENVIRONMENT,
                traces_sample_rate=0.2 if settings.ENVIRONMENT == "production" else 1.0,
            )
            logger.info("Sentry monitoring initialized successfully.")
        except Exception as e:
            logger.warning(f"Sentry monitoring initialization skipped: {e}")

    # Initialize Redis / In-Memory Cache
    await cache_service.initialize()

    # Initialize Database Schema
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema validated successfully.")
    except Exception as e:
        logger.warning(f"Database schema initialization warning: {e}")

    # Start Decoupled News Ingestion Worker if in embedded worker mode
    if settings.RUN_EMBEDDED_WORKER:
        news_ingestion_worker.start()
        logger.info("TradeGuard AI embedded news worker started.")
    else:
        logger.info("Embedded worker disabled (RUN_EMBEDDED_WORKER=false). Background worker container will handle scheduled jobs.")

    logger.info("TradeGuard AI production services ready.")

@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Shutting down TradeGuard AI services...")
    if settings.RUN_EMBEDDED_WORKER:
        news_ingestion_worker.stop()

@app.get("/health")
async def liveness_check():
    """
    Lightweight Liveness Probe for Docker / Kubernetes / ECS orchestrators.
    Returns immediately to confirm ASGI server process is healthy.
    """
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time()
    }

@app.get("/health/ready")
@app.get("/api/health")
async def readiness_check():
    """
    Production Deep Health & Readiness Check probing:
    Database, Redis/Cache, Market Data, News Worker, Stellar RPC, and Circuit Breakers.
    """
    t0 = time.time()
    components = {}
    overall_status = "healthy"

    # 1. Probe Database
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - t0) * 1000, 2)
        components["database"] = {"status": "UP", "latency_ms": db_latency_ms}
    except Exception as e:
        components["database"] = {"status": "DOWN", "error": str(e)}
        overall_status = "degraded"

    # 2. Probe Cache (Redis or Memory)
    cache_stats = cache_service.get_stats()
    components["cache"] = {
        "status": "UP",
        "backend": cache_stats["backend"],
        "hit_ratio_pct": cache_stats["hit_ratio_pct"],
        "entries": cache_stats["memory_cache_entries"]
    }

    # 3. Circuit Breaker States
    components["circuit_breakers"] = {
        "market_data": market_circuit_breaker.get_status(),
        "news_api": news_circuit_breaker.get_status(),
        "stellar_rpc": stellar_circuit_breaker.get_status(),
        "ai_engine": ai_circuit_breaker.get_status()
    }
    if any(b["state"] == "OPEN" for b in components["circuit_breakers"].values()):
        overall_status = "degraded"

    # 4. Background Job Queue Stats
    components["job_queue"] = job_queue.get_stats()

    # 5. News Ingestion Worker Status
    components["news_worker"] = news_ingestion_worker.get_status()

    return {
        "status": overall_status,
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time(),
        "components": components,
        "blockchain": {
            "network": settings.STELLAR_NETWORK,
            "contract": settings.STELLAR_CONTRACT_ID
        },
        "disclaimer": "TradeGuard AI provides market analysis and research tools. All calculations are probabilistic."
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An internal error occurred. Our automated resilience safeguards have recorded this incident.",
            "disclaimer": "All analysis is probabilistic."
        }
    )
