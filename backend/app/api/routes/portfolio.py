from fastapi import APIRouter
from backend.app.services.paper_trading import paper_trading_service

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.get("")
async def get_portfolio():
    """Retrieve live portfolio equity, holdings, allocations, and open positions"""
    return paper_trading_service.get_portfolio_summary()
