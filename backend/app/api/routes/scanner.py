from fastapi import APIRouter
from typing import List, Dict, Any
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.technical_analysis import TechnicalAnalysisService
from backend.app.services.ai_engine import AIEngine

router = APIRouter(prefix="/api/scanner", tags=["Market Scanner"])
market_provider = MarketDataProvider.get_instance()
ai_engine = AIEngine()

WATCHLIST = [
    "AAPL", "NVDA", "MSFT", "TSLA", "GOOGL", "AMZN", 
    "BTC-USD", "ETH-USD", "RELIANCE.NS", "TCS.NS"
]

@router.get("")
async def scan_market():
    """
    Scans the core multi-asset watchlist and returns live metrics,
    technicals (RSI, MACD, Trend), AI Signals (BUY/HOLD/SELL), confidence %, and risk level.
    """
    scan_results: List[Dict[str, Any]] = []

    for sym in WATCHLIST:
        try:
            quote = await market_provider.get_current_quote(sym)
            df = await market_provider.get_historical_bars(sym, period="3mo")
            data_with_indicators = TechnicalAnalysisService.calculate_indicators(df)
            metrics = TechnicalAnalysisService.get_latest_metrics(data_with_indicators)
            sig = ai_engine.generate_signal(df, sym)

            scan_results.append({
                "symbol": sym,
                "price": quote["price"],
                "change": quote["change"],
                "change_pct": quote["change_pct"],
                "volume": quote["volume"],
                "trend": metrics["trend"],
                "rsi": metrics["rsi"],
                "macd": metrics["macd"],
                "market_regime": metrics["market_regime"],
                "signal": sig["signal_type"],
                "confidence": sig["confidence"],
                "risk": sig["risk_score"],
                "signal_code": sig["signal_code"],
                "stop_loss": sig["stop_loss"],
                "take_profit": sig["take_profit"]
            })
        except Exception:
            pass

    return scan_results
