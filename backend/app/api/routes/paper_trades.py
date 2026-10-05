from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from backend.app.services.paper_trading import paper_trading_service
from backend.app.services.market_data import MarketDataProvider

router = APIRouter(prefix="/api/paper-trades", tags=["Paper Trading"])
market_provider = MarketDataProvider.get_instance()

class PaperTradeRequest(BaseModel):
    symbol: str = Field(..., description="Asset ticker symbol, e.g. AAPL, NVDA, RELIANCE.NS")
    side: str = Field(..., description="BUY or SELL")
    quantity: float = Field(..., gt=0, description="Order quantity (must be strictly positive)")
    price: Optional[float] = Field(None, gt=0, description="Execution price (defaults to live market price if omitted)")
    stop_loss: Optional[float] = Field(None, description="Mandatory protective stop loss price")
    take_profit: Optional[float] = Field(None, description="Profit target price")

@router.post("")
async def create_paper_trade(req: PaperTradeRequest):
    """
    Submits a paper trade order.
    The order is validated server-side by the dedicated TradeGuard Risk Engine.
    If the order violates any risk policies or balance constraints, it is BLOCKED/REJECTED
    and logged with the exact reasons.
    """
    sym = req.symbol.upper().strip()
    exec_price = req.price
    if exec_price is None or exec_price <= 0:
        quote = await market_provider.get_current_quote(sym)
        exec_price = float(quote.get("price", 100.0))

    result = await paper_trading_service.execute_trade(
        symbol=sym,
        side=req.side,
        quantity=req.quantity,
        price=exec_price,
        stop_loss=req.stop_loss,
        take_profit=req.take_profit
    )
    return result

@router.get("/history")
async def get_trade_history():
    """Retrieve full audit log of executed and blocked paper orders"""
    return paper_trading_service.trade_history

@router.post("/reset")
async def reset_paper_balance():
    """Resets paper trading portfolio to default ₹10,00,000 balance"""
    return paper_trading_service.reset_portfolio()
