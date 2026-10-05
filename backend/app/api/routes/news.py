from fastapi import APIRouter, Query, HTTPException, Path, Body
from typing import Optional, List, Dict, Any
import datetime
from backend.app.services.news.factory import NewsProviderFactory
from backend.app.services.news.cache import news_cache
from backend.app.services.news.pipeline import NewsAIPipeline
from backend.app.services.news.signal_fusion import SignalFusionEngine
from backend.app.services.news.digest import DailyDigestService
from backend.app.services.news.economic_calendar import EconomicCalendarService
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.ai_engine import AIEngine
from backend.app.services.paper_trading import paper_trading_service
from backend.app.services.cache_service import cache_service
from backend.app.services.news.worker import news_ingestion_worker

router = APIRouter(prefix="/api/news", tags=["Financial News Intelligence"])

# In-memory storage for user alerts and preferences (India-first defaults)
_user_alerts: List[Dict[str, Any]] = [
    {
        "id": 1,
        "symbol": "RELIANCE",
        "min_impact": 70.0,
        "sentiment_filter": "ALL",
        "is_active": True,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": 2,
        "symbol": "TCS",
        "min_impact": 75.0,
        "sentiment_filter": "ALL",
        "is_active": True,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
]

_user_preferences: Dict[str, Any] = {
    "preferred_markets": ["IN", "GLOBAL"],
    "preferred_sectors": ["FINANCE", "TECHNOLOGY", "ENERGY", "AUTO"],
    "watchlist": ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "NIFTY", "SENSEX"],
    "news_categories": ["BREAKING", "STOCK", "EARNINGS", "ECONOMY", "RBI_POLICY", "SEBI_REGULATION"],
    "min_impact_score": 40.0,
    "min_relevance_score": 50.0,
    "notification_enabled": True,
    "digest_time": "08:30",
    "language": "en"
}

@router.get("", response_model=Dict[str, Any])
async def get_news_feed(
    category: Optional[str] = Query(None, description="Category filter (e.g. BREAKING, STOCK, EARNINGS, etc.)"),
    symbol: Optional[str] = Query(None, description="Filter by ticker symbol"),
    sentiment: Optional[str] = Query(None, description="POSITIVE, NEUTRAL, NEGATIVE"),
    min_impact: Optional[float] = Query(None, description="Minimum impact score 0-100"),
    source: Optional[str] = Query(None, description="Filter by publisher/source name"),
    search: Optional[str] = Query(None, description="Search query string"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Main paginated financial news feed with multi-factor filtering,
    duplicate article grouping, and source transparency.
    """
    cache_key = f"news_feed_{category}_{symbol}_{sentiment}_{min_impact}_{source}_{search}"
    
    # 1. Try fetching from cached feed or worker's pre-ingested cache
    articles = None
    is_stale = False

    if symbol:
        cached_symbol = await cache_service.get_json(f"news:stock:{symbol.upper()}")
        if cached_symbol:
            articles = cached_symbol

    if not articles:
        cached_latest = await cache_service.get_json("news:latest")
        if cached_latest:
            articles = cached_latest

    # 2. If cache is empty, trigger worker to ingest and warm
    if not articles:
        try:
            await news_ingestion_worker.ingest_cycle()
            articles = await cache_service.get_json("news:latest") or []
        except Exception:
            fallback = NewsProviderFactory.get_provider()
            articles = await fallback.get_latest_news(limit=50)
            is_stale = True

    # Apply filters
    filtered = articles or []
    if category and category.upper() != "ALL":
        filtered = [a for a in filtered if a.get("category", "").upper() == category.upper()]
    if sentiment and sentiment.upper() != "ALL":
        filtered = [a for a in filtered if a.get("sentiment", "").upper() == sentiment.upper()]
    if min_impact is not None:
        filtered = [a for a in filtered if float(a.get("impact_score", 0)) >= min_impact]
    if source:
        filtered = [a for a in filtered if source.lower() in a.get("source", "").lower()]
    if search:
        s = search.lower()
        filtered = [
            a for a in filtered
            if s in a.get("title", "").lower() or s in a.get("summary", "").lower()
            or any(s in sym.lower() for sym in a.get("symbols", []))
        ]

    # Group duplicate articles across providers (Section 21)
    grouped = NewsAIPipeline.group_duplicates(filtered)

    # Paginate
    total_count = len(grouped)
    start_idx = (page - 1) * limit
    paginated = grouped[start_idx : start_idx + limit]

    active_provider = NewsProviderFactory.get_provider()
    provider_name = active_provider.__class__.__name__
    is_live = provider_name in ["AlphaVantageNewsProvider", "GNewsProvider"]

    return {
        "articles": paginated,
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total_count + limit - 1) // limit),
        "is_stale": is_stale,
        "provider": provider_name,
        "is_live": is_live,
        "status_message": "Live news feed active" if is_live else "Live news temporarily unavailable (API credentials pending). Curated educational archive displayed.",
        "last_updated": datetime.datetime.utcnow().isoformat() + "Z"
    }

@router.get("/latest", response_model=List[Dict[str, Any]])
async def get_latest_news(
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None)
):
    """Fetch latest real-time financial stories (cached with zero external delay)."""
    cached = await cache_service.get_json("news:latest")
    if cached:
        res = cached
        if category and category.upper() != "ALL":
            res = [a for a in res if a.get("category", "").upper() == category.upper()]
        return res[:limit]

    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_latest_news(limit=limit, category=category)
    await cache_service.set_json("news:latest", articles, ttl=300)
    return articles

@router.get("/breaking", response_model=List[Dict[str, Any]])
async def get_breaking_news(limit: int = Query(5, ge=1, le=20)):
    """Fetch urgent market-moving breaking news with systemic transmission warnings."""
    cached = await cache_service.get_json("news:breaking")
    if cached:
        return cached[:limit]

    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_breaking_news(limit=limit)
    await cache_service.set_json("news:breaking", articles, ttl=120)
    return articles

@router.get("/market", response_model=List[Dict[str, Any]])
async def get_market_news(limit: int = Query(15, ge=1, le=50)):
    """Fetch general macroeconomic, index, and monetary policy news."""
    cached = await cache_service.get_json("news:market")
    if cached:
        return cached[:limit]

    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_market_news(limit=limit)
    await cache_service.set_json("news:market", articles, ttl=300)
    return articles

@router.get("/stock/{symbol}", response_model=List[Dict[str, Any]])
async def get_stock_news(
    symbol: str = Path(..., description="Stock symbol (e.g. AAPL, NVDA, TCS)"),
    limit: int = Query(10, ge=1, le=30)
):
    """Fetch company-specific news and historical coverage for an asset."""
    sym = symbol.upper().strip()
    cached = await cache_service.get_json(f"news:stock:{sym}")
    if cached:
        return cached[:limit]

    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_stock_news(sym, limit=limit)
    await cache_service.set_json(f"news:stock:{sym}", articles, ttl=300)
    return articles

@router.get("/search", response_model=List[Dict[str, Any]])
async def search_news(
    q: str = Query(..., min_length=1, description="Keywords: ticker, company, central bank, topic"),
    limit: int = Query(20, ge=1, le=50)
):
    """Global search across headlines, bodies, and entity mappings."""
    query_lower = q.lower().strip()
    cache_key = f"news:search:{query_lower}"
    cached = await cache_service.get_json(cache_key)
    if cached:
        return cached[:limit]

    articles = await cache_service.get_json("news:latest")
    if not articles:
        provider = NewsProviderFactory.get_provider()
        articles = await provider.get_latest_news(limit=50)

    matches = [
        a for a in articles
        if query_lower in a.get("title", "").lower()
        or query_lower in a.get("summary", "").lower()
        or any(query_lower in sym.lower() for sym in a.get("symbols", []))
        or any(query_lower in cmp.lower() for cmp in a.get("companies", []))
    ]
    await cache_service.set_json(cache_key, matches, ttl=180)
    return matches[:limit]

@router.get("/digest/today", response_model=Dict[str, Any])
async def get_today_digest(digest_type: str = Query("MORNING_BRIEF", enum=["MORNING_BRIEF", "MARKET_CLOSE"])):
    """Get the official TradeGuard AI Daily Market Digest."""
    return await DailyDigestService.get_or_generate_digest(digest_type=digest_type)

@router.post("/digest/generate", response_model=Dict[str, Any])
async def generate_daily_digest(digest_type: str = Body("MORNING_BRIEF", embed=True)):
    """Force generate or refresh daily market digest with the latest ingestion data."""
    return await DailyDigestService.get_or_generate_digest(digest_type=digest_type, force_refresh=True)

@router.get("/sentiment/{symbol}", response_model=Dict[str, Any])
async def get_symbol_sentiment(symbol: str = Path(...)):
    """Calculates aggregated sentiment score, distribution, and timeline for an asset."""
    provider = NewsProviderFactory.get_provider()
    return await provider.get_news_sentiment(symbol)

@router.get("/impact/{symbol}", response_model=Dict[str, Any])
async def get_symbol_impact(symbol: str = Path(...)):
    """Analytical market impact overview for an asset."""
    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_stock_news(symbol, limit=10)
    
    max_impact = 0.0
    critical_events = []
    for a in articles:
        imp = float(a.get("impact_score", 0))
        if imp > max_impact:
            max_impact = imp
        if imp >= 75.0:
            critical_events.append({
                "headline": a.get("title"),
                "source": a.get("source"),
                "impact_score": imp,
                "importance": a.get("importance"),
                "published_at": a.get("published_at")
            })

    level = "CRITICAL" if max_impact >= 85 else ("HIGH" if max_impact >= 70 else ("MEDIUM" if max_impact >= 45 else "LOW"))

    return {
        "symbol": symbol.upper(),
        "max_impact_score": max_impact,
        "impact_level": level,
        "critical_events_count": len(critical_events),
        "critical_events": critical_events,
        "disclaimer": "Analytical estimate of news materiality. Does not guarantee market movement."
    }

@router.get("/fusion/{symbol}", response_model=Dict[str, Any])
async def get_signal_fusion(symbol: str = Path(...)):
    """
    Combined Technical Analysis + Financial News Signal Fusion:
    Produces unified probabilistic BUY / HOLD / SELL recommendations with
    complete factor context and Stellar blockchain audit receipt.
    """
    market_provider = MarketDataProvider.get_instance()
    ai_engine = AIEngine()
    news_provider = NewsProviderFactory.get_provider()

    # 1. Technical signal
    bars = await market_provider.get_historical_bars(symbol)
    tech_signal = ai_engine.generate_signal(bars, symbol)

    # 2. News intelligence
    sentiment_data = await news_provider.get_news_sentiment(symbol)
    articles = await news_provider.get_stock_news(symbol, limit=5)

    # 3. Fuse signals
    fusion = await SignalFusionEngine.fuse_signals(tech_signal, sentiment_data, articles, symbol)
    return fusion

@router.get("/economic-calendar", response_model=List[Dict[str, Any]])
async def get_economic_calendar():
    """Live and scheduled economic calendar events with affected asset transmission channels."""
    return EconomicCalendarService.get_calendar_events()

@router.get("/portfolio", response_model=Dict[str, Any])
async def get_portfolio_news():
    """Matches active user portfolio holdings against live news and checks for high-impact alerts."""
    portfolio = paper_trading_service.get_portfolio_summary()
    positions = portfolio.get("positions", [])
    news_provider = NewsProviderFactory.get_provider()

    portfolio_news_list = []
    high_impact_alerts = []

    for pos in positions:
        sym = pos["symbol"]
        articles = await news_provider.get_stock_news(sym, limit=3)
        sentiment = await news_provider.get_news_sentiment(sym)

        # Check for high-impact negative alerts (Section 25)
        for a in articles:
            if float(a.get("impact_score", 0)) >= 75 and a.get("sentiment") == "NEGATIVE":
                high_impact_alerts.append({
                    "symbol": sym,
                    "headline": a.get("title"),
                    "source": a.get("source"),
                    "impact_score": a.get("impact_score"),
                    "sentiment": a.get("sentiment"),
                    "ai_signal": pos.get("ai_recommendation", "HOLD"),
                    "action_note": "A high-impact negative article was detected. Informational review recommended."
                })

        portfolio_news_list.append({
            "symbol": sym,
            "position_shares": pos.get("quantity", 0),
            "market_value": pos.get("market_value", 0),
            "news_count": len(articles),
            "sentiment": sentiment.get("sentiment", "NEUTRAL"),
            "sentiment_score": sentiment.get("sentiment_score", 0.0),
            "latest_headline": articles[0].get("title") if articles else "No recent headlines",
            "articles": articles[:2]
        })

    return {
        "portfolio_holdings_count": len(positions),
        "holdings_news": portfolio_news_list,
        "high_impact_risk_alerts": high_impact_alerts
    }

@router.get("/watchlist", response_model=Dict[str, Any])
async def get_watchlist_news():
    """Personalized news feed for assets in the user's watchlist."""
    watchlist_symbols = _user_preferences.get("watchlist", ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"])
    news_provider = NewsProviderFactory.get_provider()

    watchlist_feed = {}
    for sym in watchlist_symbols:
        articles = await news_provider.get_stock_news(sym, limit=3)
        watchlist_feed[sym] = {
            "symbol": sym,
            "article_count": len(articles),
            "articles": articles
        }

    return {
        "watchlist": watchlist_symbols,
        "feed": watchlist_feed
    }

@router.get("/alerts", response_model=List[Dict[str, Any]])
async def get_news_alerts():
    """List configured news alerts."""
    return _user_alerts

@router.post("/alerts", response_model=Dict[str, Any])
async def create_news_alert(payload: Dict[str, Any] = Body(...)):
    """Create a new high-impact or sentiment threshold alert."""
    new_alert = {
        "id": len(_user_alerts) + 1,
        "symbol": payload.get("symbol", "AAPL").upper(),
        "min_impact": float(payload.get("min_impact", 70.0)),
        "sentiment_filter": payload.get("sentiment_filter", "ALL"),
        "is_active": True,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    _user_alerts.append(new_alert)
    return new_alert

@router.delete("/alerts/{alert_id}", response_model=Dict[str, Any])
async def delete_news_alert(alert_id: int = Path(...)):
    """Delete a configured alert."""
    global _user_alerts
    _user_alerts = [a for a in _user_alerts if a["id"] != alert_id]
    return {"status": "deleted", "id": alert_id}

@router.get("/preferences", response_model=Dict[str, Any])
async def get_preferences():
    """Retrieve user news intelligence preferences."""
    return _user_preferences

@router.post("/preferences", response_model=Dict[str, Any])
async def update_preferences(prefs: Dict[str, Any] = Body(...)):
    """Update user news preferences (markets, sectors, watchlist)."""
    global _user_preferences
    _user_preferences.update(prefs)
    return _user_preferences

@router.get("/report/daily", response_model=Dict[str, Any])
async def get_daily_report():
    """Downloadable / shareable PDF-ready daily market intelligence report."""
    digest = await DailyDigestService.get_or_generate_digest()
    cal = EconomicCalendarService.get_calendar_events()
    provider = NewsProviderFactory.get_provider()
    breaking = await provider.get_breaking_news(limit=3)

    return {
        "report_title": f"TradeGuard AI Daily Institutional Market Intelligence — {digest['date']}",
        "generated_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "market_digest": digest,
        "breaking_events": breaking,
        "economic_calendar": cal[:4],
        "compliance_disclaimer": "TradeGuard AI report is strictly an analytical decision-support compilation. Not financial advice."
    }

@router.get("/{article_id}", response_model=Dict[str, Any])
async def get_article_detail(article_id: int = Path(...)):
    """Detailed view for single article with AI summary, breakdown, and affected assets."""
    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_latest_news(limit=50)
    for a in articles:
        if a.get("id") == article_id:
            return a
    # If not found by numeric ID, return first match or raise 404
    if articles:
        return articles[0]
    raise HTTPException(status_code=404, detail="Article not found")

@router.get("/{article_id}/analysis", response_model=Dict[str, Any])
async def get_article_analysis(article_id: int = Path(...)):
    """Deep-dive quantitative and entity analysis for article."""
    provider = NewsProviderFactory.get_provider()
    articles = await provider.get_latest_news(limit=50)
    target = None
    for a in articles:
        if a.get("id") == article_id:
            target = a
            break
    if not target:
        target = articles[0] if articles else {}

    return {
        "article_id": article_id,
        "headline": target.get("title"),
        "source": target.get("source"),
        "sentiment_analysis": {
            "label": target.get("sentiment"),
            "score": target.get("sentiment_score"),
            "breakdown": target.get("sentiment_breakdown", {"positive": 70, "neutral": 20, "negative": 10}),
            "source_vs_ai": {
                "source_sentiment": target.get("source_sentiment", "NEUTRAL"),
                "tradeguard_ai_analysis": target.get("sentiment", "NEUTRAL")
            }
        },
        "market_impact": {
            "score": target.get("impact_score"),
            "level": target.get("importance"),
            "affected_assets": target.get("affected_assets", ["SPY", "QQQ"])
        },
        "ai_takeaways": target.get("ai_key_points", []),
        "ai_summary": target.get("ai_summary"),
        "ai_reasoning": target.get("ai_reasoning")
    }
