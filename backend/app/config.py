import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "TradeGuard AI"
    APP_VERSION: str = "1.2.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database (PostgreSQL with SQLite fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./tradeguard.db"
    )
    
    # Redis Cache (Optional fallback to in-memory)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tradeguard-super-secret-jwt-key-2026-audit-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    TRADINGVIEW_WEBHOOK_SECRET: str = os.getenv("TRADINGVIEW_WEBHOOK_SECRET", "tg_tv_sec_893b1657ff1fc53")
    
    # Stellar Soroban Blockchain
    STELLAR_NETWORK: str = os.getenv("STELLAR_NETWORK", "TESTNET")  # TESTNET / PUBLIC / LOCAL
    STELLAR_RPC_URL: str = os.getenv("STELLAR_RPC_URL", "https://soroban-testnet.stellar.org")
    STELLAR_CONTRACT_ID: str = os.getenv("STELLAR_CONTRACT_ID", "CCQJ2T75A2P2K4OQYZ6U3KBLQ6F364S432UYP3N75Z3Z5OQYZ6U3KBLQ")
    STELLAR_SECRET_KEY: Optional[str] = os.getenv("STELLAR_SECRET_KEY", None)

    # Risk Defaults (Virtual Currency: INR ₹)
    DEFAULT_CAPITAL: float = 1000000.0  # ₹10,00,000
    DEFAULT_MAX_RISK_PER_TRADE_PCT: float = 1.0  # 1%
    DEFAULT_MAX_PORTFOLIO_EXPOSURE_PCT: float = 40.0  # 40%
    DEFAULT_MAX_OPEN_POSITIONS: int = 5
    DEFAULT_MAX_DAILY_LOSS_PCT: float = 3.0  # 3%
    
    # Market Data
    DEFAULT_MARKET_PROVIDER: str = "yahoo" # yahoo / alphavantage / mock
    
    # Financial News Intelligence Configuration
    NEWS_PROVIDER: str = os.getenv("NEWS_PROVIDER", "alphavantage")  # alphavantage / gnews / demo
    ALPHAVANTAGE_API_KEY: Optional[str] = os.getenv("ALPHAVANTAGE_API_KEY", None)
    GNEWS_API_KEY: Optional[str] = os.getenv("GNEWS_API_KEY", None)
    NEWS_REFRESH_INTERVAL: int = int(os.getenv("NEWS_REFRESH_INTERVAL", "300"))  # seconds (default 5 min)
    NEWS_CACHE_TTL: int = int(os.getenv("NEWS_CACHE_TTL", "300"))  # seconds
    NEWS_BREAKING_CACHE_TTL: int = int(os.getenv("NEWS_BREAKING_CACHE_TTL", "120"))  # 2 min
    NEWS_MAX_ARTICLES: int = int(os.getenv("NEWS_MAX_ARTICLES", "50"))
    NEWS_API_RATE_LIMIT: int = int(os.getenv("NEWS_API_RATE_LIMIT", "5"))  # requests per minute
    AI_API_KEY: Optional[str] = os.getenv("AI_API_KEY", None)

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
