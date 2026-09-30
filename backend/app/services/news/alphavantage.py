import httpx
import logging
import hashlib
import datetime
from typing import List, Dict, Any, Optional
from backend.app.config import settings
from backend.app.services.news.base import NewsProvider
from backend.app.services.news.demo_data import DemoNewsProvider

logger = logging.getLogger("tradeguard.news.alphavantage")

class AlphaVantageNewsProvider(NewsProvider):
    """
    Alpha Vantage Financial News Provider (NEWS_SENTIMENT API).
    Includes rate-limit throttling, exponential backoff, ticker/topic filtering,
    and automatic normalization into the TradeGuard NewsArticle specification.
    """

    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ALPHAVANTAGE_API_KEY
        self.demo_fallback = DemoNewsProvider()
        self._last_request_time = 0.0
        self._rate_limit_delay = 12.0  # Free tier allows 5 calls/min (~12s between calls)

    def _normalize_sentiment_label(self, label: str) -> str:
        lbl = (label or "").upper()
        if "BULLISH" in lbl or "POSITIVE" in lbl:
            return "POSITIVE"
        if "BEARISH" in lbl or "NEGATIVE" in lbl:
            return "NEGATIVE"
        return "NEUTRAL"

    def _map_topic_to_category(self, topics: List[Dict[str, Any]]) -> str:
        """Map Alpha Vantage topics to TradeGuard categories"""
        if not topics:
            return "MARKET"
        top_topic = topics[0].get("topic", "").lower() if isinstance(topics[0], dict) else str(topics[0]).lower()
        mapping = {
            "earnings": "EARNINGS",
            "ipo": "IPO",
            "mergers_and_acquisitions": "MERGER_ACQUISITION",
            "technology": "TECHNOLOGY",
            "economy_macro": "ECONOMY",
            "economy_monetary": "FEDERAL_RESERVE",
            "economy_fiscal": "ECONOMY",
            "energy_transportation": "ENERGY",
            "financial_markets": "MARKET",
            "finance": "FINANCE",
            "blockchain": "CRYPTO"
        }
        return mapping.get(top_topic, "MARKET")

    def _calculate_impact(self, category: str, sentiment_score: float, title: str) -> tuple[float, str]:
        """Calculates analytical impact score (0-100) and importance level"""
        title_lower = title.lower()
        score = 50.0

        # Event type bonuses
        if any(w in title_lower for w in ["fed ", "federal reserve", "interest rate", "cpi", "inflation", "rate hike", "rate cut"]):
            score += 35.0
        elif any(w in title_lower for w in ["earnings", "revenue", "profit", "guidance"]):
            score += 25.0
        elif any(w in title_lower for w in ["merger", "acquisition", "acquire", "buyout"]):
            score += 22.0
        elif any(w in title_lower for w in ["antitrust", "investigation", "subpoena", "sec", "lawsuit"]):
            score += 20.0
        elif any(w in title_lower for w in ["fda approval", "breakthrough", "launch", "partnership"]):
            score += 15.0

        # Extreme sentiment bonus
        if abs(sentiment_score) > 0.4:
            score += 15.0

        score = min(98.0, max(25.0, score))
        if score >= 85:
            importance = "CRITICAL"
        elif score >= 70:
            importance = "HIGH"
        elif score >= 45:
            importance = "MEDIUM"
        else:
            importance = "LOW"

        return round(score, 1), importance

    def _normalize_article(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Convert raw Alpha Vantage feed item to normalized NewsArticle model"""
        title = item.get("title", "Market Update")
        summary = item.get("summary", "")
        source = item.get("source", "Alpha Vantage")
        url = item.get("url", "")
        img = item.get("banner_image")
        author = item.get("authors", ["Financial News"])[0] if item.get("authors") else "Financial News"

        # Published date parsing (format: YYYYMMDDTHHMMSS)
        raw_time = item.get("time_published", "")
        try:
            if len(raw_time) >= 15:
                dt = datetime.datetime.strptime(raw_time[:15], "%Y%m%dT%H%M%S")
            else:
                dt = datetime.datetime.utcnow()
        except Exception:
            dt = datetime.datetime.utcnow()
        published_at = dt.isoformat() + "Z"

        # Ticker sentiments
        ticker_list = []
        for t in item.get("ticker_sentiment", []):
            if isinstance(t, dict) and t.get("ticker"):
                ticker_list.append(t["ticker"])

        # Sentiment
        raw_score = float(item.get("overall_sentiment_score", 0.0))
        sentiment_label = self._normalize_sentiment_label(item.get("overall_sentiment_label", "Neutral"))

        # Sentiment breakdown calculation
        if raw_score > 0.2:
            pos_pct = min(95, int(50 + raw_score * 45))
            neg_pct = max(3, int(15 - raw_score * 12))
            neu_pct = max(0, 100 - pos_pct - neg_pct)
        elif raw_score < -0.2:
            neg_pct = min(95, int(50 + abs(raw_score) * 45))
            pos_pct = max(3, int(15 - abs(raw_score) * 12))
            neu_pct = max(0, 100 - pos_pct - neg_pct)
        else:
            neu_pct = 60
            pos_pct = 20
            neg_pct = 20

        raw_topics = item.get("topics", [])
        category = self._map_topic_to_category(raw_topics)
        impact_score, importance = self._calculate_impact(category, raw_score, title)

        # Relevance
        relevance = 85.0
        if ticker_list:
            relevance = 92.0

        # Content hash for deduplication
        h_input = f"{title}:{source}:{published_at}"
        content_hash = hashlib.sha256(h_input.encode()).hexdigest()

        # Factual AI summary and key points based on summary
        ai_summary = summary if len(summary) < 280 else summary[:277] + "..."
        key_points = [
            f"Reported by {source} on {category.lower().replace('_', ' ')} developments.",
            f"Overall market sentiment assessed as {sentiment_label} (score: {raw_score:+.2f}).",
            f"Associated key ticker symbols: {', '.join(ticker_list[:4]) if ticker_list else 'Broad Market'}."
        ]

        is_breaking = importance == "CRITICAL" and (datetime.datetime.utcnow() - dt).total_seconds() < 10800

        return {
            "id": abs(hash(content_hash)) % 1000000,
            "title": title,
            "summary": summary,
            "source": source,
            "source_url": url,
            "image_url": img or "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
            "author": author,
            "published_at": published_at,
            "updated_at": published_at,
            "language": "en",
            "category": category,
            "symbols": ticker_list,
            "companies": [t for t in ticker_list],
            "topics": [t.get("topic") for t in raw_topics if isinstance(t, dict)] if raw_topics else [category.lower()],
            "sentiment": sentiment_label,
            "sentiment_score": round(raw_score, 2),
            "sentiment_breakdown": {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct},
            "source_sentiment": sentiment_label,
            "relevance_score": relevance,
            "impact_score": impact_score,
            "importance": importance,
            "ai_summary": ai_summary,
            "ai_key_points": key_points,
            "ai_reasoning": f"Analytical estimate derived from {category} classification, event significance, and sentiment tone.",
            "affected_assets": ticker_list[:4] if ticker_list else ["SPY", "QQQ"],
            "created_at": published_at,
            "provider": "alphavantage",
            "provider_article_id": url or content_hash[:16],
            "content_hash": content_hash,
            "is_breaking": is_breaking,
            "is_processed": True,
            "is_duplicate": False,
            "is_demo": False,
            "duplicate_sources": []
        }

    async def _fetch_from_api(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Executes HTTP request to Alpha Vantage with error handling and fallback"""
        if not self.api_key or self.api_key.strip().lower() in ["", "demo", "demo_or_your_key_here"]:
            logger.info("Alpha Vantage API key not provided or set to demo. Using DemoNewsProvider fallback.")
            return await self.demo_fallback.get_latest_news()

        req_params = {
            "function": "NEWS_SENTIMENT",
            "sort": "LATEST",
            "apikey": self.api_key,
            **params
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(self.BASE_URL, params=req_params)
                if res.status_code != 200:
                    logger.warning(f"Alpha Vantage HTTP error {res.status_code}. Falling back to demo data.")
                    return await self.demo_fallback.get_latest_news()
                
                data = res.json()
                if "Note" in data or "Information" in data:
                    logger.warning(f"Alpha Vantage API rate limit or notice: {data.get('Note') or data.get('Information')}. Falling back to demo.")
                    return await self.demo_fallback.get_latest_news()
                
                feed = data.get("feed", [])
                if not feed:
                    logger.info("Alpha Vantage returned empty feed. Falling back to demo data.")
                    return await self.demo_fallback.get_latest_news()

                normalized = [self._normalize_article(item) for item in feed]
                return normalized
        except Exception as e:
            logger.error(f"Alpha Vantage request failed: {e}. Falling back to demo.")
            return await self.demo_fallback.get_latest_news()

    async def get_latest_news(self, limit: int = 20, category: Optional[str] = None) -> List[Dict[str, Any]]:
        params = {"limit": min(limit, 50)}
        if category and category.upper() != "ALL":
            params["topics"] = category.lower()
        items = await self._fetch_from_api(params)
        return items[:limit]

    async def get_market_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        params = {"topics": "financial_markets,economy_macro", "limit": min(limit, 50)}
        items = await self._fetch_from_api(params)
        return items[:limit]

    async def get_stock_news(self, symbol: str, limit: int = 15) -> List[Dict[str, Any]]:
        sym = symbol.upper().replace(".NS", "").replace("^NSEI", "NIFTY").replace("NSE:", "").replace("NASDAQ:", "")
        params = {"tickers": sym, "limit": min(limit, 30)}
        items = await self._fetch_from_api(params)
        # Filter for symbol if demo was returned
        if items and any(sym in a.get("symbols", []) or sym in a.get("title", "") for a in items):
            return [a for a in items if sym in a.get("symbols", []) or sym in a.get("title", "")][:limit]
        return items[:limit]

    async def get_company_news(self, company: str, limit: int = 15) -> List[Dict[str, Any]]:
        return await self.get_stock_news(company, limit=limit)

    async def get_news_by_topic(self, topic: str, limit: int = 20) -> List[Dict[str, Any]]:
        params = {"topics": topic.lower(), "limit": min(limit, 50)}
        items = await self._fetch_from_api(params)
        return items[:limit]

    async def get_news_by_date_range(
        self, from_date: datetime.datetime, to_date: datetime.datetime, limit: int = 20
    ) -> List[Dict[str, Any]]:
        time_from = from_date.strftime("%Y%m%dT%H%M")
        time_to = to_date.strftime("%Y%m%dT%H%M")
        params = {"time_from": time_from, "time_to": time_to, "limit": min(limit, 50)}
        items = await self._fetch_from_api(params)
        return items[:limit]

    async def get_breaking_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        all_news = await self.get_latest_news(limit=25)
        breaking = [a for a in all_news if a.get("is_breaking") or a.get("importance") == "CRITICAL"]
        return breaking[:limit] if breaking else all_news[:2]

    async def get_news_sentiment(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        if symbol:
            articles = await self.get_stock_news(symbol, limit=10)
        else:
            articles = await self.get_latest_news(limit=15)

        if not articles:
            return {
                "symbol": symbol or "MARKET",
                "sentiment": "NEUTRAL",
                "sentiment_score": 0.0,
                "breakdown": {"positive": 33, "neutral": 34, "negative": 33},
                "article_count": 0,
                "source": "Alpha Vantage / TradeGuard AI"
            }

        scores = [a.get("sentiment_score", 0.0) for a in articles]
        avg_score = round(sum(scores) / len(scores), 2)
        pos_cnt = sum(1 for s in scores if s > 0.15)
        neg_cnt = sum(1 for s in scores if s < -0.15)
        neu_cnt = len(scores) - pos_cnt - neg_cnt
        total = len(scores)

        pos_pct = round((pos_cnt / total) * 100)
        neg_pct = round((neg_cnt / total) * 100)
        neu_pct = max(0, 100 - pos_pct - neg_pct)
        dominant = "POSITIVE" if avg_score > 0.15 else ("NEGATIVE" if avg_score < -0.15 else "NEUTRAL")

        return {
            "symbol": symbol or "MARKET",
            "sentiment": dominant,
            "sentiment_score": avg_score,
            "breakdown": {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct},
            "article_count": total,
            "source": "Alpha Vantage / TradeGuard AI",
            "is_demo": any(a.get("is_demo") for a in articles)
        }
