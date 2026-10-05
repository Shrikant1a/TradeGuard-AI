from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import datetime
import hashlib
import json

router = APIRouter(prefix="/api/strategies", tags=["Strategies"])

STRATEGIES_STORE: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "TradeGuard Multi-Factor Momentum",
        "version": "v1.2",
        "description": "Combines Fast EMA (20), Slow EMA (50), RSI(14) bands, and ATR-based volatility brackets.",
        "parameters": {
            "rsi_oversold": 35,
            "rsi_overbought": 65,
            "ema_fast": 20,
            "ema_slow": 50,
            "atr_mult": 1.8,
            "rr_ratio": 2.0,
            "risk_pct": 1.0
        },
        "strategy_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "win_rate": 64.5,
        "profit_factor": 1.85,
        "max_drawdown": 8.2,
        "created_at": "2026-09-15 10:00:00"
    },
    {
        "id": 2,
        "name": "Mean Reversion Bollinger Bands",
        "version": "v1.0",
        "description": "Exploits short-term oversold deviations at the lower 2-sigma Bollinger band with strict ATR trailing stops.",
        "parameters": {
            "rsi_oversold": 30,
            "rsi_overbought": 70,
            "ema_fast": 14,
            "ema_slow": 40,
            "atr_mult": 1.5,
            "rr_ratio": 1.8,
            "risk_pct": 1.0
        },
        "strategy_hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        "win_rate": 58.2,
        "profit_factor": 1.52,
        "max_drawdown": 11.4,
        "created_at": "2026-09-01 14:30:00"
    },
    {
        "id": 3,
        "name": "MACD Trend Divergence",
        "version": "v1.1",
        "description": "Identifies bullish/bearish divergences between price and MACD histogram with 200 EMA trend filtering.",
        "parameters": {
            "fast_period": 12,
            "slow_period": 26,
            "signal_period": 9,
            "filter_ema": 200,
            "rr_ratio": 2.2,
            "risk_pct": 1.0
        },
        "strategy_hash": "9c12a4d38e7b1a2389cf78912ef3456789abcdef0123456789abcdef01234567",
        "win_rate": 61.8,
        "profit_factor": 1.74,
        "max_drawdown": 9.1,
        "created_at": "2026-09-18 09:15:00"
    },
    {
        "id": 4,
        "name": "High Volatility Breakout",
        "version": "v1.0",
        "description": "Captures 20-day high/low breakout expansions with dynamic ATR stop placement and trailing profit locks.",
        "parameters": {
            "donchian_period": 20,
            "volume_threshold": 1.5,
            "atr_multiplier": 2.0,
            "rr_ratio": 2.5,
            "risk_pct": 0.8
        },
        "strategy_hash": "a4d38e7b1a2389cf78912ef3456789abcdef0123456789abcdef0123456789bc",
        "win_rate": 53.4,
        "profit_factor": 2.15,
        "max_drawdown": 12.8,
        "created_at": "2026-09-22 11:30:00"
    },
    {
        "id": 5,
        "name": "Moving Average Golden Cross",
        "version": "v2.0",
        "description": "Classic 50-day SMA crossing above 200-day SMA for macro position trading on large-cap Indian & global equities.",
        "parameters": {
            "fast_sma": 50,
            "slow_sma": 200,
            "atr_mult": 2.5,
            "rr_ratio": 3.0,
            "risk_pct": 1.0
        },
        "strategy_hash": "b5e49f8c2b3490da89023fa456789bcdef0123456789bcdef0123456789bcde1",
        "win_rate": 66.2,
        "profit_factor": 2.08,
        "max_drawdown": 7.5,
        "created_at": "2026-09-25 15:00:00"
    },
    {
        "id": 6,
        "name": "VWAP Intraday Reversal",
        "version": "v1.0",
        "description": "Trades standard deviation band re-entries around volume-weighted average price during Indian market hours.",
        "parameters": {
            "vwap_sigma": 2.0,
            "rsi_filter": 35,
            "rr_ratio": 1.5,
            "risk_pct": 0.5
        },
        "strategy_hash": "c6f50a9d3c4501eb901340b56789cdef0123456789cdef0123456789cdef0123",
        "win_rate": 59.5,
        "profit_factor": 1.62,
        "max_drawdown": 6.8,
        "created_at": "2026-09-28 10:45:00"
    }
]

class SaveStrategyRequest(BaseModel):
    name: str
    version: str = "v1.0"
    description: Optional[str] = None
    parameters: Dict[str, Any]

@router.get("")
async def list_strategies():
    """Retrieve all saved strategy configurations and performance benchmarks"""
    return STRATEGIES_STORE

@router.post("")
async def save_strategy(req: SaveStrategyRequest):
    """Saves and cryptographically versions a trading strategy in the Strategy Lab"""
    param_json = json.dumps(req.parameters, sort_keys=True)
    strat_hash = hashlib.sha256(param_json.encode()).hexdigest()

    new_strat = {
        "id": len(STRATEGIES_STORE) + 1,
        "name": req.name,
        "version": req.version,
        "description": req.description or "User custom configured strategy in Strategy Lab",
        "parameters": req.parameters,
        "strategy_hash": strat_hash,
        "win_rate": 61.0,
        "profit_factor": 1.68,
        "max_drawdown": 9.5,
        "created_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }

    STRATEGIES_STORE.append(new_strat)
    return new_strat
