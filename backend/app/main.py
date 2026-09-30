from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.app.config import settings
from backend.app.db.database import engine, Base
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
    news
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tradeguard")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="TradeGuard AI - AI-Powered Trading Intelligence with Blockchain-Verified Decisions",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing TradeGuard AI Database schema...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(f"Database schema initialization warning: {e}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "blockchain_network": settings.STELLAR_NETWORK,
        "stellar_contract": settings.STELLAR_CONTRACT_ID,
        "market_provider": settings.DEFAULT_MARKET_PROVIDER,
        "disclaimer": "TradeGuard AI provides market analysis and research tools. It does not guarantee future performance or profits."
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "disclaimer": "All analysis is probabilistic."
        }
    )
