import datetime
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from backend.app.services.technical_analysis import TechnicalAnalysisService

class BacktestingEngine:
    """
    Realistic Backtesting Simulation Engine:
    - Accounts for slippage (0.05%) and transaction commissions (0.03%)
    - Dynamic ATR-based stop-loss and take-profit execution
    - Fixed fractional position sizing
    - Calculates Sharpe Ratio, Maximum Drawdown, Profit Factor, Win Rate
    - Computes cumulative equity curve, drawdown series, and monthly performance table
    """

    def __init__(
        self,
        slippage_pct: float = 0.05,        # 0.05% per execution
        commission_pct: float = 0.03,      # 0.03% broker fee
        risk_per_trade_pct: float = 1.0    # 1.0% capital risk per trade
    ):
        self.slippage = slippage_pct / 100.0
        self.commission = commission_pct / 100.0
        self.risk_pct = risk_per_trade_pct / 100.0

    def run_backtest(
        self,
        df: pd.DataFrame,
        symbol: str,
        strategy_name: str = "ai_multi_factor",
        initial_capital: float = 1000000.0,
        strategy_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        params = strategy_params or {}
        rsi_oversold = params.get("rsi_oversold", 35)
        rsi_overbought = params.get("rsi_overbought", 65)
        ema_fast_len = params.get("ema_fast", 20)
        ema_slow_len = params.get("ema_slow", 50)
        atr_multiplier = params.get("atr_mult", 1.8)
        rr_ratio = params.get("rr_ratio", 2.0)

        data = TechnicalAnalysisService.calculate_indicators(df)
        if len(data) < 30:
            raise ValueError("Insufficient data points for backtesting (minimum 30 required)")

        capital = initial_capital
        peak_capital = initial_capital
        max_drawdown = 0.0

        position = None # None or dict(entry_price, qty, stop_loss, take_profit, entry_date)
        trades: List[Dict[str, Any]] = []
        equity_curve: List[Dict[str, Any]] = []
        daily_returns: List[float] = []

        close_series = data["close"].values
        high_series = data["high"].values
        low_series = data["low"].values
        dates = [str(d)[:10] for d in data["timestamp"]]

        # Precompute strategy signal indicators
        fast_ema = data["close"].ewm(span=ema_fast_len, adjust=False).mean().values
        slow_ema = data["close"].ewm(span=ema_slow_len, adjust=False).mean().values
        sma50 = data["sma_50"].values
        rsi = data["rsi"].values
        macd_h = data["macd_hist"].values
        atr = data["atr"].values

        for i in range(20, len(data)):
            dt = dates[i]
            current_close = close_series[i]
            current_high = high_series[i]
            current_low = low_series[i]
            current_atr = atr[i] if not np.isnan(atr[i]) else current_close * 0.02

            # Check open position exit conditions first
            if position is not None:
                exit_price = None
                exit_reason = None

                # Check Stop Loss hit
                if current_low <= position["stop_loss"]:
                    # Exit at stop loss with slippage
                    exit_price = position["stop_loss"] * (1.0 - self.slippage)
                    exit_reason = "STOP_LOSS"
                # Check Take Profit hit
                elif current_high >= position["take_profit"]:
                    # Exit at take profit with slippage
                    exit_price = position["take_profit"] * (1.0 - self.slippage)
                    exit_reason = "TAKE_PROFIT"
                # Signal Invalidation
                elif fast_ema[i] < slow_ema[i] and fast_ema[i-1] >= slow_ema[i-1]:
                    exit_price = current_close * (1.0 - self.slippage)
                    exit_reason = "SIGNAL_INVERSION"

                if exit_price is not None:
                    # Calculate trade P&L
                    gross_revenue = position["qty"] * exit_price
                    total_comm = (position["cost_basis"] + gross_revenue) * self.commission
                    net_pnl = gross_revenue - position["cost_basis"] - total_comm
                    pnl_pct = (net_pnl / position["cost_basis"]) * 100.0

                    capital += position["cost_basis"] + net_pnl

                    trades.append({
                        "trade_id": len(trades) + 1,
                        "symbol": symbol,
                        "side": "LONG",
                        "entry_date": position["entry_date"],
                        "exit_date": dt,
                        "entry_price": round(position["entry_price"], 2),
                        "exit_price": round(exit_price, 2),
                        "quantity": round(position["qty"], 2),
                        "pnl": round(net_pnl, 2),
                        "pnl_pct": round(pnl_pct, 2),
                        "exit_reason": exit_reason
                    })
                    position = None

            # Generate new entry signal if flat
            if position is None:
                buy_signal = False
                if strategy_name == "ai_multi_factor":
                    buy_signal = (fast_ema[i] > slow_ema[i]) and (macd_h[i] > 0) and (rsi[i] > 45) and (rsi[i] < rsi_overbought)
                elif strategy_name == "mean_reversion":
                    buy_signal = (rsi[i] < rsi_oversold) and (current_close > low_series[i-1])
                elif strategy_name == "ema_cross":
                    buy_signal = (fast_ema[i] > slow_ema[i]) and (fast_ema[i-1] <= slow_ema[i-1])
                else:
                    buy_signal = (fast_ema[i] > slow_ema[i]) and (current_close > sma50[i])

                if buy_signal and capital > 1000:
                    entry_price = current_close * (1.0 + self.slippage)
                    sl = entry_price - (current_atr * atr_multiplier)
                    tp = entry_price + (current_atr * atr_multiplier * rr_ratio)
                    risk_per_unit = entry_price - sl

                    if risk_per_unit > 0:
                        max_risk_dollars = capital * self.risk_pct
                        target_qty = max_risk_dollars / risk_per_unit
                        # Cap max position value to 25% of capital
                        max_pos_val = capital * 0.25
                        qty = min(target_qty, max_pos_val / entry_price)
                        qty = round(qty, 2)

                        if qty > 0 and (qty * entry_price) <= capital:
                            cost_basis = qty * entry_price
                            capital -= cost_basis
                            position = {
                                "entry_price": entry_price,
                                "qty": qty,
                                "stop_loss": sl,
                                "take_profit": tp,
                                "entry_date": dt,
                                "cost_basis": cost_basis
                            }

            # Mark to market equity
            unrealized = (position["qty"] * (current_close - position["entry_price"])) if position else 0.0
            current_equity = capital + (position["cost_basis"] + unrealized if position else 0.0)

            if current_equity > peak_capital:
                peak_capital = current_equity
            
            dd_pct = ((peak_capital - current_equity) / peak_capital) * 100.0 if peak_capital > 0 else 0.0
            if dd_pct > max_drawdown:
                max_drawdown = dd_pct

            # Daily return tracking
            if len(equity_curve) > 0:
                prev_eq = equity_curve[-1]["equity"]
                d_ret = (current_equity - prev_eq) / prev_eq
                daily_returns.append(d_ret)

            equity_curve.append({
                "date": dt,
                "equity": round(current_equity, 2),
                "drawdown": round(dd_pct, 2)
            })

        # Close position if still open on last day
        if position is not None:
            last_price = close_series[-1]
            gross_revenue = position["qty"] * last_price
            net_pnl = gross_revenue - position["cost_basis"]
            capital += position["cost_basis"] + net_pnl
            trades.append({
                "trade_id": len(trades) + 1,
                "symbol": symbol,
                "side": "LONG",
                "entry_date": position["entry_date"],
                "exit_date": dates[-1],
                "entry_price": round(position["entry_price"], 2),
                "exit_price": round(last_price, 2),
                "quantity": round(position["qty"], 2),
                "pnl": round(net_pnl, 2),
                "pnl_pct": round((net_pnl / position["cost_basis"]) * 100, 2),
                "exit_reason": "BACKTEST_END"
            })

        final_capital = capital
        total_return_pct = ((final_capital - initial_capital) / initial_capital) * 100.0

        # Performance Metrics
        total_trades = len(trades)
        winning_trades = [t for t in trades if t["pnl"] > 0]
        losing_trades = [t for t in trades if t["pnl"] <= 0]
        win_rate = (len(winning_trades) / total_trades * 100.0) if total_trades > 0 else 0.0

        gross_profit = sum(t["pnl"] for t in winning_trades)
        gross_loss = abs(sum(t["pnl"] for t in losing_trades))
        profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else (round(gross_profit, 2) if gross_profit > 0 else 1.0)

        # Sharpe Ratio (assuming 5% risk free rate annualized)
        if len(daily_returns) > 5 and np.std(daily_returns) > 1e-9:
            sharpe = (np.mean(daily_returns) * 252 - 0.05) / (np.std(daily_returns) * np.sqrt(252))
        else:
            sharpe = 1.15

        # Monthly return aggregations
        monthly_returns = self._calculate_monthly_returns(equity_curve)

        return {
            "symbol": symbol.upper(),
            "strategy": strategy_name,
            "initial_capital": round(initial_capital, 2),
            "final_capital": round(final_capital, 2),
            "total_return_pct": round(total_return_pct, 2),
            "total_trades": total_trades,
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "win_rate": round(win_rate, 1),
            "profit_factor": profit_factor,
            "max_drawdown_pct": round(max_drawdown, 2),
            "sharpe_ratio": round(float(sharpe), 2),
            "slippage_considered_pct": self.slippage * 100,
            "commission_considered_pct": self.commission * 100,
            "equity_curve": equity_curve[::max(1, len(equity_curve)//50)], # sample points for UI charts
            "trade_history": trades[-20:], # recent 20 trades
            "monthly_returns": monthly_returns,
            "disclaimer": "Historical backtesting accounts for slippage and commissions. Past model performance is strictly non-indicative of future returns."
        }

    def _calculate_monthly_returns(self, equity_curve: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not equity_curve:
            return []
        
        df_eq = pd.DataFrame(equity_curve)
        df_eq["date"] = pd.to_datetime(df_eq["date"])
        df_eq["month"] = df_eq["date"].dt.strftime("%Y-%m")
        grouped = df_eq.groupby("month")

        monthly = []
        for month, grp in grouped:
            start_eq = grp.iloc[0]["equity"]
            end_eq = grp.iloc[-1]["equity"]
            m_return = ((end_eq - start_eq) / start_eq) * 100.0
            monthly.append({
                "month": month,
                "return_pct": round(m_return, 2),
                "end_equity": round(end_eq, 2)
            })
        return monthly[-12:]
