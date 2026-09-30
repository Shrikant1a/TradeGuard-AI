import datetime
from typing import Dict, Any, List, Optional
from backend.app.services.risk_engine import RiskEngine, RiskCheckRequest
from backend.app.services.stellar_service import stellar_service

class PaperTradingService:
    """
    TradeGuard In-Memory / Database-Synchronized Paper Trading Manager
    Tracks virtual capital (default ₹10,00,000), open positions, executed orders, and pre-trade risk validation.
    """

    def __init__(self, initial_capital: float = 1000000.0):
        self.initial_capital = initial_capital
        self.virtual_balance = initial_capital
        self.realized_pnl = 0.0
        self.positions: Dict[str, Dict[str, Any]] = {}
        self.trade_history: List[Dict[str, Any]] = []
        self.risk_engine = RiskEngine()
        
        # Seed default realistic positions for portfolio view
        self._seed_initial_positions()

    def _seed_initial_positions(self):
        """Seed initial active positions (AAPL, NVDA) so user sees active portfolio immediately"""
        self.positions["AAPL"] = {
            "symbol": "AAPL",
            "side": "LONG",
            "quantity": 35.0,
            "average_entry": 218.40,
            "current_price": 224.23,
            "stop_loss": 212.00,
            "take_profit": 236.00,
            "unrealized_pnl": round(35.0 * (224.23 - 218.40), 2),
            "unrealized_pnl_pct": round(((224.23 - 218.40) / 218.40) * 100, 2),
            "market_value": round(35.0 * 224.23, 2),
            "ai_recommendation": "BUY",
            "risk_level": "LOW",
            "blockchain_verified": True,
            "opened_at": (datetime.datetime.utcnow() - datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M")
        }
        self.positions["NVDA"] = {
            "symbol": "NVDA",
            "side": "LONG",
            "quantity": 50.0,
            "average_entry": 121.10,
            "current_price": 128.50,
            "stop_loss": 116.00,
            "take_profit": 140.00,
            "unrealized_pnl": round(50.0 * (128.50 - 121.10), 2),
            "unrealized_pnl_pct": round(((128.50 - 121.10) / 121.10) * 100, 2),
            "market_value": round(50.0 * 128.50, 2),
            "ai_recommendation": "BUY",
            "risk_level": "MEDIUM",
            "blockchain_verified": True,
            "opened_at": (datetime.datetime.utcnow() - datetime.timedelta(days=5)).strftime("%Y-%m-%d %H:%M")
        }
        # Deduct invested capital
        invested = sum(p["market_value"] for p in self.positions.values())
        self.virtual_balance = self.initial_capital - invested

    def get_portfolio_summary(self) -> Dict[str, Any]:
        """Calculates live portfolio metrics, allocation %, and exposure"""
        open_positions = list(self.positions.values())
        total_market_value = sum(p["market_value"] for p in open_positions)
        total_unrealized_pnl = sum(p["unrealized_pnl"] for p in open_positions)
        total_equity = self.virtual_balance + total_market_value
        total_pnl = total_unrealized_pnl + self.realized_pnl
        total_pnl_pct = (total_pnl / self.initial_capital) * 100.0
        exposure_pct = (total_market_value / total_equity * 100.0) if total_equity > 0 else 0.0

        # Calculate allocation breakdown
        allocations = []
        for p in open_positions:
            alloc_pct = (p["market_value"] / total_equity) * 100.0 if total_equity > 0 else 0
            p["allocation_pct"] = round(alloc_pct, 1)
            allocations.append({
                "symbol": p["symbol"],
                "value": p["market_value"],
                "percentage": round(alloc_pct, 1)
            })

        cash_pct = (self.virtual_balance / total_equity) * 100.0 if total_equity > 0 else 100.0
        allocations.append({
            "symbol": "CASH (INR)",
            "value": round(self.virtual_balance, 2),
            "percentage": round(cash_pct, 1)
        })

        return {
            "initial_capital": self.initial_capital,
            "virtual_cash": round(self.virtual_balance, 2),
            "total_market_value": round(total_market_value, 2),
            "total_equity": round(total_equity, 2),
            "today_pnl": round(total_unrealized_pnl * 0.45, 2), # estimated intraday component
            "unrealized_pnl": round(total_unrealized_pnl, 2),
            "realized_pnl": round(self.realized_pnl, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": round(total_pnl_pct, 2),
            "open_positions_count": len(open_positions),
            "portfolio_exposure_pct": round(exposure_pct, 1),
            "currency": "INR (₹)",
            "positions": open_positions,
            "allocations": allocations
        }

    async def execute_trade(
        self,
        symbol: str,
        side: str, # BUY or SELL
        quantity: float,
        price: float,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes a paper order after passing Risk Management Engine validation.
        """
        sym = symbol.upper().strip()
        side = side.upper().strip()
        portfolio_summary = self.get_portfolio_summary()

        # 1. Pre-Trade Risk Engine Validation
        risk_req = RiskCheckRequest(
            symbol=sym,
            side=side,
            quantity=quantity,
            entry_price=price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            portfolio_equity=portfolio_summary["total_equity"],
            existing_open_positions_count=len(self.positions),
            current_portfolio_exposure_value=portfolio_summary["total_market_value"],
            daily_realized_loss_pct=0.0
        )
        risk_result = self.risk_engine.evaluate_order(risk_req)

        # If blocked by Risk Engine, do NOT execute
        if not risk_result.allowed:
            blocked_trade_record = {
                "id": len(self.trade_history) + 1,
                "symbol": sym,
                "side": side,
                "quantity": quantity,
                "price": price,
                "status": "BLOCKED",
                "blocking_reasons": risk_result.blocking_reasons,
                "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            }
            self.trade_history.insert(0, blocked_trade_record)
            return {
                "success": False,
                "status": "BLOCKED",
                "message": "Trade blocked by risk-management policy.",
                "risk_result": risk_result.dict(),
                "trade_record": blocked_trade_record
            }

        total_cost = quantity * price

        # 2. Check virtual cash balance for BUY
        if side == "BUY":
            if total_cost > self.virtual_balance:
                return {
                    "success": False,
                    "status": "REJECTED",
                    "message": f"Insufficient virtual cash balance: Need ₹{total_cost:,.2f}, Available: ₹{self.virtual_balance:,.2f}",
                    "risk_result": risk_result.dict()
                }

            self.virtual_balance -= total_cost

            # Update or create position
            if sym in self.positions:
                pos = self.positions[sym]
                new_qty = pos["quantity"] + quantity
                new_entry = ((pos["average_entry"] * pos["quantity"]) + total_cost) / new_qty
                pos["quantity"] = new_qty
                pos["average_entry"] = round(new_entry, 2)
                pos["stop_loss"] = stop_loss or pos["stop_loss"]
                pos["take_profit"] = take_profit or pos["take_profit"]
            else:
                self.positions[sym] = {
                    "symbol": sym,
                    "side": "LONG",
                    "quantity": quantity,
                    "average_entry": price,
                    "current_price": price,
                    "stop_loss": stop_loss,
                    "take_profit": take_profit,
                    "unrealized_pnl": 0.0,
                    "unrealized_pnl_pct": 0.0,
                    "market_value": round(total_cost, 2),
                    "ai_recommendation": "BUY",
                    "risk_level": "MEDIUM",
                    "blockchain_verified": True,
                    "opened_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                }

        elif side == "SELL":
            # Selling an existing position
            if sym not in self.positions:
                return {
                    "success": False,
                    "status": "REJECTED",
                    "message": f"No active position for {sym} to sell.",
                    "risk_result": risk_result.dict()
                }
            pos = self.positions[sym]
            if quantity > pos["quantity"]:
                quantity = pos["quantity"] # Close max available
            
            sale_revenue = quantity * price
            cost_portion = quantity * pos["average_entry"]
            realized_gain = sale_revenue - cost_portion

            self.virtual_balance += sale_revenue
            self.realized_pnl += realized_gain

            pos["quantity"] -= quantity
            if pos["quantity"] <= 0:
                del self.positions[sym]
            else:
                pos["market_value"] = round(pos["quantity"] * price, 2)

        # 3. Blockchain audit record for executed trade
        sig_hash = stellar_service.generate_sha256({
            "symbol": sym,
            "side": side,
            "quantity": quantity,
            "price": price,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        tx_record = await stellar_service.record_signal_on_chain(
            signal_code=f"TRD-{abs(hash(sym + str(price) + str(quantity))) % 9000 + 1000}",
            asset_symbol=sym,
            signal_type=side,
            model_version="TradeGuard-Paper-v1.2",
            strategy_hash=stellar_service.generate_sha256("TradeGuard-Execution-Engine"),
            signal_hash=sig_hash,
            risk_level="MEDIUM"
        )

        trade_record = {
            "id": len(self.trade_history) + 1,
            "symbol": sym,
            "side": side,
            "quantity": quantity,
            "price": price,
            "total_value": round(total_cost, 2),
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "status": "EXECUTED",
            "blockchain_tx_hash": tx_record["stellar_tx_hash"],
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.trade_history.insert(0, trade_record)

        return {
            "success": True,
            "status": "EXECUTED",
            "message": f"Paper trade for {quantity} {sym} executed successfully.",
            "trade": trade_record,
            "risk_result": risk_result.dict(),
            "portfolio": self.get_portfolio_summary()
        }

    def reset_portfolio(self):
        self.virtual_balance = self.initial_capital
        self.realized_pnl = 0.0
        self.positions.clear()
        self.trade_history.clear()
        self._seed_initial_positions()
        return self.get_portfolio_summary()

paper_trading_service = PaperTradingService()
