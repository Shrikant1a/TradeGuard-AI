import asyncio
import time
import uuid
import logging
from typing import Dict, Any, Optional, Callable
from enum import Enum
from backend.app.services.cache_service import cache_service

logger = logging.getLogger("tradeguard.job_queue")

class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class JobQueueManager:
    """
    Asynchronous Background Job & Worker Queue with strict concurrency limits.
    Prevents CPU and external API starvation by capping simultaneous heavy tasks.
    """

    def __init__(self):
        # Concurrency Semaphores (Section 21 requirements)
        self.semaphores = {
            "ai_analysis": asyncio.Semaphore(5),
            "backtest": asyncio.Semaphore(3),
            "news_ingestion": asyncio.Semaphore(10),
            "blockchain": asyncio.Semaphore(5),
            "general": asyncio.Semaphore(10)
        }
        self._jobs: Dict[str, Dict[str, Any]] = {}

    async def submit_job(
        self,
        job_type: str,
        async_task: Callable,
        *args,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> str:
        """Enqueues an asynchronous background job and immediately returns job_id"""
        job_id = f"JOB-{job_type.upper()[:4]}-{uuid.uuid4().hex[:8]}"
        now = time.time()

        job_record = {
            "job_id": job_id,
            "job_type": job_type,
            "status": JobStatus.QUEUED.value,
            "progress_pct": 0,
            "result": None,
            "error": None,
            "metadata": metadata or {},
            "created_at": now,
            "started_at": None,
            "completed_at": None
        }

        self._jobs[job_id] = job_record
        await cache_service.set_json(f"job:{job_id}", job_record, ttl=3600)

        # Launch worker task in background
        asyncio.create_task(self._execute_job(job_id, job_type, async_task, *args, **kwargs))
        return job_id

    async def _execute_job(
        self,
        job_id: str,
        job_type: str,
        async_task: Callable,
        *args,
        **kwargs
    ):
        semaphore = self.semaphores.get(job_type, self.semaphores["general"])
        
        async with semaphore:
            job = self._jobs.get(job_id)
            if not job:
                return

            job["status"] = JobStatus.RUNNING.value
            job["started_at"] = time.time()
            job["progress_pct"] = 10
            await cache_service.set_json(f"job:{job_id}", job, ttl=3600)

            try:
                # Allow task to report progress if it accepts progress_callback
                async def update_progress(pct: int):
                    job["progress_pct"] = min(99, max(10, pct))
                    await cache_service.set_json(f"job:{job_id}", job, ttl=3600)

                kwargs["_progress_callback"] = update_progress
                
                result = await async_task(*args, **kwargs)

                job["status"] = JobStatus.COMPLETED.value
                job["progress_pct"] = 100
                job["result"] = result
                job["completed_at"] = time.time()
                await cache_service.set_json(f"job:{job_id}", job, ttl=7200)
                logger.info(f"Background Job [{job_id}] completed in {round(time.time() - job['started_at'], 2)}s")

            except Exception as e:
                logger.error(f"Background Job [{job_id}] failed: {e}", exc_info=True)
                job["status"] = JobStatus.FAILED.value
                job["error"] = str(e)
                job["completed_at"] = time.time()
                await cache_service.set_json(f"job:{job_id}", job, ttl=7200)

    async def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve job status and result from memory or cache"""
        if job_id in self._jobs:
            return self._jobs[job_id]
        return await cache_service.get_json(f"job:{job_id}")

    def get_stats(self) -> Dict[str, Any]:
        total = len(self._jobs)
        running = sum(1 for j in self._jobs.values() if j["status"] == JobStatus.RUNNING.value)
        queued = sum(1 for j in self._jobs.values() if j["status"] == JobStatus.QUEUED.value)
        completed = sum(1 for j in self._jobs.values() if j["status"] == JobStatus.COMPLETED.value)
        failed = sum(1 for j in self._jobs.values() if j["status"] == JobStatus.FAILED.value)

        return {
            "total_jobs": total,
            "running": running,
            "queued": queued,
            "completed": completed,
            "failed": failed
        }

job_queue = JobQueueManager()
