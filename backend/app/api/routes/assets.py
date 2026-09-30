from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from backend.app.services.market_data import MarketDataProvider

router = APIRouter(prefix="/api/assets", tags=["Assets"])
market_provider = MarketDataProvider.get_instance()

@router.get("")
async def list_assets(q: str = Query("", description="Search term for symbol or name")):
    """List or search financial assets available for analysis"""
    return await market_provider.search_assets(q)

@router.get("/{symbol}")
async def get_asset_profile(symbol: str):
    """Retrieve detailed asset profile and live quote"""
    sym = symbol.upper().strip()
    quote = await market_provider.get_current_quote(sym)
    return {
        "symbol": sym,
        "name": f"{sym} Market Asset",
        "exchange": "NASDAQ" if ".NS" not in sym else "NSE",
        "quote": quote,
        "disclaimer": "Market data is provided for research and paper trading purposes."
    }
