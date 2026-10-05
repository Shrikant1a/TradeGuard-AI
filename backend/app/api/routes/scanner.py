from fastapi import APIRouter
from typing import List, Dict, Any
import asyncio
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.technical_analysis import TechnicalAnalysisService
from backend.app.services.ai_engine import AIEngine
from backend.app.services.symbol_registry import symbol_registry
from backend.app.services.cache_service import cache_service

router = APIRouter(prefix="/api/scanner", tags=["Market Scanner"])
market_provider = MarketDataProvider.get_instance()
ai_engine = AIEngine()

WATCHLIST = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", 
    "SBIN", "BHARTIARTL", "ITC", "LT", "TATAMOTORS",
    "NIFTY 50", "SENSEX", "AAPL", "BTC-USD"
]

async def _scan_single_symbol(sym: str) -> Dict[str, Any]:
    resolved = symbol_registry.resolve(sym)
    quote = await market_provider.get_current_quote(sym)
    df = await market_provider.get_historical_bars(sym, period="3mo")
    data_with_indicators = TechnicalAnalysisService.calculate_indicators(df)
    metrics = TechnicalAnalysisService.get_latest_metrics(data_with_indicators)
    sig = ai_engine.generate_signal(df, sym)

    return {
        "symbol": resolved["symbol"],
        "company_name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
        "exchange": resolved.get("exchange", "NSE"),
        "currency": resolved.get("currency", "INR"),
        "currency_symbol": resolved.get("currency_symbol", "₹"),
        "price": quote["price"],
        "change": quote["change"],
        "change_pct": quote["change_pct"],
        "volume": quote["volume"],
        "trend": metrics["trend"],
        "rsi": metrics["rsi"],
        "macd": metrics["macd"],
        "market_regime": metrics["market_regime"],
        "signal_type": sig["signal_type"],
        "signal": sig["signal_type"],
        "confidence": sig["confidence"],
        "risk": sig["risk_score"],
        "risk_score": sig["risk_score"],
        "score": round(sig["confidence"], 1),
        "signal_code": sig["signal_code"],
        "signal_hash": sig["signal_hash"],
        "stop_loss": sig["stop_loss"],
        "take_profit": sig["take_profit"],
        "current_price": sig["current_price"],
        "probabilities": sig.get("probabilities", {}),
    }

@router.get("")
async def scan_market():
    """
    Scans the core India-first multi-asset watchlist and returns live metrics,
    technicals (RSI, MACD, Trend), AI Signals (BUY/HOLD/SELL), confidence %, and risk level.
    Uses 60s cache and concurrent async execution for sub-second performance.
    """
    cache_key = "scanner:all_watchlist"
    cached = await cache_service.get_json(cache_key)
    if cached and isinstance(cached, list) and len(cached) > 0:
        return cached

    tasks = [_scan_single_symbol(sym) for sym in WATCHLIST]
    raw_results = await asyncio.gather(*tasks, return_exceptions=True)

    scan_results: List[Dict[str, Any]] = []
    for r in raw_results:
        if isinstance(r, dict) and "symbol" in r:
            scan_results.append(r)

    if scan_results:
        await cache_service.set_json(cache_key, scan_results, ttl=60)

    return scan_results
