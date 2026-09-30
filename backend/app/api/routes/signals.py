from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.ai_engine import AIEngine
from backend.app.services.explanation_engine import ExplanationEngine
from backend.app.services.stellar_service import stellar_service

router = APIRouter(prefix="/api/signals", tags=["Signals"])
market_provider = MarketDataProvider.get_instance()
ai_engine = AIEngine()

# In-memory store for generated active signals
GENERATED_SIGNALS: List[Dict[str, Any]] = []

class GenerateSignalRequest(BaseModel):
    symbol: str

@router.post("/generate")
async def generate_signal_endpoint(req: GenerateSignalRequest):
    """Generates a new probabilistic AI signal for an asset and records it on Stellar"""
    sym = req.symbol.upper().strip()
    df = await market_provider.get_historical_bars(sym)
    signal_data = ai_engine.generate_signal(df, sym)
    explanation = ExplanationEngine.generate_explanation(signal_data)

    receipt = await stellar_service.record_signal_on_chain(
        signal_code=signal_data["signal_code"],
        asset_symbol=sym,
        signal_type=signal_data["signal_type"],
        model_version=signal_data["model_version"],
        strategy_hash=signal_data["strategy_hash"],
        signal_hash=signal_data["signal_hash"],
        risk_level=signal_data["risk_score"]
    )

    full_record = {
        **signal_data,
        "explanation": explanation,
        "blockchain": receipt,
        "status": "ACTIVE"
    }
    GENERATED_SIGNALS.insert(0, full_record)
    return full_record

@router.get("")
async def list_signals(
    signal_type: Optional[str] = Query(None, description="Filter by BUY, HOLD, SELL"),
    risk_score: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, HIGH")
):
    """Retrieve list of active and recent AI trading signals"""
    # Seed top signals if list is currently empty
    if len(GENERATED_SIGNALS) == 0:
        seed_symbols = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "BTC-USD", "RELIANCE.NS"]
        for sym in seed_symbols:
            try:
                df = await market_provider.get_historical_bars(sym)
                sig = ai_engine.generate_signal(df, sym)
                exp = ExplanationEngine.generate_explanation(sig)
                bc = await stellar_service.record_signal_on_chain(
                    signal_code=sig["signal_code"],
                    asset_symbol=sym,
                    signal_type=sig["signal_type"],
                    model_version=sig["model_version"],
                    strategy_hash=sig["strategy_hash"],
                    signal_hash=sig["signal_hash"],
                    risk_level=sig["risk_score"]
                )
                GENERATED_SIGNALS.append({
                    **sig,
                    "explanation": exp,
                    "blockchain": bc,
                    "status": "ACTIVE"
                })
            except Exception:
                pass

    filtered = GENERATED_SIGNALS
    if signal_type:
        filtered = [s for s in filtered if s["signal_type"].upper() == signal_type.upper()]
    if risk_score:
        filtered = [s for s in filtered if s["risk_score"].upper() == risk_score.upper()]

    return filtered
