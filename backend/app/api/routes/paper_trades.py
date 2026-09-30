from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.app.services.paper_trading import paper_trading_service

router = APIRouter(prefix="/api/paper-trades", tags=["Paper Trading"])

class PaperTradeRequest(BaseModel):
    symbol: str
    side: str # BUY, SELL
    quantity: float
    price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

@router.post("")
async def create_paper_trade(req: PaperTradeRequest):
    """
    Submits a paper trade order.
    The order is first validated by the dedicated TradeGuard Risk Engine.
    If the order exceeds risk parameters, it is BLOCKED and logged.
    """
    result = await paper_trading_service.execute_trade(
        symbol=req.symbol,
        side=req.side,
        quantity=req.quantity,
        price=req.price,
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
