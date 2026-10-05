import datetime
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.indian_market_calendar import indian_market_calendar
from backend.app.services.symbol_registry import symbol_registry, INDIAN_INDICES_REGISTRY

router = APIRouter(prefix="/api/market-data", tags=["Market Data"])
market_provider = MarketDataProvider.get_instance()


@router.get("/status")
async def get_market_status():
    """
    Returns current Indian stock market session status (NSE/BSE),
    including regular trading hours (09:15 - 15:30 IST), pre-market,
    post-market, weekend, and official exchange holiday detection.
    """
    return indian_market_calendar.get_market_status()


@router.get("/indices")
async def get_market_indices():
    """
    Returns quotes for major Indian benchmark indices:
    NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT, NIFTY MIDCAP 100, NIFTY NEXT 50.
    """
    results: List[Dict[str, Any]] = []
    for idx_name in ["NIFTY 50", "SENSEX", "NIFTY BANK", "NIFTY IT", "NIFTY MIDCAP 100", "NIFTY NEXT 50"]:
        try:
            quote = await market_provider.get_current_quote(idx_name)
            idx_info = INDIAN_INDICES_REGISTRY.get(idx_name, {})
            results.append({
                "symbol": idx_name,
                "display_name": idx_info.get("display_name", idx_name),
                "company_name": idx_info.get("company_name", idx_name),
                "exchange": idx_info.get("exchange", "NSE"),
                "currency": "INR",
                "currency_symbol": "₹",
                "price": quote.get("price", idx_info.get("base_price", 25000.0)),
                "change": quote.get("change", 0.0),
                "change_pct": quote.get("change_pct", 0.0),
                "is_live": quote.get("is_live", True),
                "provider": quote.get("provider", "Yahoo Finance"),
                "timestamp": quote.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z")
            })
        except Exception as e:
            idx_info = INDIAN_INDICES_REGISTRY.get(idx_name, {})
            results.append({
                "symbol": idx_name,
                "display_name": idx_info.get("display_name", idx_name),
                "company_name": idx_info.get("company_name", idx_name),
                "exchange": idx_info.get("exchange", "NSE"),
                "currency": "INR",
                "currency_symbol": "₹",
                "price": idx_info.get("base_price", 25000.0),
                "change": 0.0,
                "change_pct": 0.0,
                "is_live": False,
                "provider": "Synthetic Fallback",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            })
    return results


@router.get("/{symbol}")
async def get_market_data(
    symbol: str, 
    timeframe: str = Query("1d", description="Timeframe interval (1d, 1h, 1wk)"),
    period: str = Query("6mo", description="Historical period (1mo, 3mo, 6mo, 1y, 2y)")
):
    """
    Retrieve historical OHLCV candle bars and transparent live/fallback quote for a symbol.
    Clearly attributes provider ('Yahoo Finance' vs 'Synthetic Fallback'),
    exchange ('NSE' / 'BSE'), currency ('INR' / '₹'),
    live status, staleness indicator, and timestamp.
    """
    sym = symbol.upper().strip()
    resolved = symbol_registry.resolve(sym)
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
        "symbol": resolved["symbol"],
        "company_name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
        "exchange": resolved.get("exchange", "NSE"),
        "market": resolved.get("market", "India"),
        "currency": resolved.get("currency", "INR"),
        "currency_symbol": resolved.get("currency_symbol", "₹"),
        "timeframe": timeframe,
        "period": period,
        "provider": meta.get("provider", quote.get("provider", "Yahoo Finance")),
        "is_live": meta.get("is_live", quote.get("is_live", True)),
        "is_stale": meta.get("is_stale", quote.get("is_stale", False)),
        "timestamp": meta.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z"),
        "status_message": meta.get("status_message", quote.get("status_message", "Market data active")),
        "quote": quote,
        "candles": candles,
        "bars": candles,
        "total_bars": len(candles)
    }
