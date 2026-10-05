from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

class TechnicalAnalysisService:
    @staticmethod
    def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates all core technical indicators on OHLCV DataFrame:
        - SMA 20, 50, 200
        - EMA 20, 50
        - RSI (14)
        - MACD (12, 26, 9)
        - Bollinger Bands (20, 2)
        - ATR (14)
        - Volume SMA (20), Volume Ratio, OBV
        - Momentum (ROC 10, ROC 20)
        - Volatility (Annualized rolling 20-day stdev)
        - Support / Resistance levels
        - Market Regime
        """
        data = df.copy()
        close = data["close"]
        high = data["high"]
        low = data["low"]
        vol = data["volume"]

        # 1. Moving Averages
        data["sma_20"] = close.rolling(window=20, min_periods=1).mean()
        data["sma_50"] = close.rolling(window=50, min_periods=1).mean()
        data["sma_200"] = close.rolling(window=200, min_periods=1).mean()
        data["ema_20"] = close.ewm(span=20, adjust=False).mean()
        data["ema_50"] = close.ewm(span=50, adjust=False).mean()

        # 2. RSI (14)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14, min_periods=1).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
        rs = gain / (loss.replace(0, 1e-9))
        data["rsi"] = 100 - (100 / (1 + rs))

        # 3. MACD (12, 26, 9)
        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()
        data["macd"] = ema_12 - ema_26
        data["macd_signal"] = data["macd"].ewm(span=9, adjust=False).mean()
        data["macd_hist"] = data["macd"] - data["macd_signal"]

        # 4. Bollinger Bands (20, 2)
        bb_std = close.rolling(window=20, min_periods=1).std()
        data["bollinger_middle"] = data["sma_20"]
        data["bollinger_upper"] = data["bollinger_middle"] + (2.0 * bb_std)
        data["bollinger_lower"] = data["bollinger_middle"] - (2.0 * bb_std)
        data["bb_pct"] = (close - data["bollinger_lower"]) / (
            (data["bollinger_upper"] - data["bollinger_lower"]).replace(0, 1e-9)
        )

        # 5. Average True Range (ATR 14)
        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        data["atr"] = tr.rolling(window=14, min_periods=1).mean()
        data["atr_pct"] = (data["atr"] / close) * 100

        # 6. Volume Analysis
        data["vol_sma_20"] = vol.rolling(window=20, min_periods=1).mean()
        data["vol_ratio"] = vol / data["vol_sma_20"].replace(0, 1)
        
        # On-Balance Volume (OBV)
        obv_direction = np.where(close > close.shift(1), 1, np.where(close < close.shift(1), -1, 0))
        data["obv"] = (obv_direction * vol).cumsum()

        # 7. Momentum & Volatility
        data["roc_10"] = close.pct_change(periods=10) * 100
        data["roc_20"] = close.pct_change(periods=20) * 100
        data["hist_volatility"] = close.pct_change().rolling(window=20, min_periods=1).std() * np.sqrt(252) * 100

        # 8. Support and Resistance (Rolling 20-day swing low/high)
        data["support"] = low.rolling(window=20, min_periods=1).min()
        data["resistance"] = high.rolling(window=20, min_periods=1).max()

        # 9. Trend & Market Regime
        regimes = []
        for i in range(len(data)):
            c = close.iloc[i]
            s50 = data["sma_50"].iloc[i]
            s200 = data["sma_200"].iloc[i]
            e20 = data["ema_20"].iloc[i]
            atr_val = data["atr_pct"].iloc[i]
            
            if atr_val > 3.5:
                regimes.append("High Volatility Breakout")
            elif c > s50 and e20 > s50:
                regimes.append("Bullish Trend")
            elif c < s50 and e20 < s50:
                regimes.append("Bearish Trend")
            else:
                regimes.append("Ranging / Consolidation")
        data["market_regime"] = regimes

        return data

    @staticmethod
    def get_latest_metrics(data_with_indicators: pd.DataFrame) -> Dict[str, Any]:
        """Extracts latest snapshot of technical health for UI and ML inference"""
        latest = data_with_indicators.iloc[-1]
        prev = data_with_indicators.iloc[-2] if len(data_with_indicators) > 1 else latest

        c = float(latest["close"])
        ema20 = float(latest["ema_20"])
        sma50 = float(latest["sma_50"])
        sma200 = float(latest["sma_200"])
        rsi = float(latest["rsi"])
        macd = float(latest["macd"])
        macd_sig = float(latest["macd_signal"])
        atr = float(latest["atr"])
        support = float(latest["support"])
        resistance = float(latest["resistance"])

        # Determine trend direction
        trend = "NEUTRAL"
        if c > sma50 and ema20 > sma50:
            trend = "BULLISH"
        elif c < sma50 and ema20 < sma50:
            trend = "BEARISH"

        # Determine momentum
        momentum = "MODERATE"
        if rsi > 55 and macd > macd_sig:
            momentum = "STRONG POSITIVE"
        elif rsi < 45 and macd < macd_sig:
            momentum = "STRONG NEGATIVE"

        # Volatility level
        atr_pct = float(latest["atr_pct"])
        volatility = "LOW"
        if atr_pct > 3.0:
            volatility = "HIGH"
        elif atr_pct > 1.8:
            volatility = "MODERATE"

        return {
            "close": round(c, 2),
            "current_price": round(c, 2),
            "price": round(c, 2),
            "sma_20": round(float(latest["sma_20"]), 2),
            "sma_50": round(sma50, 2),
            "sma_200": round(sma200, 2),
            "ema_20": round(ema20, 2),
            "ema_50": round(float(latest["ema_50"]), 2),
            "rsi": round(rsi, 1),
            "macd": round(macd, 2),
            "macd_signal": round(macd_sig, 2),
            "macd_hist": round(float(latest["macd_hist"]), 2),
            "bollinger_upper": round(float(latest["bollinger_upper"]), 2),
            "bollinger_middle": round(float(latest["bollinger_middle"]), 2),
            "bollinger_lower": round(float(latest["bollinger_lower"]), 2),
            "atr": round(atr, 2),
            "atr_pct": round(atr_pct, 2),
            "support": round(support, 2),
            "resistance": round(resistance, 2),
            "trend": trend,
            "momentum": momentum,
            "volatility": volatility,
            "market_regime": latest["market_regime"],
            "volume_ratio": round(float(latest["vol_ratio"]), 2),
            "timestamp": str(latest["timestamp"])
        }
