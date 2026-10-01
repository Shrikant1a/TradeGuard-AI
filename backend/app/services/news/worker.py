import asyncio
import logging
import time
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from backend.app.config import settings
from backend.app.services.news.factory import NewsProviderFactory
from backend.app.services.news.pipeline import NewsAIPipeline
from backend.app.services.cache_service import cache_service
from backend.app.services.circuit_breaker import news_circuit_breaker
from backend.app.db.database import AsyncSessionLocal
from backend.app.db.models import NewsArticle, NewsProviderEvent

logger = logging.getLogger("tradeguard.news.worker")

class NewsIngestionWorker:
    """
    Decoupled Autonomous News Ingestion Worker.
    Periodically fetches external financial news, normalizes, deduplicates,
    runs NLP sentiment/impact analysis, and synchronizes to Redis and DB.
    Ensures frontend requests never block on external provider APIs.
    """

    def __init__(self):
        self.interval_seconds = getattr(settings, "NEWS_REFRESH_INTERVAL", 300)
        self.pipeline = NewsAIPipeline()
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self.last_sync_time: Optional[float] = None
        self.last_sync_count: int = 0
        self.last_error: Optional[str] = None

    def start(self):
        """Starts the autonomous background loop"""
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._run_loop())
            logger.info(f"NewsIngestionWorker started (cycle: {self.interval_seconds}s).")

    def stop(self):
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
            logger.info("NewsIngestionWorker stopped.")

    async def _run_loop(self):
        # Initial run on server startup after 2 seconds
        await asyncio.sleep(2)
        while self.is_running:
            try:
                await self.ingest_cycle()
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.last_error = str(e)
                logger.error(f"Error in NewsIngestionWorker cycle: {e}", exc_info=True)

            try:
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break

    async def ingest_cycle(self) -> Dict[str, Any]:
        """Executes a single news ingestion, processing, and cache-sync cycle"""
        start_time = time.time()
        provider = NewsProviderFactory.get_provider()
        provider_name = getattr(provider, "provider_name", "alphavantage")

        logger.info(f"Starting news ingestion cycle from provider: {provider_name}")

        async def fetch_articles():
            return await provider.get_latest_news(limit=getattr(settings, "NEWS_MAX_ARTICLES", 50))

        try:
            raw_articles = await news_circuit_breaker.call(fetch_articles)
        except Exception as e:
            logger.warning(f"Circuit breaker prevented news fetch or provider failed: {e}")
            # Try loading existing articles from DB into cache if cache is empty
            await self._warm_cache_from_db()
            return {"status": "FAILED", "error": str(e)}

        if not raw_articles:
            return {"status": "EMPTY", "articles": 0}

        # 1. Pipeline Processing: Normalize, Deduplicate, Entity Extraction & Sentiment
        processed_articles: List[Dict[str, Any]] = []
        for raw in raw_articles:
            try:
                processed = self.pipeline.process_raw_article(raw)
                processed_articles.append(processed)
            except Exception as pe:
                # If pipeline processing errors on single article, keep the raw item
                processed_articles.append(raw)

        # Deduplicate identical items
        unique_articles = self.pipeline.deduplicate_articles(processed_articles) if hasattr(self.pipeline, "deduplicate_articles") else processed_articles

        # 2. Synchronize to Redis Cache
        # Latest news feed (300s TTL)
        await cache_service.set_json("news:latest", unique_articles[:30], ttl=300)

        # Breaking news feed (120s TTL)
        breaking = [a for a in unique_articles if a.get("is_breaking") or a.get("importance") in ("CRITICAL", "HIGH")]
        await cache_service.set_json("news:breaking", breaking[:6] or unique_articles[:4], ttl=120)

        # Symbol-indexed news cache
        symbol_map: Dict[str, List[Dict[str, Any]]] = {}
        for art in unique_articles:
            for sym in art.get("symbols", []):
                sym_up = sym.upper()
                if sym_up not in symbol_map:
                    symbol_map[sym_up] = []
                symbol_map[sym_up].append(art)

        for sym, s_articles in symbol_map.items():
            await cache_service.set_json(f"news:stock:{sym}", s_articles[:15], ttl=300)

        # 3. Persist to Database (PostgreSQL / SQLite)
        persisted_count = await self._persist_to_db(unique_articles, provider_name)

        duration_ms = int((time.time() - start_time) * 1000)
        self.last_sync_time = time.time()
        self.last_sync_count = len(unique_articles)
        self.last_error = None

        logger.info(
            f"News ingestion cycle completed in {duration_ms}ms: "
            f"{len(unique_articles)} processed, {persisted_count} new persisted."
        )

        return {
            "status": "SUCCESS",
            "articles_processed": len(unique_articles),
            "articles_persisted": persisted_count,
            "duration_ms": duration_ms
        }

    async def _persist_to_db(self, articles: List[Dict[str, Any]], provider: str) -> int:
        """Asynchronously writes unique articles to the database"""
        saved = 0
        try:
            async with AsyncSessionLocal() as session:
                for art in articles:
                    content_hash = art.get("content_hash")
                    if not content_hash:
                        continue

                    # Check if article already exists by content_hash
                    stmt = select(NewsArticle.id).where(NewsArticle.content_hash == content_hash)
                    res = await session.execute(stmt)
                    if res.scalar_one_or_none() is not None:
                        continue

                    # Parse published_at
                    pub_str = art.get("published_at")
                    try:
                        pub_dt = datetime.datetime.fromisoformat(pub_str.replace("Z", "+00:00")).replace(tzinfo=None) if pub_str else datetime.datetime.utcnow()
                    except Exception:
                        pub_dt = datetime.datetime.utcnow()

                    db_article = NewsArticle(
                        title=art.get("title", "Untitled")[:500],
                        summary=art.get("summary", ""),
                        source=art.get("source", "Unknown")[:100],
                        source_url=art.get("source_url", art.get("url", "#")),
                        image_url=art.get("image_url", ""),
                        author=art.get("author", "")[:100],
                        published_at=pub_dt,
                        category=art.get("category", "MARKET")[:50],
                        symbols=art.get("symbols", []),
                        companies=art.get("companies", []),
                        topics=art.get("topics", []),
                        sentiment=art.get("sentiment", "NEUTRAL"),
                        sentiment_score=float(art.get("sentiment_score", 0.0)),
                        sentiment_breakdown=art.get("sentiment_breakdown", {}),
                        relevance_score=float(art.get("relevance_score", 80.0)),
                        impact_score=float(art.get("impact_score", 50.0)),
                        importance=art.get("importance", "MEDIUM"),
                        ai_summary=art.get("ai_summary", ""),
                        ai_key_points=art.get("ai_key_points", []),
                        ai_reasoning=art.get("ai_reasoning", ""),
                        affected_assets=art.get("affected_assets", []),
                        provider=provider,
                        content_hash=content_hash,
                        is_breaking=bool(art.get("is_breaking", False)),
                        is_processed=True
                    )
                    session.add(db_article)
                    saved += 1

                await session.commit()
        except Exception as dbe:
            logger.warning(f"Error persisting news articles to database: {dbe}")
        return saved

    async def _warm_cache_from_db(self):
        """Warm up Redis cache from DB if external provider is offline"""
        try:
            async with AsyncSessionLocal() as session:
                stmt = select(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(30)
                res = await session.execute(stmt)
                articles = res.scalars().all()
                if articles:
                    dicts = [
                        {
                            "id": a.id,
                            "title": a.title,
                            "summary": a.summary,
                            "source": a.source,
                            "source_url": a.source_url,
                            "image_url": a.image_url,
                            "author": a.author,
                            "published_at": a.published_at.isoformat() + "Z",
                            "category": a.category,
                            "symbols": a.symbols,
                            "companies": a.companies,
                            "sentiment": a.sentiment,
                            "sentiment_score": a.sentiment_score,
                            "sentiment_breakdown": a.sentiment_breakdown,
                            "impact_score": a.impact_score,
                            "importance": a.importance,
                            "is_breaking": a.is_breaking,
                            "ai_summary": a.ai_summary,
                            "ai_key_points": a.ai_key_points,
                            "content_hash": a.content_hash,
                            "is_stale": True
                        }
                        for a in articles
                    ]
                    await cache_service.set_json("news:latest", dicts, ttl=600)
        except Exception as e:
            logger.warning(f"Failed to warm cache from DB: {e}")

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "interval_sec": self.interval_seconds,
            "last_sync_time": self.last_sync_time,
            "last_sync_count": self.last_sync_count,
            "last_error": self.last_error
        }

news_ingestion_worker = NewsIngestionWorker()
