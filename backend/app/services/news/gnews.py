import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.config import settings
from backend.app.services.news.base import NewsProvider
from backend.app.services.news.demo_data import DemoNewsProvider

logger = logging.getLogger("tradeguard.news.gnews")

class GNewsProvider(NewsProvider):
    """
    GNews Financial Provider Integration.
    Demonstrates extensible multi-provider architecture.
    """

    BASE_URL = "https://gnews.io/api/v4"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GNEWS_API_KEY
        self.demo_fallback = DemoNewsProvider()

    async def get_latest_news(self, limit: int = 20, category: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.api_key:
            return await self.demo_fallback.get_latest_news(limit, category)
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{self.BASE_URL}/top-headlines",
                    params={"category": "business", "token": self.api_key, "max": limit, "lang": "en"}
                )
                if res.status_code == 200:
                    data = res.json()
                    articles = []
                    for item in data.get("articles", []):
                        articles.append({
                            "title": item.get("title"),
                            "summary": item.get("description", ""),
                            "source": item.get("source", {}).get("name", "GNews"),
                            "source_url": item.get("url"),
                            "image_url": item.get("image"),
                            "published_at": item.get("publishedAt"),
                            "category": "BUSINESS",
                            "symbols": [],
                            "companies": [],
                            "topics": ["finance"],
                            "sentiment": "NEUTRAL",
                            "sentiment_score": 0.0,
                            "relevance_score": 80.0,
                            "impact_score": 50.0,
                            "importance": "MEDIUM",
                            "is_demo": False,
                            "provider": "gnews"
                        })
                    return articles
        except Exception as e:
            logger.warning(f"GNews provider error: {e}. Falling back to demo data.")
        return await self.demo_fallback.get_latest_news(limit, category)

    async def get_market_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        return await self.get_latest_news(limit)

    async def get_stock_news(self, symbol: str, limit: int = 15) -> List[Dict[str, Any]]:
        return await self.demo_fallback.get_stock_news(symbol, limit)

    async def get_company_news(self, company: str, limit: int = 15) -> List[Dict[str, Any]]:
        return await self.demo_fallback.get_company_news(company, limit)

    async def get_news_by_topic(self, topic: str, limit: int = 20) -> List[Dict[str, Any]]:
        return await self.demo_fallback.get_news_by_topic(topic, limit)

    async def get_news_by_date_range(self, from_date: datetime, to_date: datetime, limit: int = 20) -> List[Dict[str, Any]]:
        return await self.demo_fallback.get_news_by_date_range(from_date, to_date, limit)

    async def get_breaking_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        return await self.demo_fallback.get_breaking_news(limit)

    async def get_news_sentiment(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        return await self.demo_fallback.get_news_sentiment(symbol)
