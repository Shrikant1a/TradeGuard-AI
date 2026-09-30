from typing import Dict, Any, List

class ExplanationEngine:
    """
    Transparent Explainable AI (XAI) Engine:
    Translates mathematical model features and technical factors into transparent,
    auditable insights with positive drivers, risk hazards, and probabilistic final reasoning.
    Adheres strictly to probabilistic language (no certainty / guaranteed returns).
    """

    @staticmethod
    def generate_explanation(signal_data: Dict[str, Any]) -> Dict[str, Any]:
        metrics = signal_data.get("latest_metrics", {})
        signal_type = signal_data.get("signal_type", "HOLD")
        symbol = signal_data.get("symbol", "ASSET")
        risk_score = signal_data.get("risk_score", "MEDIUM")
        confidence = signal_data.get("confidence", 65.0)

        positive_factors: List[str] = []
        risk_factors: List[str] = []
        factor_weights: List[Dict[str, Any]] = []

        close = metrics.get("close", 0)
        sma50 = metrics.get("sma_50", 0)
        sma200 = metrics.get("sma_200", 0)
        ema20 = metrics.get("ema_20", 0)
        rsi = metrics.get("rsi", 50)
        macd = metrics.get("macd", 0)
        macd_sig = metrics.get("macd_signal", 0)
        atr_pct = metrics.get("atr_pct", 2.0)
        vol_ratio = metrics.get("volume_ratio", 1.0)
        support = metrics.get("support", 0)
        resistance = metrics.get("resistance", 0)

        # 1. Moving Average & Trend Factors
        if close > sma50:
            positive_factors.append(f"Price ({close:.2f}) trades above the 50-day SMA ({sma50:.2f}), confirming macro trend support.")
            factor_weights.append({"factor": "Macro Trend Filter", "weight": +28, "impact": "Positive"})
        else:
            risk_factors.append(f"Price trades below 50-day SMA ({sma50:.2f}), indicating prevailing medium-term overhead pressure.")
            factor_weights.append({"factor": "Macro Trend Filter", "weight": -25, "impact": "Negative"})

        # 2. Momentum & MACD
        if macd > macd_sig:
            positive_factors.append(f"MACD line ({macd:.2f}) is positioned above its signal line ({macd_sig:.2f}), reflecting positive momentum expansion.")
            factor_weights.append({"factor": "MACD Momentum", "weight": +22, "impact": "Positive"})
        else:
            risk_factors.append(f"MACD line ({macd:.2f}) is below signal line ({macd_sig:.2f}), suggesting momentum decay.")
            factor_weights.append({"factor": "MACD Momentum", "weight": -20, "impact": "Negative"})

        # 3. RSI Conditions
        if 45 <= rsi <= 65:
            positive_factors.append(f"RSI at {rsi:.1f} shows stable momentum with significant room before reaching overbought territory.")
            factor_weights.append({"factor": "RSI Relative Strength", "weight": +18, "impact": "Positive"})
        elif rsi > 70:
            risk_factors.append(f"RSI elevated at {rsi:.1f} indicates technical overextension and potential mean-reversion pullbacks.")
            factor_weights.append({"factor": "RSI Overextension", "weight": -22, "impact": "Negative"})
        elif rsi < 30:
            positive_factors.append(f"RSI oversold at {rsi:.1f} provides potential asymmetry for accumulation.")
            factor_weights.append({"factor": "RSI Oversold Level", "weight": +15, "impact": "Positive"})

        # 4. Volume Verification
        if vol_ratio > 1.2:
            positive_factors.append(f"Trading volume is {vol_ratio:.1f}x higher than the 20-day moving average, signaling institutional participation.")
            factor_weights.append({"factor": "Volume Confirmation", "weight": +16, "impact": "Positive"})
        elif vol_ratio < 0.8:
            risk_factors.append(f"Volume is {vol_ratio:.1f}x below average, suggesting diminished market conviction in current moves.")
            factor_weights.append({"factor": "Volume Breadth", "weight": -12, "impact": "Negative"})

        # 5. Volatility & ATR Risk
        if atr_pct > 3.0:
            risk_factors.append(f"Elevated ATR volatility ({atr_pct:.1f}% daily range) widens required stop-loss parameters and increases drawdowns.")
            factor_weights.append({"factor": "ATR Volatility", "weight": -24, "impact": "Negative"})
        else:
            positive_factors.append(f"Normalized ATR volatility ({atr_pct:.1f}%) provides a stable risk/reward execution profile.")
            factor_weights.append({"factor": "ATR Volatility", "weight": +12, "impact": "Positive"})

        # 6. Proximity to Key Support/Resistance
        if resistance > 0 and (resistance - close) / close < 0.02:
            risk_factors.append(f"Price is within 2% of key swing resistance ({resistance:.2f}), presenting immediate barrier for further gains.")
            factor_weights.append({"factor": "Resistance Proximity", "weight": -18, "impact": "Negative"})

        # Final Reasoning Generation
        if signal_type == "BUY":
            final_reasoning = (
                f"Multiple technical indicators and machine learning ensemble features support a probabilistic bullish setup for {symbol}. "
                f"Strongest contributors include moving average alignment and positive MACD histogram divergence. "
                f"However, elevated volatility ({atr_pct:.1f}%) requires strict position sizing and adherence to the suggested stop loss."
            )
        elif signal_type == "SELL":
            final_reasoning = (
                f"Bearish trend distribution and deteriorating momentum indicators dominate the short-to-medium horizon for {symbol}. "
                f"Downtrend continuation probabilities remain elevated. Risk parameters indicate unfavorable reward-to-risk for long exposure."
            )
        else:
            final_reasoning = (
                f"Conflicting directional signals observed for {symbol}: technical momentum is neutralized between support ({support:.2f}) "
                f"and resistance ({resistance:.2f}). Model estimates favor capital preservation in cash until trend clarity emerges."
            )

        return {
            "signal_code": signal_data.get("signal_code"),
            "symbol": symbol,
            "signal_type": signal_type,
            "confidence_score": confidence,
            "risk_score": risk_score,
            "positive_factors": positive_factors,
            "risk_factors": risk_factors,
            "factor_weights": factor_weights,
            "market_regime": metrics.get("market_regime", "Ranging"),
            "final_reasoning": final_reasoning,
            "disclaimer": "Analysis represents statistical model estimation based on historical market regimes. No statement constitutes guaranteed returns or fiduciary advice."
        }
