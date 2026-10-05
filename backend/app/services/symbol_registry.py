"""
TradeGuard AI - Centralized Symbol & Market Registry
Provides normalized symbol mappings across NSE, BSE, and Global markets.
Maps user-facing tickers (e.g. RELIANCE, TCS, NIFTY 50) to provider-specific
identifiers (RELIANCE.NS, TCS.NS, ^NSEI) and exchange metadata.
"""

from typing import Dict, Any, List, Optional
import re

# Centralized Indian Equities Registry (Primary: NSE, Companion: BSE)
INDIAN_EQUITIES_REGISTRY: Dict[str, Dict[str, Any]] = {
    "RELIANCE": {
        "symbol": "RELIANCE",
        "company_name": "Reliance Industries Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "RELIANCE.NS",
        "bse_provider_symbol": "RELIANCE.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Energy & Petrochemicals",
        "tradingview_symbol": "NSE:RELIANCE",
        "bse_tradingview_symbol": "BSE:500325",
        "base_price": 2850.50
    },
    "TCS": {
        "symbol": "TCS",
        "company_name": "Tata Consultancy Services Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "TCS.NS",
        "bse_provider_symbol": "TCS.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Information Technology",
        "tradingview_symbol": "NSE:TCS",
        "bse_tradingview_symbol": "BSE:532540",
        "base_price": 4210.00
    },
    "INFY": {
        "symbol": "INFY",
        "company_name": "Infosys Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "INFY.NS",
        "bse_provider_symbol": "INFY.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Information Technology",
        "tradingview_symbol": "NSE:INFY",
        "bse_tradingview_symbol": "BSE:500209",
        "base_price": 1895.00
    },
    "HDFCBANK": {
        "symbol": "HDFCBANK",
        "company_name": "HDFC Bank Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "HDFCBANK.NS",
        "bse_provider_symbol": "HDFCBANK.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Banking & Financial Services",
        "tradingview_symbol": "NSE:HDFCBANK",
        "bse_tradingview_symbol": "BSE:500180",
        "base_price": 1680.00
    },
    "ICICIBANK": {
        "symbol": "ICICIBANK",
        "company_name": "ICICI Bank Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "ICICIBANK.NS",
        "bse_provider_symbol": "ICICIBANK.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Banking & Financial Services",
        "tradingview_symbol": "NSE:ICICIBANK",
        "bse_tradingview_symbol": "BSE:532174",
        "base_price": 1245.00
    },
    "SBIN": {
        "symbol": "SBIN",
        "company_name": "State Bank of India",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "SBIN.NS",
        "bse_provider_symbol": "SBIN.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Banking (Public Sector)",
        "tradingview_symbol": "NSE:SBIN",
        "bse_tradingview_symbol": "BSE:500112",
        "base_price": 795.00
    },
    "BHARTIARTL": {
        "symbol": "BHARTIARTL",
        "company_name": "Bharti Airtel Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "BHARTIARTL.NS",
        "bse_provider_symbol": "BHARTIARTL.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Telecommunications",
        "tradingview_symbol": "NSE:BHARTIARTL",
        "bse_tradingview_symbol": "BSE:532454",
        "base_price": 1685.00
    },
    "ITC": {
        "symbol": "ITC",
        "company_name": "ITC Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "ITC.NS",
        "bse_provider_symbol": "ITC.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Consumer Goods (FMCG)",
        "tradingview_symbol": "NSE:ITC",
        "bse_tradingview_symbol": "BSE:500875",
        "base_price": 482.00
    },
    "LT": {
        "symbol": "LT",
        "company_name": "Larsen & Toubro Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "LT.NS",
        "bse_provider_symbol": "LT.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Engineering & Construction",
        "tradingview_symbol": "NSE:LT",
        "bse_tradingview_symbol": "BSE:500510",
        "base_price": 3620.00
    },
    "KOTAKBANK": {
        "symbol": "KOTAKBANK",
        "company_name": "Kotak Mahindra Bank Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "KOTAKBANK.NS",
        "bse_provider_symbol": "KOTAKBANK.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Banking & Financial Services",
        "tradingview_symbol": "NSE:KOTAKBANK",
        "bse_tradingview_symbol": "BSE:500247",
        "base_price": 1780.00
    },
    "AXISBANK": {
        "symbol": "AXISBANK",
        "company_name": "Axis Bank Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "AXISBANK.NS",
        "bse_provider_symbol": "AXISBANK.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Banking & Financial Services",
        "tradingview_symbol": "NSE:AXISBANK",
        "bse_tradingview_symbol": "BSE:532215",
        "base_price": 1190.00
    },
    "MARUTI": {
        "symbol": "MARUTI",
        "company_name": "Maruti Suzuki India Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "MARUTI.NS",
        "bse_provider_symbol": "MARUTI.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Automobile",
        "tradingview_symbol": "NSE:MARUTI",
        "bse_tradingview_symbol": "BSE:532500",
        "base_price": 12850.00
    },
    "HINDUNILVR": {
        "symbol": "HINDUNILVR",
        "company_name": "Hindustan Unilever Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "HINDUNILVR.NS",
        "bse_provider_symbol": "HINDUNILVR.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Consumer Goods (FMCG)",
        "tradingview_symbol": "NSE:HINDUNILVR",
        "bse_tradingview_symbol": "BSE:500696",
        "base_price": 2720.00
    },
    "SUNPHARMA": {
        "symbol": "SUNPHARMA",
        "company_name": "Sun Pharmaceutical Industries Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "SUNPHARMA.NS",
        "bse_provider_symbol": "SUNPHARMA.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Pharmaceuticals & Healthcare",
        "tradingview_symbol": "NSE:SUNPHARMA",
        "bse_tradingview_symbol": "BSE:524715",
        "base_price": 1890.00
    },
    "TATAMOTORS": {
        "symbol": "TATAMOTORS",
        "company_name": "Tata Motors Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "TATAMOTORS.NS",
        "bse_provider_symbol": "TATAMOTORS.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Automobile",
        "tradingview_symbol": "NSE:TATAMOTORS",
        "bse_tradingview_symbol": "BSE:500570",
        "base_price": 930.00
    },
    "TATASTEEL": {
        "symbol": "TATASTEEL",
        "company_name": "Tata Steel Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "TATASTEEL.NS",
        "bse_provider_symbol": "TATASTEEL.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Metals & Mining",
        "tradingview_symbol": "NSE:TATASTEEL",
        "bse_tradingview_symbol": "BSE:500470",
        "base_price": 155.00
    },
    "WIPRO": {
        "symbol": "WIPRO",
        "company_name": "Wipro Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "WIPRO.NS",
        "bse_provider_symbol": "WIPRO.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Information Technology",
        "tradingview_symbol": "NSE:WIPRO",
        "bse_tradingview_symbol": "BSE:507685",
        "base_price": 540.00
    },
    "ADANIENT": {
        "symbol": "ADANIENT",
        "company_name": "Adani Enterprises Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "ADANIENT.NS",
        "bse_provider_symbol": "ADANIENT.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Diversified Conglomerate",
        "tradingview_symbol": "NSE:ADANIENT",
        "bse_tradingview_symbol": "BSE:512599",
        "base_price": 3120.00
    },
    "BAJFINANCE": {
        "symbol": "BAJFINANCE",
        "company_name": "Bajaj Finance Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "BAJFINANCE.NS",
        "bse_provider_symbol": "BAJFINANCE.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Financial Services (NBFC)",
        "tradingview_symbol": "NSE:BAJFINANCE",
        "bse_tradingview_symbol": "BSE:500034",
        "base_price": 7180.00
    },
    "TITAN": {
        "symbol": "TITAN",
        "company_name": "Titan Company Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "TITAN.NS",
        "bse_provider_symbol": "TITAN.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Consumer Discretionary",
        "tradingview_symbol": "NSE:TITAN",
        "bse_tradingview_symbol": "BSE:500114",
        "base_price": 3480.00
    },
    "ASIANPAINT": {
        "symbol": "ASIANPAINT",
        "company_name": "Asian Paints Ltd.",
        "exchange": "NSE",
        "companion_exchange": "BSE",
        "provider_symbol": "ASIANPAINT.NS",
        "bse_provider_symbol": "ASIANPAINT.BO",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "sector": "Paints & Consumer Goods",
        "tradingview_symbol": "NSE:ASIANPAINT",
        "bse_tradingview_symbol": "BSE:500820",
        "base_price": 2860.00
    },
}

# Major Indian Market Indices
INDIAN_INDICES_REGISTRY: Dict[str, Dict[str, Any]] = {
    "NIFTY 50": {
        "symbol": "NIFTY 50",
        "display_name": "NIFTY 50",
        "company_name": "NIFTY 50 Benchmark Index",
        "exchange": "NSE",
        "provider_symbol": "^NSEI",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "tradingview_symbol": "NSE:NIFTY50",
        "base_price": 25150.00
    },
    "SENSEX": {
        "symbol": "SENSEX",
        "display_name": "BSE SENSEX",
        "company_name": "S&P BSE SENSEX 30 Index",
        "exchange": "BSE",
        "provider_symbol": "^BSESN",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "tradingview_symbol": "BSE:SENSEX",
        "base_price": 81980.00
    },
    "NIFTY BANK": {
        "symbol": "NIFTY BANK",
        "display_name": "BANK NIFTY",
        "company_name": "NIFTY Bank Sector Index",
        "exchange": "NSE",
        "provider_symbol": "^NSEBANK",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "tradingview_symbol": "NSE:BANKNIFTY",
        "base_price": 52400.00
    },
    "NIFTY IT": {
        "symbol": "NIFTY IT",
        "display_name": "NIFTY IT",
        "company_name": "NIFTY Information Technology Index",
        "exchange": "NSE",
        "provider_symbol": "^CNXIT",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "tradingview_symbol": "NSE:CNXIT",
        "base_price": 42100.00
    },
    "NIFTY MIDCAP 100": {
        "symbol": "NIFTY MIDCAP 100",
        "display_name": "NIFTY MIDCAP 100",
        "company_name": "NIFTY Midcap 100 Index",
        "exchange": "NSE",
        "provider_symbol": "NIFTY_MIDCAP_100.NS",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "tradingview_symbol": "NSE:NIFTYMIDCAP100",
        "base_price": 58900.00
    },
    "NIFTY NEXT 50": {
        "symbol": "NIFTY NEXT 50",
        "display_name": "NIFTY NEXT 50",
        "company_name": "NIFTY Next 50 Index",
        "exchange": "NSE",
        "provider_symbol": "NIFTYNEXT50.NS",
        "market": "India",
        "currency": "INR",
        "currency_symbol": "₹",
        "tradingview_symbol": "NSE:NIFTYNEXT50",
        "base_price": 72400.00
    },
}

# Optional Global Markets (Accessible under Global Markets filter)
GLOBAL_ASSETS_REGISTRY: Dict[str, Dict[str, Any]] = {
    "AAPL": {
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "exchange": "NASDAQ",
        "provider_symbol": "AAPL",
        "market": "United States",
        "currency": "USD",
        "currency_symbol": "$",
        "sector": "Technology",
        "tradingview_symbol": "NASDAQ:AAPL",
        "base_price": 224.23
    },
    "NVDA": {
        "symbol": "NVDA",
        "company_name": "NVIDIA Corporation",
        "exchange": "NASDAQ",
        "provider_symbol": "NVDA",
        "market": "United States",
        "currency": "USD",
        "currency_symbol": "$",
        "sector": "Semiconductors",
        "tradingview_symbol": "NASDAQ:NVDA",
        "base_price": 128.50
    },
    "MSFT": {
        "symbol": "MSFT",
        "company_name": "Microsoft Corporation",
        "exchange": "NASDAQ",
        "provider_symbol": "MSFT",
        "market": "United States",
        "currency": "USD",
        "currency_symbol": "$",
        "sector": "Technology",
        "tradingview_symbol": "NASDAQ:MSFT",
        "base_price": 448.90
    },
    "TSLA": {
        "symbol": "TSLA",
        "company_name": "Tesla, Inc.",
        "exchange": "NASDAQ",
        "provider_symbol": "TSLA",
        "market": "United States",
        "currency": "USD",
        "currency_symbol": "$",
        "sector": "Automotive",
        "tradingview_symbol": "NASDAQ:TSLA",
        "base_price": 254.10
    },
    "BTC-USD": {
        "symbol": "BTC-USD",
        "company_name": "Bitcoin USD",
        "exchange": "Crypto",
        "provider_symbol": "BTC-USD",
        "market": "Global",
        "currency": "USD",
        "currency_symbol": "$",
        "sector": "Cryptocurrency",
        "tradingview_symbol": "BINANCE:BTCUSDT",
        "base_price": 63450.00
    },
    "ETH-USD": {
        "symbol": "ETH-USD",
        "company_name": "Ethereum USD",
        "exchange": "Crypto",
        "provider_symbol": "ETH-USD",
        "market": "Global",
        "currency": "USD",
        "currency_symbol": "$",
        "sector": "Cryptocurrency",
        "tradingview_symbol": "BINANCE:ETHUSDT",
        "base_price": 2650.00
    }
}


class SymbolRegistry:
    """Central mapping engine resolving user-input tickers to normalized assets."""

    @classmethod
    def resolve(cls, raw_symbol: str, exchange: Optional[str] = None) -> Dict[str, Any]:
        """
        Resolves any input (e.g. 'reliance', 'RELIANCE.NS', 'TCS', 'INFY', 'NSE:RELIANCE', '^NSEI')
        into a canonical normalized asset description.
        Defaults to NSE Indian Equities.
        """
        raw = raw_symbol.upper().strip()

        # Handle prefix / suffix cleaning
        clean = raw
        if clean.startswith("NSE:"):
            clean = clean.replace("NSE:", "")
            exchange = "NSE"
        elif clean.startswith("BSE:"):
            clean = clean.replace("BSE:", "")
            exchange = "BSE"
        elif clean.startswith("NASDAQ:") or clean.startswith("NYSE:"):
            clean = clean.split(":")[-1]
            exchange = "NASDAQ"

        is_bse = clean.endswith(".BO") or (exchange and exchange.upper() == "BSE")
        is_nse = clean.endswith(".NS") or (exchange and exchange.upper() == "NSE")

        bare = clean.replace(".NS", "").replace(".BO", "").strip()

        # 1. Match Indian Indices
        for idx_key, idx_info in INDIAN_INDICES_REGISTRY.items():
            if (
                bare == idx_key
                or bare == idx_info["provider_symbol"].upper()
                or bare == idx_key.replace(" ", "")
                or (bare == "NIFTY" and idx_key == "NIFTY 50")
                or (bare == "BANKNIFTY" and idx_key == "NIFTY BANK")
            ):
                return dict(idx_info)

        # 2. Match Indian Equities
        if bare in INDIAN_EQUITIES_REGISTRY:
            eq = dict(INDIAN_EQUITIES_REGISTRY[bare])
            if is_bse:
                eq["exchange"] = "BSE"
                eq["provider_symbol"] = eq.get("bse_provider_symbol", f"{bare}.BO")
                eq["tradingview_symbol"] = eq.get("bse_tradingview_symbol", f"BSE:{bare}")
            else:
                eq["exchange"] = "NSE"
                eq["provider_symbol"] = eq.get("provider_symbol", f"{bare}.NS")
                eq["tradingview_symbol"] = eq.get("tradingview_symbol", f"NSE:{bare}")
            return eq

        # 3. Match Global Assets
        if bare in GLOBAL_ASSETS_REGISTRY:
            return dict(GLOBAL_ASSETS_REGISTRY[bare])

        # 4. Fallback: Determine exchange and currency heuristically
        if is_bse:
            exch = "BSE"
            prov = f"{bare}.BO"
            curr = "INR"
            sym_curr = "₹"
            mkt = "India"
            tv = f"BSE:{bare}"
        elif is_nse or re.match(r"^[A-Z]{3,15}$", bare):
            # Default bare equities to NSE India
            exch = "NSE"
            prov = f"{bare}.NS"
            curr = "INR"
            sym_curr = "₹"
            mkt = "India"
            tv = f"NSE:{bare}"
        else:
            exch = "GLOBAL"
            prov = bare
            curr = "USD"
            sym_curr = "$"
            mkt = "Global"
            tv = bare

        return {
            "symbol": bare,
            "company_name": f"{bare} Equities",
            "exchange": exch,
            "provider_symbol": prov,
            "market": mkt,
            "currency": curr,
            "currency_symbol": sym_curr,
            "sector": "Financial Markets",
            "tradingview_symbol": tv,
            "base_price": 1000.0 if curr == "INR" else 150.0
        }

    @classmethod
    def get_catalog(cls, market: Optional[str] = "India") -> List[Dict[str, Any]]:
        """Return catalog of assets sorted with India/NSE assets first."""
        items: List[Dict[str, Any]] = []

        # Indices first
        for idx in INDIAN_INDICES_REGISTRY.values():
            items.append(dict(idx))

        # Indian Equities
        for eq in INDIAN_EQUITIES_REGISTRY.values():
            items.append(dict(eq))

        # Global assets if requested or if market is 'ALL'/'Global'
        if not market or market.lower() in ("all", "global", "us"):
            for ga in GLOBAL_ASSETS_REGISTRY.values():
                items.append(dict(ga))

        return items

    @classmethod
    def search(cls, query: str, market_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search across company name, symbol, sector, and exchange."""
        q = (query or "").upper().strip()
        all_items = cls.get_catalog(market="ALL")

        if not q:
            # Return Indian market top assets by default
            return [i for i in all_items if i.get("market") == "India"][:20]

        matches: List[Dict[str, Any]] = []
        for item in all_items:
            # Filter by market if provided
            if market_filter and market_filter.upper() != "ALL":
                if item.get("market", "").upper() != market_filter.upper():
                    continue

            sym = item["symbol"].upper()
            name = item["company_name"].upper()
            sec = item.get("sector", "").upper()
            exch = item.get("exchange", "").upper()

            if q in sym or q in name or q in sec or q == exch:
                matches.append(item)

        if not matches:
            # Dynamic asset creation
            resolved = cls.resolve(q)
            matches.append(resolved)

        return matches[:25]


# Singleton helper
symbol_registry = SymbolRegistry()
