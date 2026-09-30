from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from backend.app.services.market_data import MarketDataProvider
from backend.app.services.backtesting import BacktestingEngine

router = APIRouter(prefix="/api/backtest", tags=["Backtesting"])
market_provider = MarketDataProvider.get_instance()

BACKTEST_CACHE: Dict[str, Any] = {}

class BacktestRequest(BaseModel):
    symbol: str = "AAPL"
    strategy: str = "ai_multi_factor" # ai_multi_factor, mean_reversion, ema_cross
    initial_capital: float = 1000000.0
    risk_per_trade_pct: float = 1.0
    rsi_oversold: int = 35
    rsi_overbought: int = 65
    ema_fast: int = 20
    ema_slow: int = 50
    atr_mult: float = 1.8
    rr_ratio: float = 2.0

@router.post("")
async def run_backtest_endpoint(req: BacktestRequest):
    """Executes historical simulation accounting for slippage and transaction costs"""
    sym = req.symbol.upper().strip()
    df = await market_provider.get_historical_bars(sym, period="1y")
    
    engine = BacktestingEngine(risk_per_trade_pct=req.risk_per_trade_pct)
    params = {
        "rsi_oversold": req.rsi_oversold,
        "rsi_overbought": req.rsi_overbought,
        "ema_fast": req.ema_fast,
        "ema_slow": req.ema_slow,
        "atr_mult": req.atr_mult,
        "rr_ratio": req.rr_ratio
    }
    
    result = engine.run_backtest(
        df=df,
        symbol=sym,
        strategy_name=req.strategy,
        initial_capital=req.initial_capital,
        strategy_params=params
    )

    backtest_id = f"BT-{abs(hash(sym + req.strategy + str(req.initial_capital))) % 90000 + 10000}"
    result["id"] = backtest_id
    BACKTEST_CACHE[backtest_id] = result

    return result

@router.get("/{id}")
async def get_backtest_by_id(id: str):
    """Retrieve historical backtest results by backtest ID"""
    if id in BACKTEST_CACHE:
        return BACKTEST_CACHE[id]
    raise HTTPException(status_code=404, detail="Backtest report not found")
