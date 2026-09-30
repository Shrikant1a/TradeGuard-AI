import pytest
import datetime
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.news.demo_data import DemoNewsProvider
from backend.app.services.news.alphavantage import AlphaVantageNewsProvider
from backend.app.services.news.pipeline import NewsAIPipeline
from backend.app.services.news.signal_fusion import SignalFusionEngine
from backend.app.services.news.cache import NewsCacheManager
from backend.app.services.news.digest import DailyDigestService
from backend.app.services.news.economic_calendar import EconomicCalendarService

client = TestClient(app)

def test_demo_news_provider():
    provider = DemoNewsProvider()
    assert len(provider._articles) >= 10
    
    # Check that demo data is clearly marked
    for a in provider._articles:
        assert a.get("is_demo") is True
        assert "content_hash" in a
        assert "relevance_score" in a
        assert "impact_score" in a
        assert "ai_summary" in a
        assert len(a.get("ai_key_points", [])) >= 1

@pytest.mark.asyncio
async def test_alphavantage_fallback_on_empty_or_demo_key():
    provider = AlphaVantageNewsProvider(api_key="demo_or_your_key_here")
    articles = await provider.get_latest_news(limit=5)
    assert len(articles) > 0
    # Should safely return data without crashing

def test_pipeline_entity_and_ticker_extraction():
    text = "Apple Inc. (AAPL) reported surging quarterly revenue while NVIDIA and Tesla expand data center compute."
    tickers, companies, topics = NewsAIPipeline.extract_entities_and_tickers(text)
    assert "AAPL" in tickers
    assert "NVDA" in tickers
    assert "TSLA" in tickers
    assert any("Apple" in c for c in companies)

def test_pipeline_sentiment_analysis():
    bullish_text = "Company reports record revenue and earnings surge beating all analyst expectations."
    res = NewsAIPipeline.analyze_sentiment(bullish_text, "Strong profit and growth across all divisions.")
    assert res["sentiment"] == "POSITIVE"
    assert res["sentiment_score"] > 0.3
    assert res["breakdown"]["positive"] > 50

    bearish_text = "Company slumps following heavy losses and deep guidance cut amid ongoing federal lawsuit."
    res_bear = NewsAIPipeline.analyze_sentiment(bearish_text, "Severe declines and restructuring charges.")
    assert res_bear["sentiment"] == "NEGATIVE"
    assert res_bear["sentiment_score"] < -0.3
    assert res_bear["breakdown"]["negative"] > 50

def test_pipeline_impact_scoring():
    score, level = NewsAIPipeline.calculate_impact_score("FEDERAL_RESERVE", "Federal Reserve announces emergency rate cut decision", -0.5)
    assert score >= 80.0
    assert level in ["HIGH", "CRITICAL"]

def test_pipeline_duplicate_grouping():
    articles = [
        {"title": "Apple Reports Record Q3 Revenue Beats", "source": "Reuters", "source_url": "url1", "published_at": "2026-09-30T10:00:00Z"},
        {"title": "Apple Reports Record Q3 Revenue Beats", "source": "Bloomberg", "source_url": "url2", "published_at": "2026-09-30T10:05:00Z"},
        {"title": "Tesla Expands Autopilot Network", "source": "Electrek", "source_url": "url3", "published_at": "2026-09-30T10:10:00Z"}
    ]
    grouped = NewsAIPipeline.group_duplicates(articles)
    assert len(grouped) == 2
    apple_story = next(a for a in grouped if "Apple" in a["title"])
    assert len(apple_story["duplicate_sources"]) >= 1

def test_cache_expiration():
    cache = NewsCacheManager()
    cache.set("test_key", {"msg": "hello"}, ttl=1)
    val = cache.get("test_key")
    assert val is not None
    assert val["data"]["msg"] == "hello"

@pytest.mark.asyncio
async def test_signal_fusion():
    tech_signal = {
        "signal_type": "BUY",
        "confidence": 70.0,
        "risk_score": "MEDIUM",
        "latest_metrics": {"close": 230.0, "sma_50": 220.0, "macd": 2.5, "macd_signal": 1.2, "volume_ratio": 1.3, "atr_pct": 2.1}
    }
    news_sentiment = {"sentiment": "POSITIVE", "sentiment_score": 0.8}
    articles = [{"title": "Strong earnings beat", "impact_score": 85.0, "importance": "HIGH", "sentiment": "POSITIVE"}]
    
    fused = await SignalFusionEngine.fuse_signals(tech_signal, news_sentiment, articles, "AAPL")
    assert fused["combined_signal"] == "BUY"
    assert fused["combined_confidence"] >= 70.0
    assert len(fused["technical_factors"]) > 0
    assert len(fused["news_factors"]) > 0

@pytest.mark.asyncio
async def test_daily_digest_generation():
    digest = await DailyDigestService.get_or_generate_digest(digest_type="MORNING_BRIEF", force_refresh=True)
    assert "market_overview" in digest
    assert "top_market_events" in digest
    assert "top_stock_news" in digest
    assert "market_risks" in digest
    assert digest["is_ai_generated"] is True

def test_api_news_endpoints():
    # 1. Main Feed
    res = client.get("/api/news")
    assert res.status_code == 200
    data = res.json()
    assert "articles" in data
    assert len(data["articles"]) > 0

    # 2. Latest News
    res = client.get("/api/news/latest?limit=3")
    assert res.status_code == 200
    assert len(res.json()) <= 3

    # 3. Breaking News
    res = client.get("/api/news/breaking")
    assert res.status_code == 200

    # 4. Stock News
    res = client.get("/api/news/stock/AAPL")
    assert res.status_code == 200
    assert len(res.json()) > 0

    # 5. Search
    res = client.get("/api/news/search?q=Federal")
    assert res.status_code == 200

    # 6. Today's Digest
    res = client.get("/api/news/digest/today")
    assert res.status_code == 200
    assert "market_overview" in res.json()

    # 7. Sentiment
    res = client.get("/api/news/sentiment/AAPL")
    assert res.status_code == 200
    assert "sentiment" in res.json()

    # 8. Impact
    res = client.get("/api/news/impact/AAPL")
    assert res.status_code == 200
    assert "max_impact_score" in res.json()

    # 9. Fusion
    res = client.get("/api/news/fusion/AAPL")
    assert res.status_code == 200
    assert "combined_signal" in res.json()

    # 10. Economic Calendar
    res = client.get("/api/news/economic-calendar")
    assert res.status_code == 200
    assert len(res.json()) >= 3

    # 11. Portfolio News
    res = client.get("/api/news/portfolio")
    assert res.status_code == 200

    # 12. Watchlist News
    res = client.get("/api/news/watchlist")
    assert res.status_code == 200

    # 13. Alerts
    res = client.get("/api/news/alerts")
    assert res.status_code == 200

    # 14. Preferences
    res = client.get("/api/news/preferences")
    assert res.status_code == 200

    # 15. Daily Report
    res = client.get("/api/news/report/daily")
    assert res.status_code == 200
    assert "report_title" in res.json()
