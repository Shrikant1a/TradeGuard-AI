import asyncio
import datetime
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
from backend.app.config import settings
from backend.app.services.cache_service import cache_service
from backend.app.services.circuit_breaker import market_circuit_breaker
from backend.app.services.symbol_registry import symbol_registry

logger = logging.getLogger("tradeguard.market_data")


class BaseMarketDataProvider(ABC):
    @abstractmethod
    async def get_historical_bars(
        self, symbol: str, timeframe: str = "1d", period: str = "6mo", with_meta: bool = False
    ) -> Any:
        """Return DataFrame (default) or (DataFrame, metadata) if with_meta=True"""
        pass

    @abstractmethod
    async def get_current_quote(self, symbol: str) -> Dict[str, Any]:
        """Return dict with symbol, price, change, change_pct, volume, high, low, provider, is_live, timestamp, is_stale"""
        pass

    @abstractmethod
    async def search_assets(self, query: str) -> List[Dict[str, Any]]:
        """Return list of matching asset symbols and descriptions"""
        pass


class YahooFinanceProvider(BaseMarketDataProvider):
    """
    Legitimate Yahoo Finance provider using yfinance with thread offloading,
    symbol resolution for Indian (NSE/BSE) equities and indices, transparent provider attribution,
    stale-data detection, and error-resilience.
    """

    def _sync_fetch_history(self, symbol: str, timeframe: str, period: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        import yfinance as yf
        resolved = symbol_registry.resolve(symbol)
        provider_sym = resolved["provider_symbol"]

        ticker = yf.Ticker(provider_sym)
        df = ticker.history(period=period, interval=timeframe, timeout=10)
        if df.empty or len(df) < 5:
            raise ValueError(f"Insufficient history data for {symbol} ({provider_sym}) on Yahoo Finance")

        df = df.reset_index()
        col_map = {
            "Date": "timestamp",
            "Datetime": "timestamp",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
        df = df.rename(columns=col_map)
        cleaned = df[["timestamp", "open", "high", "low", "close", "volume"]].dropna()

        # Check staleness of historical data
        now = datetime.datetime.utcnow()
        last_dt = pd.to_datetime(cleaned.iloc[-1]["timestamp"]).to_pydatetime()
        if last_dt.tzinfo is not None:
            last_dt = last_dt.replace(tzinfo=None)
        
        # In daily bars, weekend gap is up to 3-4 days; beyond 4 days consider stale
        age_seconds = (now - last_dt).total_seconds()
        is_stale = age_seconds > (4 * 86400 if "d" in timeframe else 3600)

        meta = {
            "symbol": resolved["symbol"],
            "company_name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
            "exchange": resolved.get("exchange", "NSE"),
            "market": resolved.get("market", "India"),
            "currency": resolved.get("currency", "INR"),
            "currency_symbol": resolved.get("currency_symbol", "₹"),
            "provider": "Yahoo Finance",
            "is_live": True,
            "is_stale": is_stale,
            "timestamp": now.isoformat() + "Z",
            "last_bar_timestamp": last_dt.isoformat() + "Z",
            "status_message": f"Live market data retrieved from {resolved.get('exchange', 'NSE')} (Yahoo Finance)" if not is_stale else f"Market data retrieved from {resolved.get('exchange', 'NSE')} (Market Closed / Delayed)"
        }
        cleaned.attrs["meta"] = meta
        return cleaned, meta

    async def get_historical_bars(
        self, symbol: str, timeframe: str = "1d", period: str = "6mo", with_meta: bool = False
    ) -> Any:
        try:
            df, meta = await asyncio.to_thread(self._sync_fetch_history, symbol, timeframe, period)
            return (df, meta) if with_meta else df
        except Exception as e:
            logger.warning(f"Yahoo Finance fetch failed for {symbol}: {e}. Falling back to synthetic series.")
            fb_df = self._generate_realistic_series(symbol, days=180)
            resolved = symbol_registry.resolve(symbol)
            now = datetime.datetime.utcnow().isoformat() + "Z"
            meta = {
                "symbol": resolved["symbol"],
                "company_name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
                "exchange": resolved.get("exchange", "NSE"),
                "market": resolved.get("market", "India"),
                "currency": resolved.get("currency", "INR"),
                "currency_symbol": resolved.get("currency_symbol", "₹"),
                "provider": "Synthetic Fallback",
                "is_live": False,
                "is_stale": True,
                "timestamp": now,
                "status_message": f"Live provider unavailable ({str(e)}). Resilient synthetic simulation data displayed.",
            }
            fb_df.attrs["meta"] = meta
            return (fb_df, meta) if with_meta else fb_df

    def _sync_fetch_quote(self, symbol: str) -> Dict[str, Any]:
        import yfinance as yf
        resolved = symbol_registry.resolve(symbol)
        provider_sym = resolved["provider_symbol"]

        ticker = yf.Ticker(provider_sym)
        fast_info = ticker.fast_info
        price = float(fast_info.last_price)
        prev_close = float(fast_info.previous_close or price)
        change = price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0

        now = datetime.datetime.utcnow()
        now_iso = now.isoformat() + "Z"

        currency = getattr(fast_info, "currency", None) or resolved.get("currency", "INR")
        curr_sym = "₹" if currency == "INR" else "$"

        return {
            "symbol": resolved["symbol"],
            "company_name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
            "exchange": resolved.get("exchange", "NSE"),
            "market": resolved.get("market", "India"),
            "currency": currency,
            "currency_symbol": curr_sym,
            "price": round(price, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "volume": int(getattr(fast_info, "last_volume", 0) or 2500000),
            "day_high": round(float(getattr(fast_info, "day_high", price * 1.01)), 2),
            "day_low": round(float(getattr(fast_info, "day_low", price * 0.99)), 2),
            "provider": "Yahoo Finance",
            "is_live": True,
            "is_stale": False,
            "timestamp": now_iso,
            "status_message": f"Live quote from {resolved.get('exchange', 'NSE')} (Yahoo Finance)",
        }

    async def get_current_quote(self, symbol: str) -> Dict[str, Any]:
        try:
            return await asyncio.to_thread(self._sync_fetch_quote, symbol)
        except Exception as e:
            logger.warning(f"Yahoo Finance quote failed for {symbol}: {e}. Falling back to synthetic quote.")
            return self._generate_fallback_quote(symbol, reason=str(e))

    async def search_assets(self, query: str) -> List[Dict[str, Any]]:
        return symbol_registry.search(query)

    def _generate_realistic_series(self, symbol: str, days: int = 180) -> pd.DataFrame:
        """Deterministic Geometric Brownian Motion based on symbol hash for fallback resilience"""
        resolved = symbol_registry.resolve(symbol)
        seed = abs(hash(symbol)) % (2**31)
        np.random.seed(seed)

        base_prices = {
            "AAPL": 224.0,
            "NVDA": 128.0,
            "MSFT": 448.0,
            "TSLA": 254.0,
            "GOOGL": 182.0,
            "AMZN": 186.0,
            "BTC-USD": 94150.0,
            "ETH-USD": 2680.0,
            "RELIANCE": 1190.50,
            "RELIANCE.NS": 1190.50,
            "TCS": 2110.00,
            "TCS.NS": 2110.00,
            "INFY": 1025.00,
            "INFY.NS": 1025.00,
            "HDFCBANK": 710.45,
            "HDFCBANK.NS": 710.45,
            "ICICIBANK": 1331.00,
            "ICICIBANK.NS": 1331.00,
            "SBIN": 958.00,
            "SBIN.NS": 958.00,
            "BHARTIARTL": 1680.00,
            "ITC": 478.00,
            "LT": 3650.00,
            "KOTAKBANK": 1780.00,
            "MARUTI": 12450.00,
            "TATAMOTORS": 930.00,
            "NIFTY 50": 25320.00,
            "^NSEI": 25320.00,
            "SENSEX": 82850.00,
            "^BSESN": 82850.00,
            "NIFTY BANK": 52400.00,
            "^NSEBANK": 52400.00,
            "NIFTY IT": 41200.00,
            "^CNXIT": 41200.00,
        }
        current = base_prices.get(symbol.upper(), resolved.get("base_price", 1500.0 if resolved.get("currency") == "INR" else 150.0))

        dates = pd.date_range(end=datetime.datetime.utcnow(), periods=days, freq="D")
        daily_vol = 0.018
        drift = 0.0004

        returns = np.random.normal(drift, daily_vol, days)
        price_path = current * np.cumprod(1 + returns)
        scaling = current / price_path[-1]
        price_path = price_path * scaling

        records = []
        for i, dt in enumerate(dates):
            close = float(price_path[i])
            daily_range = close * np.random.uniform(0.008, 0.025)
            open_p = close + np.random.uniform(-daily_range * 0.4, daily_range * 0.4)
            high_p = max(open_p, close) + np.random.uniform(0, daily_range * 0.5)
            low_p = min(open_p, close) - np.random.uniform(0, daily_range * 0.5)
            volume = float(np.random.lognormal(15.5 if resolved.get("currency") == "INR" else 16.5, 0.5))

            records.append({
                "timestamp": dt,
                "open": round(open_p, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "close": round(close, 2),
                "volume": int(volume),
            })

        return pd.DataFrame(records)

    def _generate_fallback_quote(self, symbol: str, reason: str = "") -> Dict[str, Any]:
        resolved = symbol_registry.resolve(symbol)
        df = self._generate_realistic_series(symbol, days=5)
        last_row = df.iloc[-1]
        prev_row = df.iloc[-2]
        change = last_row["close"] - prev_row["close"]
        change_pct = (change / prev_row["close"]) * 100

        now = datetime.datetime.utcnow().isoformat() + "Z"

        return {
            "symbol": resolved["symbol"],
            "company_name": resolved.get("company_name", f"{resolved['symbol']} Asset"),
            "exchange": resolved.get("exchange", "NSE"),
            "market": resolved.get("market", "India"),
            "currency": resolved.get("currency", "INR"),
            "currency_symbol": resolved.get("currency_symbol", "₹"),
            "price": round(float(last_row["close"]), 2),
            "change": round(float(change), 2),
            "change_pct": round(float(change_pct), 2),
            "volume": int(last_row["volume"]),
            "day_high": round(float(last_row["high"]), 2),
            "day_low": round(float(last_row["low"]), 2),
            "provider": "Synthetic Fallback",
            "is_live": False,
            "is_stale": True,
            "timestamp": now,
            "status_message": f"Synthetic simulation fallback active ({reason or 'Live provider unavailable'}).",
        }


class MarketDataProvider:
    """Singleton Factory provider routing to chosen provider with multi-tier cache and circuit breaker"""

    _instance = None

    def __init__(self, provider_type: str = "yahoo"):
        self.provider: BaseMarketDataProvider = YahooFinanceProvider()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def get_historical_bars(
        self, symbol: str, timeframe: str = "1d", period: str = "6mo", with_meta: bool = False
    ) -> Any:
        sym = symbol.upper().strip()
        cache_key = f"market:bars:{sym}:{timeframe}:{period}"
        cached = await cache_service.get_json(cache_key)
        if cached and "bars" in cached and "meta" in cached:
            try:
                df = pd.DataFrame(cached["bars"])
                if not df.empty and "timestamp" in df.columns:
                    df["timestamp"] = pd.to_datetime(df["timestamp"])
                    meta = cached["meta"]
                    df.attrs["meta"] = meta
                    return (df, meta) if with_meta else df
            except Exception:
                pass

        async def fetch_bars():
            return await self.provider.get_historical_bars(sym, timeframe, period, with_meta=True)

        def fallback_bars():
            fb_df = self.provider._generate_realistic_series(sym, days=180)
            meta = {
                "provider": "Synthetic Fallback",
                "is_live": False,
                "is_stale": True,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "status_message": "Circuit breaker fallback: synthetic data active.",
            }
            fb_df.attrs["meta"] = meta
            return fb_df, meta

        result = await market_circuit_breaker.call(fetch_bars, fallback=fallback_bars)
        if isinstance(result, tuple):
            df, meta = result
        else:
            df, meta = result, {
                "provider": "Yahoo Finance",
                "is_live": True,
                "is_stale": False,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            }

        if isinstance(df, pd.DataFrame):
            df.attrs["meta"] = meta

        # Cache records for 300 seconds (5 mins)
        if isinstance(df, pd.DataFrame) and not df.empty:
            records = df.copy()
            if "timestamp" in records.columns:
                records["timestamp"] = records["timestamp"].astype(str)
            cache_payload = {
                "bars": records.to_dict(orient="records"),
                "meta": meta,
            }
            await cache_service.set_json(cache_key, cache_payload, ttl=300)

        return (df, meta) if with_meta else df

    async def get_current_quote(self, symbol: str) -> Dict[str, Any]:
        sym = symbol.upper().strip()
        cache_key = f"market:quote:{sym}"
        cached = await cache_service.get_json(cache_key)
        if cached:
            return cached

        async def fetch_quote():
            return await self.provider.get_current_quote(sym)

        def fallback_quote():
            return self.provider._generate_fallback_quote(sym, reason="Circuit breaker fallback")

        quote = await market_circuit_breaker.call(fetch_quote, fallback=fallback_quote)
        if quote:
            await cache_service.set_json(cache_key, quote, ttl=30)
        return quote

    async def search_assets(self, query: str) -> List[Dict[str, Any]]:
        q = (query or "").upper().strip()
        cache_key = f"market:search:{q}"
        cached = await cache_service.get_json(cache_key)
        if cached:
            return cached
        results = await self.provider.search_assets(query)
        await cache_service.set_json(cache_key, results, ttl=3600)
        return results
