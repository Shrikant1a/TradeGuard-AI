from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.symbol_registry import symbol_registry

router = APIRouter(prefix="/api/assets", tags=["Assets"])
market_provider = MarketDataProvider.get_instance()

@router.get("")
async def list_assets(q: str = Query("", description="Search term for symbol or name")):
    """List or search financial assets available for analysis (India-first ordering)"""
    return await market_provider.search_assets(q)

@router.get("/{symbol}")
async def get_asset_profile(symbol: str):
    """Retrieve detailed normalized asset profile and live quote"""
    sym = symbol.upper().strip()
    resolved = symbol_registry.resolve(sym)
    quote = await market_provider.get_current_quote(sym)
    return {
        "symbol": resolved["symbol"],
        "name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
        "exchange": resolved.get("exchange", "NSE"),
        "market": resolved.get("market", "India"),
        "currency": resolved.get("currency", "INR"),
        "currency_symbol": resolved.get("currency_symbol", "₹"),
        "quote": quote,
        "tradingview_symbol": resolved.get("tradingview_symbol", f"NSE:{resolved['symbol']}"),
        "disclaimer": "Market data is provided for research and paper trading purposes."
    }
