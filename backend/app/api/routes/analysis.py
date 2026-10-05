from fastapi import APIRouter, HTTPException, BackgroundTasks
import asyncio
from typing import Dict, Any
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.technical_analysis import TechnicalAnalysisService
from backend.app.services.ai_engine import AIEngine
from backend.app.services.explanation_engine import ExplanationEngine
from backend.app.services.stellar_service import stellar_service
from backend.app.services.cache_service import cache_service

router = APIRouter(prefix="/api/analysis", tags=["AI Analysis"])
market_provider = MarketDataProvider.get_instance()
ai_engine = AIEngine()

@router.get("/{symbol}")
async def analyze_asset(symbol: str, background_tasks: BackgroundTasks):
    """
    Comprehensive multi-factor technical and AI model analysis for an asset.
    Uses AIAnalysisCache (15m TTL) and records blockchain verification asynchronously.
    """
    sym = symbol.upper().strip()
    cache_key = f"ai:analysis:{sym}:1D"
    cached = await cache_service.get_json(cache_key)
    if cached:
        cached["is_cached"] = True
        return cached

    df = await market_provider.get_historical_bars(sym)
    if df.empty or len(df) < 15:
        raise HTTPException(status_code=400, detail=f"Insufficient market data history for {sym}")

    data_with_indicators = TechnicalAnalysisService.calculate_indicators(df)
    metrics = TechnicalAnalysisService.get_latest_metrics(data_with_indicators)
    signal_data = ai_engine.generate_signal(df, sym)
    explanation = ExplanationEngine.generate_explanation(signal_data)

    # Check if this signal is already on-chain or pending
    existing_record = await stellar_service.get_signal_from_contract(signal_data["signal_code"])
    is_on_chain = existing_record is not None and existing_record.get("signal_hash") == signal_data["signal_hash"]
    
    blockchain_receipt = {
        "signal_code": signal_data["signal_code"],
        "asset_symbol": sym,
        "signal_type": signal_data["signal_type"],
        "signal_hash": signal_data["signal_hash"],
        "model_version": signal_data["model_version"],
        "stellar_contract_id": stellar_service.contract_id,
        "verification_status": "VERIFIED" if is_on_chain else "PENDING",
        "network": stellar_service.network,
        "stellar_tx_hash": None,
        "explorer_url": None,
        "is_async": True
    }

    # Asynchronous non-blocking blockchain recording
    async def async_record_chain():
        try:
            await stellar_service.record_signal_on_chain(
                signal_code=signal_data["signal_code"],
                asset_symbol=sym,
                signal_type=signal_data["signal_type"],
                model_version=signal_data["model_version"],
                strategy_hash=signal_data["strategy_hash"],
                signal_hash=signal_data["signal_hash"],
                risk_level=signal_data["risk_score"]
            )
        except Exception:
            pass

    background_tasks.add_task(async_record_chain)

    meta = getattr(df, "attrs", {}).get("meta", {
        "provider": "Yahoo Finance",
        "is_live": True,
        "is_stale": False,
        "timestamp": None,
        "status_message": "Live market data feed active"
    })

    result = {
        "symbol": sym,
        "metrics": metrics,
        "signal": signal_data,
        "explanation": explanation,
        "blockchain_verification": blockchain_receipt,
        "model_performance": ai_engine._default_model_metrics(),
        "provider": meta.get("provider", "Yahoo Finance"),
        "is_live": meta.get("is_live", True),
        "is_stale": meta.get("is_stale", False),
        "timestamp": meta.get("timestamp"),
        "status_message": meta.get("status_message"),
        "is_cached": False
    }

    # Cache AI analysis for 15 minutes (900 seconds)
    await cache_service.set_json(cache_key, result, ttl=900)
    return result
