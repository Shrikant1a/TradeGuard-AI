from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.technical_analysis import TechnicalAnalysisService
from backend.app.services.ai_engine import AIEngine
from backend.app.services.explanation_engine import ExplanationEngine
from backend.app.services.stellar_service import stellar_service

router = APIRouter(prefix="/api/analysis", tags=["AI Analysis"])
market_provider = MarketDataProvider.get_instance()
ai_engine = AIEngine()

@router.get("/{symbol}")
async def analyze_asset(symbol: str):
    """
    Comprehensive multi-factor technical and AI model analysis for an asset.
    Returns indicators, probabilistic signal, explainability drivers, and blockchain proof.
    """
    sym = symbol.upper().strip()
    df = await market_provider.get_historical_bars(sym)
    if df.empty or len(df) < 15:
        raise HTTPException(status_code=400, detail=f"Insufficient market data history for {sym}")

    data_with_indicators = TechnicalAnalysisService.calculate_indicators(df)
    metrics = TechnicalAnalysisService.get_latest_metrics(data_with_indicators)
    signal_data = ai_engine.generate_signal(df, sym)
    explanation = ExplanationEngine.generate_explanation(signal_data)

    # Automatically record on Stellar Soroban blockchain
    blockchain_receipt = await stellar_service.record_signal_on_chain(
        signal_code=signal_data["signal_code"],
        asset_symbol=sym,
        signal_type=signal_data["signal_type"],
        model_version=signal_data["model_version"],
        strategy_hash=signal_data["strategy_hash"],
        signal_hash=signal_data["signal_hash"],
        risk_level=signal_data["risk_score"]
    )

    return {
        "symbol": sym,
        "metrics": metrics,
        "signal": signal_data,
        "explanation": explanation,
        "blockchain_verification": blockchain_receipt,
        "model_performance": ai_engine._default_model_metrics()
    }
