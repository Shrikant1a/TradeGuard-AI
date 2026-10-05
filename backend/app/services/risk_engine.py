from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class RiskCheckRequest(BaseModel):
    symbol: str
    side: str # BUY, SELL
    quantity: float
    entry_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    portfolio_equity: float = 1000000.0 # Default ₹10,00,000
    existing_open_positions_count: int = 0
    current_portfolio_exposure_value: float = 0.0
    daily_realized_loss_pct: float = 0.0
    atr_pct: float = 2.0

class RiskCheckResult(BaseModel):
    allowed: bool
    status: str # APPROVED, BLOCKED
    blocking_reasons: List[str]
    reasons: List[str] = []
    warnings: List[str]
    risk_amount: float
    risk_percentage: float
    max_allowed_risk: float
    position_value: float
    position_pct_of_capital: float
    risk_reward_ratio: Optional[float]
    suggested_adjusted_quantity: Optional[float]
    policy_snapshot: Dict[str, Any]

class RiskEngine:
    """
    Dedicated TradeGuard Risk Engine
    Validates any proposed order prior to execution against strict institutional-grade risk limits.
    Blocks any trade violating capital preservation rules.
    """

    def __init__(
        self,
        max_risk_per_trade_pct: float = 1.0,      # Max 1% capital risked on one trade
        max_daily_loss_pct: float = 3.0,          # 3% daily drawdown circuit breaker
        max_portfolio_exposure_pct: float = 40.0, # Max 40% capital tied up in open positions
        max_position_size_pct: float = 15.0,      # Max 15% in single asset
        max_open_positions: int = 5,
        require_stop_loss: bool = True,
        require_take_profit: bool = True,
        max_volatility_threshold_atr_pct: float = 5.0,
        circuit_breaker_active: bool = False
    ):
        self.max_risk_per_trade_pct = max_risk_per_trade_pct
        self.max_daily_loss_pct = max_daily_loss_pct
        self.max_portfolio_exposure_pct = max_portfolio_exposure_pct
        self.max_position_size_pct = max_position_size_pct
        self.max_open_positions = max_open_positions
        self.require_stop_loss = require_stop_loss
        self.require_take_profit = require_take_profit
        self.max_volatility_threshold_atr_pct = max_volatility_threshold_atr_pct
        self.circuit_breaker_active = circuit_breaker_active

    def evaluate_order(self, req: RiskCheckRequest) -> RiskCheckResult:
        blocking_reasons = []
        warnings = []

        total_capital = max(req.portfolio_equity, 1000.0)
        max_allowed_risk_amount = (self.max_risk_per_trade_pct / 100.0) * total_capital
        position_value = req.quantity * req.entry_price
        position_pct_of_capital = (position_value / total_capital) * 100.0

        # 1. Circuit Breaker Check
        if self.circuit_breaker_active:
            blocking_reasons.append("Trading circuit breaker is currently ACTIVE. New orders halted.")

        # 2. Daily Loss Limit Check
        if req.daily_realized_loss_pct >= self.max_daily_loss_pct:
            blocking_reasons.append(
                f"Daily realized loss ({req.daily_realized_loss_pct:.2f}%) has breached the maximum threshold "
                f"({self.max_daily_loss_pct:.2f}%). Trading locked for the day."
            )

        # 3. Maximum Open Positions
        if req.existing_open_positions_count >= self.max_open_positions:
            blocking_reasons.append(
                f"Open position count ({req.existing_open_positions_count}) has reached the maximum permitted limit "
                f"({self.max_open_positions})."
            )

        # 4. Mandatory Stop-Loss Enforcement
        if self.require_stop_loss and (req.stop_loss is None or req.stop_loss <= 0):
            blocking_reasons.append("Mandatory stop-loss rule violated: Order must include a predefined stop-loss price.")

        # 5. Mandatory Take-Profit Enforcement
        if self.require_take_profit and (req.take_profit is None or req.take_profit <= 0):
            blocking_reasons.append("Mandatory take-profit rule violated: Order must include a predefined profit target.")

        # 6. Stop-Loss Orientation & Risk Amount Calculation
        risk_per_unit = 0.0
        risk_amount = 0.0
        risk_percentage = 0.0
        risk_reward_ratio = None

        if req.stop_loss and req.stop_loss > 0:
            if req.side.upper() == "BUY":
                if req.stop_loss >= req.entry_price:
                    blocking_reasons.append("Invalid Stop-Loss: For a BUY trade, stop-loss must be lower than the entry price.")
                else:
                    risk_per_unit = req.entry_price - req.stop_loss
            elif req.side.upper() == "SELL":
                if req.stop_loss <= req.entry_price:
                    blocking_reasons.append("Invalid Stop-Loss: For a SELL trade, stop-loss must be higher than the entry price.")
                else:
                    risk_per_unit = req.stop_loss - req.entry_price

            risk_amount = risk_per_unit * req.quantity
            risk_percentage = (risk_amount / total_capital) * 100.0

            # 7. Check if Risk Exceeds Max Risk Per Trade (e.g. ₹10,000 on ₹10,00,000)
            if risk_amount > max_allowed_risk_amount:
                blocking_reasons.append(
                    f"Trade blocked by risk-management policy: Total risk amount ₹{risk_amount:,.2f} ({risk_percentage:.2f}%) "
                    f"exceeds the max risk limit of ₹{max_allowed_risk_amount:,.2f} ({self.max_risk_per_trade_pct:.2f}%)."
                )

        # 8. Check Risk / Reward Ratio
        if req.take_profit and req.stop_loss and risk_per_unit > 0:
            if req.side.upper() == "BUY":
                potential_gain_per_unit = req.take_profit - req.entry_price
            else:
                potential_gain_per_unit = req.entry_price - req.take_profit
            
            if potential_gain_per_unit <= 0:
                blocking_reasons.append("Invalid Take-Profit: Target price must be in favorable direction of trade.")
            else:
                risk_reward_ratio = round(potential_gain_per_unit / risk_per_unit, 2)
                if risk_reward_ratio < 1.0:
                    warnings.append(f"Risk/Reward ratio ({risk_reward_ratio}:1) is below recommended 1.5:1 minimum.")

        # 9. Maximum Single Position Allocation
        if position_pct_of_capital > self.max_position_size_pct:
            blocking_reasons.append(
                f"Position size ₹{position_value:,.2f} ({position_pct_of_capital:.1f}%) exceeds the max allowed allocation "
                f"of {self.max_position_size_pct:.1f}% per asset."
            )

        # 10. Maximum Total Portfolio Exposure
        new_total_exposure = req.current_portfolio_exposure_value + position_value
        exposure_pct = (new_total_exposure / total_capital) * 100.0
        if exposure_pct > self.max_portfolio_exposure_pct:
            blocking_reasons.append(
                f"Total portfolio market exposure would reach {exposure_pct:.1f}%, exceeding the maximum allowed "
                f"limit of {self.max_portfolio_exposure_pct:.1f}%."
            )

        # 11. Volatility check
        if req.atr_pct > self.max_volatility_threshold_atr_pct:
            warnings.append(f"Asset ATR volatility ({req.atr_pct:.1f}%) exceeds safety threshold ({self.max_volatility_threshold_atr_pct}%).")

        # Suggested adjusted quantity if risk limit exceeded
        suggested_qty = None
        if risk_per_unit > 0:
            suggested_qty = max(1.0, float(int(max_allowed_risk_amount / risk_per_unit)))

        allowed = len(blocking_reasons) == 0

        return RiskCheckResult(
            allowed=allowed,
            status="APPROVED" if allowed else "BLOCKED",
            blocking_reasons=blocking_reasons,
            reasons=blocking_reasons,
            warnings=warnings,
            risk_amount=round(risk_amount, 2),
            risk_percentage=round(risk_percentage, 2),
            max_allowed_risk=round(max_allowed_risk_amount, 2),
            position_value=round(position_value, 2),
            position_pct_of_capital=round(position_pct_of_capital, 2),
            risk_reward_ratio=risk_reward_ratio,
            suggested_adjusted_quantity=suggested_qty,
            policy_snapshot={
                "max_risk_per_trade_pct": self.max_risk_per_trade_pct,
                "max_daily_loss_pct": self.max_daily_loss_pct,
                "max_portfolio_exposure_pct": self.max_portfolio_exposure_pct,
                "max_position_size_pct": self.max_position_size_pct,
                "max_open_positions": self.max_open_positions,
                "require_stop_loss": self.require_stop_loss
            }
        )
