from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from backend.app.services.risk_engine import RiskEngine, RiskCheckRequest, RiskCheckResult
from backend.app.services.paper_trading import paper_trading_service

router = APIRouter(prefix="/api/risk", tags=["Risk Management"])

class RiskPolicyUpdateRequest(BaseModel):
    max_risk_per_trade_pct: Optional[float] = None
    max_daily_loss_pct: Optional[float] = None
    max_portfolio_exposure_pct: Optional[float] = None
    max_position_size_pct: Optional[float] = None
    max_open_positions: Optional[int] = None
    require_stop_loss: Optional[bool] = None
    circuit_breaker_active: Optional[bool] = None

@router.post("/check", response_model=RiskCheckResult)
async def check_order_risk(req: RiskCheckRequest):
    """
    Simulates pre-trade risk evaluation for proposed order parameters.
    Indicates whether the trade is APPROVED or BLOCKED under current policy.
    """
    return paper_trading_service.risk_engine.evaluate_order(req)

@router.get("/policy")
async def get_current_risk_policy():
    """Retrieve active institutional risk policies and exposure limits"""
    re = paper_trading_service.risk_engine
    portfolio = paper_trading_service.get_portfolio_summary()
    return {
        "max_risk_per_trade_pct": re.max_risk_per_trade_pct,
        "max_daily_loss_pct": re.max_daily_loss_pct,
        "max_portfolio_exposure_pct": re.max_portfolio_exposure_pct,
        "max_position_size_pct": re.max_position_size_pct,
        "max_open_positions": re.max_open_positions,
        "require_stop_loss": re.require_stop_loss,
        "require_take_profit": re.require_take_profit,
        "circuit_breaker_active": re.circuit_breaker_active,
        "current_exposure_pct": portfolio["portfolio_exposure_pct"],
        "open_positions_count": portfolio["open_positions_count"],
        "capital_at_risk": round(sum(p["quantity"] * abs(p["average_entry"] - (p.get("stop_loss") or p["average_entry"] * 0.95)) for p in portfolio["positions"]), 2)
    }

@router.post("/policy")
async def update_risk_policy(req: RiskPolicyUpdateRequest):
    """Dynamically update risk management policy limits"""
    re = paper_trading_service.risk_engine
    if req.max_risk_per_trade_pct is not None:
        re.max_risk_per_trade_pct = req.max_risk_per_trade_pct
    if req.max_daily_loss_pct is not None:
        re.max_daily_loss_pct = req.max_daily_loss_pct
    if req.max_portfolio_exposure_pct is not None:
        re.max_portfolio_exposure_pct = req.max_portfolio_exposure_pct
    if req.max_position_size_pct is not None:
        re.max_position_size_pct = req.max_position_size_pct
    if req.max_open_positions is not None:
        re.max_open_positions = req.max_open_positions
    if req.require_stop_loss is not None:
        re.require_stop_loss = req.require_stop_loss
    if req.circuit_breaker_active is not None:
        re.circuit_breaker_active = req.circuit_breaker_active

    return {"status": "SUCCESS", "message": "Risk policy updated successfully"}
