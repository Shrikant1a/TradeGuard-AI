"""
TradeGuard AI - Autonomous Background Worker Process
Handles decoupled asynchronous tasks, scheduled ingestion, market digests,
and model pre-computation outside of user-facing HTTP request cycles.
"""
import asyncio
import logging
import signal
import sys
import time
from sqlalchemy import text

from backend.app.config import settings
from backend.app.db.database import engine, Base
from backend.app.services.cache_service import cache_service
from backend.app.services.news.worker import news_ingestion_worker
from backend.app.services.news.digest import DailyDigestService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [WORKER] %(name)s: %(message)s"
)
logger = logging.getLogger("tradeguard.worker")

class TradeGuardWorker:
    def __init__(self):
        self.is_running = False
        self.start_time = time.time()
        self.digest_service = DailyDigestService()
        self._shutdown_event = asyncio.Event()

    async def initialize(self):
        logger.info("Initializing TradeGuard AI Background Worker...")

        # 1. Initialize Redis / Cache connection
        await cache_service.initialize()
        if cache_service.is_redis_active:
            logger.info("Worker connected to Redis cluster.")
        else:
            logger.info("Worker operating with local resilient cache engine.")

        # 2. Validate Database schema connection
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schema validated by worker.")
        except Exception as e:
            logger.warning(f"Worker database connection warning: {e}")

        # 3. Start news ingestion worker loop
        news_ingestion_worker.start()
        logger.info("Autonomous financial news ingestion worker active.")

        self.is_running = True

    async def run(self):
        await self.initialize()

        logger.info("TradeGuard AI Worker operational. Listening for background jobs...")

        last_digest_time = 0.0
        DIGEST_INTERVAL = 3600  # 1 hour

        while self.is_running:
            try:
                now = time.time()

                # A. Write heartbeat to cache/Redis for health monitoring
                heartbeat_data = {
                    "status": "HEALTHY",
                    "uptime_seconds": round(now - self.start_time, 2),
                    "timestamp": now,
                    "news_worker_active": news_ingestion_worker.is_running,
                    "last_sync_time": news_ingestion_worker.last_sync_time
                }
                await cache_service.set_json("worker:heartbeat", heartbeat_data, ttl=30)

                # B. Periodic Market Digest Generation
                if now - last_digest_time > DIGEST_INTERVAL:
                    try:
                        logger.info("Generating scheduled daily market intelligence digest...")
                        digest = await self.digest_service.generate_daily_digest()
                        if digest:
                            logger.info(f"Market digest refreshed successfully (Headline: {digest.headline[:40]}...)")
                        last_digest_time = now
                    except Exception as e:
                        logger.warning(f"Periodic digest generation notice: {e}")

                # Sleep in short increments to allow rapid shutdown response
                try:
                    await asyncio.wait_for(self._shutdown_event.wait(), timeout=10.0)
                    break
                except asyncio.TimeoutError:
                    pass

            except Exception as e:
                logger.error(f"Error in worker main loop: {e}", exc_info=True)
                await asyncio.sleep(5)

        logger.info("Worker run loop exited.")

    def stop(self):
        logger.info("Received termination signal. Stopping worker gracefully...")
        self.is_running = False
        self._shutdown_event.set()
        news_ingestion_worker.stop()

def handle_signal(sig, frame):
    logger.info(f"Signal {sig} received.")
    if 'worker_instance' in globals() and worker_instance:
        worker_instance.stop()

async def main():
    global worker_instance
    worker_instance = TradeGuardWorker()

    # Register OS signals for graceful Docker container shutdown
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, worker_instance.stop)
        except NotImplementedError:
            # Windows does not support add_signal_handler for all signals
            signal.signal(sig, handle_signal)

    try:
        await worker_instance.run()
    finally:
        worker_instance.stop()
        logger.info("TradeGuard AI Worker shutdown complete.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Worker process exited.")
