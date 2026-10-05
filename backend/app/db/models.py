import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, 
    Text, JSON, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="trader") # trader, analyst, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    risk_policies = relationship("RiskPolicy", back_populates="user", cascade="all, delete-orphan")
    paper_trades = relationship("PaperTrade", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    asset_type = Column(String(20), default="equity") # equity, crypto, forex, commodity
    exchange = Column(String(20), default="NASDAQ")
    currency = Column(String(10), default="USD")
    sector = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    market_data = relationship("MarketData", back_populates="asset")
    signals = relationship("Signal", back_populates="asset")
    positions = relationship("Position", back_populates="asset")

class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    provider = Column(String(50), default="yahoo")

    asset = relationship("Asset", back_populates="market_data")

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    sma_20 = Column(Float, nullable=True)
    sma_50 = Column(Float, nullable=True)
    sma_200 = Column(Float, nullable=True)
    ema_20 = Column(Float, nullable=True)
    ema_50 = Column(Float, nullable=True)
    rsi = Column(Float, nullable=True)
    macd = Column(Float, nullable=True)
    macd_signal = Column(Float, nullable=True)
    macd_hist = Column(Float, nullable=True)
    bollinger_upper = Column(Float, nullable=True)
    bollinger_lower = Column(Float, nullable=True)
    bollinger_middle = Column(Float, nullable=True)
    atr = Column(Float, nullable=True)
    support = Column(Float, nullable=True)
    resistance = Column(Float, nullable=True)
    regime = Column(String(50), nullable=True) # Trending Bullish, Neutral, Volatile

class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # LogisticRegression, RandomForest, GradientBoosting
    model_family = Column(String(50), default="ensemble")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    versions = relationship("ModelVersion", back_populates="model")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    version_tag = Column(String(50), unique=True, index=True, nullable=False) # e.g. TradeGuard-v1.2
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    validation_type = Column(String(50), default="walk-forward")
    features_used = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    model = relationship("AIModel", back_populates="versions")
    signals = relationship("Signal", back_populates="model_version")

class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    signal_code = Column(String(50), unique=True, index=True, nullable=False) # TG-1042
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    symbol = Column(String(20), index=True, nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    
    signal_type = Column(String(10), nullable=False) # BUY, HOLD, SELL
    timeframe = Column(String(10), default="1D") # 1D, 5D, 20D
    
    bullish_prob = Column(Float, nullable=False)
    neutral_prob = Column(Float, nullable=False)
    bearish_prob = Column(Float, nullable=False)
    
    confidence_score = Column(Float, nullable=False) # e.g. 72%
    risk_score = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH
    
    current_price = Column(Float, nullable=False)
    suggested_entry = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    suggested_position_size = Column(Float, nullable=False) # In units or %
    
    signal_hash = Column(String(64), index=True, nullable=False) # SHA-256
    blockchain_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_signals_symbol_created", "symbol", "created_at"),
        Index("ix_signals_type_created", "signal_type", "created_at"),
    )

    asset = relationship("Asset", back_populates="signals")
    model_version = relationship("ModelVersion", back_populates="signals")
    explanation = relationship("SignalExplanation", back_populates="signal", uselist=False, cascade="all, delete-orphan")
    blockchain_record = relationship("BlockchainRecord", back_populates="signal", uselist=False)

class SignalExplanation(Base):
    __tablename__ = "signal_explanations"

    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), nullable=False, unique=True)
    
    positive_factors = Column(JSON, nullable=False) # List of factors
    risk_factors = Column(JSON, nullable=False)     # List of risk warnings
    indicator_weights = Column(JSON, nullable=True) # Feature contributions
    market_regime = Column(String(50), nullable=True)
    final_reasoning = Column(Text, nullable=False)
    disclaimer = Column(Text, nullable=False)

    signal = relationship("Signal", back_populates="explanation")

class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(20), default="v1.0")
    description = Column(Text, nullable=True)
    parameters = Column(JSON, nullable=False) # RSI period, EMA fast, EMA slow, ATR mult, etc.
    strategy_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    backtests = relationship("Backtest", back_populates="strategy")

class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    symbol = Column(String(20), index=True, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    initial_capital = Column(Float, nullable=False)
    final_capital = Column(Float, nullable=False)
    total_return_pct = Column(Float, nullable=False)
    
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    
    max_drawdown_pct = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    
    equity_curve = Column(JSON, nullable=True)   # Array of [{timestamp, equity, drawdown}]
    trade_history = Column(JSON, nullable=True)  # Array of completed simulated trades
    monthly_returns = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    strategy = relationship("Strategy", back_populates="backtests")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="TradeGuard Primary Paper Portfolio")
    virtual_balance = Column(Float, default=1000000.0) # Virtual INR ₹10,00,000
    initial_capital = Column(Float, default=1000000.0)
    total_equity = Column(Float, default=1000000.0)
    realized_pnl = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolios")
    positions = relationship("Position", back_populates="portfolio", cascade="all, delete-orphan")
    paper_trades = relationship("PaperTrade", back_populates="portfolio")

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    symbol = Column(String(20), index=True, nullable=False)
    
    side = Column(String(10), default="LONG") # LONG or SHORT
    quantity = Column(Float, nullable=False)
    average_entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    
    unrealized_pnl = Column(Float, default=0.0)
    unrealized_pnl_pct = Column(Float, default=0.0)
    allocation_pct = Column(Float, default=0.0)
    risk_level = Column(String(20), default="MEDIUM")
    
    ai_recommendation = Column(String(20), default="HOLD") # Live AI verdict for active position
    is_open = Column(Boolean, default=True)
    opened_at = Column(DateTime, default=datetime.datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_positions_portfolio_open", "portfolio_id", "is_open"),
        Index("ix_positions_symbol_open", "symbol", "is_open"),
    )

    portfolio = relationship("Portfolio", back_populates="positions")
    asset = relationship("Asset", back_populates="positions")

class PaperTrade(Base):
    __tablename__ = "paper_trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    symbol = Column(String(20), index=True, nullable=False)
    
    order_type = Column(String(20), default="MARKET") # MARKET, LIMIT
    side = Column(String(10), nullable=False) # BUY, SELL
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    risk_amount = Column(Float, nullable=True)
    potential_profit = Column(Float, nullable=True)
    risk_reward_ratio = Column(Float, nullable=True)
    
    status = Column(String(20), default="EXECUTED") # EXECUTED, BLOCKED, REJECTED, CANCELLED
    rejection_reason = Column(Text, nullable=True)
    blockchain_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_paper_trades_user_created", "user_id", "created_at"),
        Index("ix_paper_trades_status", "status"),
        Index("ix_paper_trades_portfolio_created", "portfolio_id", "created_at"),
    )

    user = relationship("User", back_populates="paper_trades")
    portfolio = relationship("Portfolio", back_populates="paper_trades")

class RiskPolicy(Base):
    __tablename__ = "risk_policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    max_risk_per_trade_pct = Column(Float, default=1.0)
    max_daily_loss_pct = Column(Float, default=3.0)
    max_portfolio_exposure_pct = Column(Float, default=40.0)
    max_position_size_pct = Column(Float, default=15.0)
    max_open_positions = Column(Integer, default=5)
    require_stop_loss = Column(Boolean, default=True)
    require_take_profit = Column(Boolean, default=True)
    max_volatility_threshold_atr_pct = Column(Float, default=4.0)
    circuit_breaker_active = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="risk_policies")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symbol = Column(String(20), index=True, nullable=False)
    alert_type = Column(String(50), nullable=False) # AI_BUY, AI_SELL, RISK_LIMIT, STOP_LOSS, WEBHOOK, VOLATILITY
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO") # INFO, WARNING, CRITICAL, SUCCESS
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_alerts_user_read", "user_id", "is_read"),
    )

    user = relationship("User", back_populates="alerts")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(50), default="tradingview")
    symbol = Column(String(20), index=True, nullable=False)
    signal = Column(String(20), nullable=False)
    price = Column(Float, nullable=True)
    volume = Column(Float, nullable=True)
    raw_payload = Column(JSON, nullable=False)
    ip_address = Column(String(50), nullable=True)
    is_processed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_webhook_events_symbol_created", "symbol", "created_at"),
    )

class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), nullable=True, unique=True)
    signal_code = Column(String(50), index=True, nullable=False)
    asset_symbol = Column(String(20), nullable=False)
    signal_type = Column(String(10), nullable=False)
    
    signal_hash = Column(String(64), unique=True, index=True, nullable=False)
    strategy_hash = Column(String(64), nullable=False)
    user_reference_hash = Column(String(64), nullable=False)
    model_version = Column(String(50), nullable=False)
    risk_level = Column(String(20), nullable=False)
    
    stellar_tx_hash = Column(String(128), index=True, nullable=True)
    stellar_contract_id = Column(String(100), nullable=False)
    stellar_ledger_seq = Column(Integer, nullable=True, default=None)
    network = Column(String(20), default="TESTNET")
    verification_status = Column(String(20), default="PENDING") # VERIFIED, PENDING, FAILED
    explorer_url = Column(String(255), nullable=True)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_blockchain_records_status_verified", "verification_status", "verified_at"),
    )

    signal = relationship("Signal", back_populates="blockchain_record")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False) # SIGNAL_GENERATED, TRADE_BLOCKED, BLOCKCHAIN_VERIFIED, etc.
    details = Column(JSON, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("ix_audit_logs_user_ts", "user_id", "timestamp"),
        Index("ix_audit_logs_action_ts", "action", "timestamp"),
    )

    user = relationship("User", back_populates="audit_logs")


# =====================================================================
# Financial News Intelligence Models
# =====================================================================

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)
    source_url = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    author = Column(String(100), nullable=True)
    published_at = Column(DateTime, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    language = Column(String(10), default="en")
    
    # Categories: BREAKING, STOCK, EARNINGS, MARKET, ECONOMY, FEDERAL_RESERVE,
    # INTEREST_RATES, INFLATION, IPO, MERGER_ACQUISITION, CRYPTO, TECHNOLOGY,
    # ENERGY, BANKING, FINANCE, GLOBAL_MARKETS, SECTOR, OTHER
    category = Column(String(50), index=True, default="MARKET")
    
    symbols = Column(JSON, default=list)       # e.g. ["AAPL", "NVDA"]
    companies = Column(JSON, default=list)     # e.g. ["Apple Inc", "NVIDIA Corp"]
    topics = Column(JSON, default=list)        # e.g. ["technology", "earnings"]
    
    # Sentiment & Analytics
    sentiment = Column(String(20), default="NEUTRAL")  # POSITIVE, NEUTRAL, NEGATIVE
    sentiment_score = Column(Float, default=0.0)       # -1.0 to +1.0
    sentiment_breakdown = Column(JSON, default=dict)   # {"positive": 80, "neutral": 15, "negative": 5}
    source_sentiment = Column(String(20), nullable=True)
    
    relevance_score = Column(Float, default=80.0)      # 0 to 100
    impact_score = Column(Float, default=50.0)         # 0 to 100
    importance = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    
    # AI Intelligence
    ai_summary = Column(Text, nullable=True)
    ai_key_points = Column(JSON, default=list)         # List of bullet takeaway points
    ai_reasoning = Column(Text, nullable=True)
    affected_assets = Column(JSON, default=list)       # e.g. ["SPY", "QQQ", "BANKS"]
    
    # Metadata & Tracking
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    provider = Column(String(50), default="alphavantage") # alphavantage, gnews, demo
    provider_article_id = Column(String(200), nullable=True)
    content_hash = Column(String(64), index=True, nullable=False)
    is_breaking = Column(Boolean, default=False)
    is_processed = Column(Boolean, default=True)
    is_duplicate = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    duplicate_sources = Column(JSON, default=list)     # List of [{source, url, published_at}]
    blockchain_tx_hash = Column(String(128), nullable=True)

    __table_args__ = (
        Index("ix_news_articles_cat_pub", "category", "published_at"),
        Index("ix_news_articles_pub_impact", "published_at", "impact_score"),
        Index("ix_news_articles_provider_article", "provider", "provider_article_id"),
        Index("ix_news_articles_breaking", "is_breaking", "published_at"),
    )


class NewsSource(Base):
    __tablename__ = "news_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    domain = Column(String(100), nullable=True)
    tier = Column(String(20), default="TIER_1")  # TIER_1, TIER_2, BLOG
    reliability_score = Column(Float, default=0.9)
    is_active = Column(Boolean, default=True)


class NewsTopic(Base):
    __tablename__ = "news_topics"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)


class NewsCompany(Base):
    __tablename__ = "news_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    ticker = Column(String(20), index=True, nullable=True)
    sector = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    market = Column(String(20), default="US")  # US, IN, GLOBAL


class NewsTicker(Base):
    __tablename__ = "news_tickers"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    exchange = Column(String(20), default="NASDAQ")
    asset_type = Column(String(20), default="EQUITY")  # EQUITY, CRYPTO, FOREX, COMMODITY, INDEX
    currency = Column(String(10), default="USD")
    timezone = Column(String(50), default="America/New_York")


class NewsSentiment(Base):
    __tablename__ = "news_sentiments"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    sentiment_date = Column(DateTime, index=True, nullable=False)
    avg_score = Column(Float, default=0.0)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    dominant_sentiment = Column(String(20), default="NEUTRAL")


class NewsImpact(Base):
    __tablename__ = "news_impacts"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("news_articles.id"), nullable=True)
    symbol = Column(String(20), index=True, nullable=False)
    impact_level = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    impact_score = Column(Float, default=50.0)
    reasoning = Column(Text, nullable=True)


class NewsAlert(Base):
    __tablename__ = "news_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symbol = Column(String(20), index=True, nullable=False)
    min_impact = Column(Float, default=70.0)
    sentiment_filter = Column(String(20), nullable=True) # POSITIVE, NEGATIVE, ALL
    is_active = Column(Boolean, default=True)
    last_triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class NewsDigest(Base):
    __tablename__ = "news_digests"

    id = Column(Integer, primary_key=True, index=True)
    digest_date = Column(DateTime, index=True, nullable=False)
    digest_type = Column(String(30), default="MORNING_BRIEF") # MORNING_BRIEF, MARKET_CLOSE
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    market_overview = Column(JSON, default=dict)
    top_events = Column(JSON, default=list)
    top_stock_news = Column(JSON, default=list)
    market_risks = Column(JSON, default=list)
    is_ai_generated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class NewsProviderEvent(Base):
    __tablename__ = "news_provider_events"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False) # FETCH_LATEST, FETCH_TICKER, RATE_LIMIT, ERROR
    status_code = Column(Integer, default=200)
    message = Column(Text, nullable=True)
    response_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class NewsProcessingLog(Base):
    __tablename__ = "news_processing_logs"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, nullable=True)
    stage = Column(String(50), nullable=False) # INGESTION, DEDUPLICATION, SENTIMENT, SUMMARIZATION
    status = Column(String(20), default="SUCCESS")
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class UserNewsPreference(Base):
    __tablename__ = "user_news_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    preferred_markets = Column(JSON, default=lambda: ["US", "IN", "CRYPTO"])
    preferred_sectors = Column(JSON, default=lambda: ["TECHNOLOGY", "FINANCE", "ENERGY"])
    watchlist = Column(JSON, default=lambda: ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"])
    news_categories = Column(JSON, default=lambda: ["BREAKING", "STOCK", "EARNINGS", "ECONOMY"])
    min_impact_score = Column(Float, default=40.0)
    min_relevance_score = Column(Float, default=50.0)
    notification_enabled = Column(Boolean, default=True)
    digest_time = Column(String(10), default="08:30")
    language = Column(String(10), default="en")


class WatchlistNewsSubscription(Base):
    __tablename__ = "watchlist_news_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symbol = Column(String(20), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

