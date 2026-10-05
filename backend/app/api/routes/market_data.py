import datetime
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any
from backend.app.services.market_data import MarketDataProvider

router = APIRouter(prefix="/api/market-data", tags=["Market Data"])
market_provider = MarketDataProvider.get_instance()

@router.get("/{symbol}")
async def get_market_data(
    symbol: str, 
    timeframe: str = Query("1d", description="Timeframe interval (1d, 1h, 1wk)"),
    period: str = Query("6mo", description="Historical period (1mo, 3mo, 6mo, 1y, 2y)")
):
    """
    Retrieve historical OHLCV candle bars and transparent live/fallback quote for a symbol.
    Clearly attributes provider ('Yahoo Finance' vs 'Synthetic Fallback'),
    live status, staleness indicator, and timestamp.
    """
    sym = symbol.upper().strip()
    df, meta = await market_provider.get_historical_bars(sym, timeframe, period, with_meta=True)
    quote = await market_provider.get_current_quote(sym)
    
    # Format candles for chart rendering
    candles = []
    for _, row in df.iterrows():
        candles.append({
            "time": str(row["timestamp"])[:10],
            "open": round(float(row["open"]), 2),
            "high": round(float(row["high"]), 2),
            "low": round(float(row["low"]), 2),
            "close": round(float(row["close"]), 2),
            "volume": int(row["volume"])
        })
        
    return {
        "symbol": sym,
        "timeframe": timeframe,
        "period": period,
        "provider": meta.get("provider", quote.get("provider", "Yahoo Finance")),
        "is_live": meta.get("is_live", quote.get("is_live", True)),
        "is_stale": meta.get("is_stale", quote.get("is_stale", False)),
        "timestamp": meta.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z"),
        "status_message": meta.get("status_message", quote.get("status_message", "Market data active")),
        "quote": quote,
        "candles": candles,
        "total_bars": len(candles)
    }
