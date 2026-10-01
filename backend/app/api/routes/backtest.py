from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import hashlib
import json
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.backtesting import BacktestingEngine
from backend.app.services.job_queue import job_queue, JobStatus
from backend.app.services.cache_service import cache_service

router = APIRouter(prefix="/api/backtest", tags=["Backtesting"])
market_provider = MarketDataProvider.get_instance()

class BacktestRequest(BaseModel):
    symbol: str = "AAPL"
    strategy: str = "ai_multi_factor" # ai_multi_factor, mean_reversion, ema_cross
    initial_capital: float = 1000000.0
    risk_per_trade_pct: float = 1.0
    rsi_oversold: int = 35
    rsi_overbought: int = 65
    ema_fast: int = 20
    ema_slow: int = 50
    atr_mult: float = 1.8
    rr_ratio: float = 2.0

async def _execute_backtest_task(
    symbol: str,
    strategy: str,
    initial_capital: float,
    params: Dict[str, Any],
    _progress_callback=None
) -> Dict[str, Any]:
    """Background task function executing historical simulation"""
    if _progress_callback:
        await _progress_callback(25)

    df = await market_provider.get_historical_bars(symbol, period="1y")

    if _progress_callback:
        await _progress_callback(60)

    engine = BacktestingEngine(risk_per_trade_pct=params.get("risk_per_trade_pct", 1.0))
    result = engine.run_backtest(
        df=df,
        symbol=symbol,
        strategy_name=strategy,
        initial_capital=initial_capital,
        strategy_params=params
    )

    if _progress_callback:
        await _progress_callback(95)

    backtest_id = f"BT-{abs(hash(symbol + strategy + str(initial_capital))) % 90000 + 10000}"
    result["id"] = backtest_id
    
    # Cache result for 2 hours
    await cache_service.set_json(f"backtest:{backtest_id}", result, ttl=7200)
    return result

@router.post("")
async def run_backtest_endpoint(req: BacktestRequest):
    """
    Submits historical backtest simulation to background worker queue.
    Immediately returns job_id and status (QUEUED/RUNNING/COMPLETED).
    """
    sym = req.symbol.upper().strip()
    params = {
        "rsi_oversold": req.rsi_oversold,
        "rsi_overbought": req.rsi_overbought,
        "ema_fast": req.ema_fast,
        "ema_slow": req.ema_slow,
        "atr_mult": req.atr_mult,
        "rr_ratio": req.rr_ratio,
        "risk_per_trade_pct": req.risk_per_trade_pct
    }

    # Deterministic param signature for deduplication
    sig = hashlib.sha256(json.dumps({
        "sym": sym, "strat": req.strategy, "cap": req.initial_capital, "p": params
    }, sort_keys=True).encode()).hexdigest()[:12]

    cache_key = f"backtest:cache:{sig}"
    cached_result = await cache_service.get_json(cache_key)
    if cached_result:
        return {
            "job_id": cached_result.get("id", f"BT-{sig}"),
            "status": JobStatus.COMPLETED.value,
            "progress_pct": 100,
            "result": cached_result,
            "is_cached": True
        }

    job_id = await job_queue.submit_job(
        "backtest",
        _execute_backtest_task,
        symbol=sym,
        strategy=req.strategy,
        initial_capital=req.initial_capital,
        params=params,
        metadata={"symbol": sym, "strategy": req.strategy}
    )

    return {
        "job_id": job_id,
        "status": JobStatus.QUEUED.value,
        "progress_pct": 0,
        "message": f"Backtest for {sym} ({req.strategy}) queued successfully in background worker",
        "poll_url": f"/api/backtest/{job_id}"
    }

@router.get("/{id}")
async def get_backtest_by_id(id: str):
    """
    Retrieve historical backtest status or completed report by ID.
    Returns: Queued, Running, Completed, Failed with progress and results.
    """
    # 1. Check if ID matches a background job
    job = await job_queue.get_job(id)
    if job:
        response = {
            "id": job["job_id"],
            "status": job["status"],
            "progress_pct": job["progress_pct"],
            "created_at": job["created_at"],
            "started_at": job["started_at"],
            "completed_at": job["completed_at"],
            "error": job.get("error")
        }
        if job["status"] == JobStatus.COMPLETED.value and job.get("result"):
            response["result"] = job["result"]
            # Expose top-level backtest fields for seamless frontend backward compatibility
            response.update(job["result"])
        return response

    # 2. Check persistent cache for historical BT-ID
    cached = await cache_service.get_json(f"backtest:{id}")
    if cached:
        return {
            "id": id,
            "status": JobStatus.COMPLETED.value,
            "progress_pct": 100,
            "result": cached,
            **cached
        }

    raise HTTPException(status_code=404, detail="Backtest job or report not found")
