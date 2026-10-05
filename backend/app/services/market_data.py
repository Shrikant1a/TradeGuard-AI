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
    transparent provider attribution, stale-data detection, and error-resilience.
    """

    def _sync_fetch_history(self, symbol: str, timeframe: str, period: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=timeframe, timeout=10)
        if df.empty or len(df) < 5:
            raise ValueError(f"Insufficient history data for {symbol} on Yahoo Finance")

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
            "provider": "Yahoo Finance",
            "is_live": True,
            "is_stale": is_stale,
            "timestamp": now.isoformat() + "Z",
            "last_bar_timestamp": last_dt.isoformat() + "Z",
            "status_message": "Live market data successfully retrieved from Yahoo Finance" if not is_stale else "Market data retrieved from Yahoo Finance (Market Closed / Delayed)"
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
            now = datetime.datetime.utcnow().isoformat() + "Z"
            meta = {
                "provider": "Synthetic Fallback",
                "is_live": False,
                "is_stale": True,
                "timestamp": now,
                "status_message": f"Live Yahoo Finance feed unavailable ({str(e)}). Resilient synthetic simulation data displayed.",
            }
            fb_df.attrs["meta"] = meta
            return (fb_df, meta) if with_meta else fb_df

    def _sync_fetch_quote(self, symbol: str) -> Dict[str, Any]:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        fast_info = ticker.fast_info
        price = float(fast_info.last_price)
        prev_close = float(fast_info.previous_close or price)
        change = price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0

        now = datetime.datetime.utcnow()
        now_iso = now.isoformat() + "Z"

        return {
            "symbol": symbol.upper(),
            "price": round(price, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "volume": int(getattr(fast_info, "last_volume", 0) or 15000000),
            "day_high": round(float(getattr(fast_info, "day_high", price * 1.01)), 2),
            "day_low": round(float(getattr(fast_info, "day_low", price * 0.99)), 2),
            "currency": getattr(fast_info, "currency", "USD"),
            "provider": "Yahoo Finance",
            "is_live": True,
            "is_stale": False,
            "timestamp": now_iso,
            "status_message": "Live quote from Yahoo Finance",
        }

    async def get_current_quote(self, symbol: str) -> Dict[str, Any]:
        try:
            return await asyncio.to_thread(self._sync_fetch_quote, symbol)
        except Exception as e:
            logger.warning(f"Yahoo Finance quote failed for {symbol}: {e}. Falling back to synthetic quote.")
            return self._generate_fallback_quote(symbol, reason=str(e))

    async def search_assets(self, query: str) -> List[Dict[str, Any]]:
        from backend.app.services.indian_market_data import INDIAN_STOCKS_CATALOG

        global_assets = [
            {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "sector": "Technology", "price": 224.23},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "sector": "Semiconductors", "price": 128.50},
            {"symbol": "MSFT", "name": "Microsoft Corp.", "exchange": "NASDAQ", "sector": "Technology", "price": 448.90},
            {"symbol": "TSLA", "name": "Tesla, Inc.", "exchange": "NASDAQ", "sector": "Automotive", "price": 254.10},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "sector": "Communication", "price": 182.15},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "sector": "Consumer Cyclical", "price": 186.40},
            {"symbol": "BTC-USD", "name": "Bitcoin USD", "exchange": "Crypto", "sector": "Cryptocurrency", "price": 63450.00},
            {"symbol": "ETH-USD", "name": "Ethereum USD", "exchange": "Crypto", "sector": "Cryptocurrency", "price": 2650.00},
        ]

        indian_assets = [
            {
                "symbol": s["symbol"],
                "name": s["name"],
                "exchange": s["exchange"],
                "sector": s["sector"],
                "price": 1500.00,
            }
            for s in INDIAN_STOCKS_CATALOG
        ]
        all_assets = global_assets + indian_assets

        q = query.upper().strip()
        if not q:
            return all_assets[:15]

        matches = [a for a in all_assets if q in a["symbol"] or q in a["name"].upper() or q == a["exchange"].upper()]
        if not matches:
            matches.append({
                "symbol": q,
                "name": f"{q} Global Asset",
                "exchange": "BSE" if q.endswith(".BO") else ("NSE" if q.endswith(".NS") else "GLOBAL"),
                "sector": "Market Equities",
                "price": 150.00,
            })
        return matches[:25]

    def _generate_realistic_series(self, symbol: str, days: int = 180) -> pd.DataFrame:
        """Deterministic Geometric Brownian Motion based on symbol hash for fallback resilience"""
        seed = abs(hash(symbol)) % (2**31)
        np.random.seed(seed)

        base_prices = {
            "AAPL": 220.0,
            "NVDA": 125.0,
            "MSFT": 440.0,
            "TSLA": 240.0,
            "GOOGL": 180.0,
            "AMZN": 185.0,
            "BTC-USD": 63000.0,
            "ETH-USD": 2600.0,
            "RELIANCE.NS": 2950.0,
            "TCS.NS": 4200.0,
        }
        current = base_prices.get(symbol.upper(), 150.0)

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
            volume = float(np.random.lognormal(16.5, 0.5))

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
        df = self._generate_realistic_series(symbol, days=5)
        last_row = df.iloc[-1]
        prev_row = df.iloc[-2]
        change = last_row["close"] - prev_row["close"]
        change_pct = (change / prev_row["close"]) * 100

        now = datetime.datetime.utcnow().isoformat() + "Z"

        return {
            "symbol": symbol.upper(),
            "price": round(float(last_row["close"]), 2),
            "change": round(float(change), 2),
            "change_pct": round(float(change_pct), 2),
            "volume": int(last_row["volume"]),
            "day_high": round(float(last_row["high"]), 2),
            "day_low": round(float(last_row["low"]), 2),
            "currency": "INR" if ".NS" in symbol.upper() else "USD",
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
