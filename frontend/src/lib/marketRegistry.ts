/**
 * Centralized Market & Symbol Registry for TradeGuard AI.
 * Defines supported markets (India, United States, Global), exchanges (NSE, BSE, NASDAQ, Crypto),
 * primary benchmark indices, and comprehensive ticker mappings.
 */

export interface MarketAsset {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE" | "NASDAQ" | "NYSE" | "Crypto" | "INDEX";
  market: "India" | "United States" | "Global";
  currency: "INR" | "USD";
  currencySymbol: "₹" | "$";
  sector: string;
  tradingviewSymbol: string;
  providerSymbol: string;
  basePrice: number;
}

export const INDIAN_BENCHMARK_INDICES: MarketAsset[] = [
  {
    symbol: "NIFTY 50",
    name: "NIFTY 50 Index",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Benchmark Index",
    tradingviewSymbol: "NSE:NIFTY50",
    providerSymbol: "^NSEI",
    basePrice: 25150.00
  },
  {
    symbol: "SENSEX",
    name: "BSE SENSEX Index",
    exchange: "BSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Benchmark Index",
    tradingviewSymbol: "BSE:SENSEX",
    providerSymbol: "^BSESN",
    basePrice: 81980.00
  },
  {
    symbol: "NIFTY BANK",
    name: "NIFTY Bank Index",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Banking Index",
    tradingviewSymbol: "NSE:BANKNIFTY",
    providerSymbol: "^NSEBANK",
    basePrice: 52400.00
  },
  {
    symbol: "NIFTY IT",
    name: "NIFTY IT Index",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Technology Index",
    tradingviewSymbol: "NSE:CNXIT",
    providerSymbol: "^CNXIT",
    basePrice: 42100.00
  }
];

export const TOP_INDIAN_EQUITIES: MarketAsset[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Energy & Conglomerate",
    tradingviewSymbol: "NSE:RELIANCE",
    providerSymbol: "RELIANCE.NS",
    basePrice: 2850.50
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Information Technology",
    tradingviewSymbol: "NSE:TCS",
    providerSymbol: "TCS.NS",
    basePrice: 4210.00
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Information Technology",
    tradingviewSymbol: "NSE:INFY",
    providerSymbol: "INFY.NS",
    basePrice: 1895.00
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Banking & Financials",
    tradingviewSymbol: "NSE:HDFCBANK",
    providerSymbol: "HDFCBANK.NS",
    basePrice: 1680.00
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Banking & Financials",
    tradingviewSymbol: "NSE:ICICIBANK",
    providerSymbol: "ICICIBANK.NS",
    basePrice: 1245.00
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Public Banking",
    tradingviewSymbol: "NSE:SBIN",
    providerSymbol: "SBIN.NS",
    basePrice: 795.00
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Telecommunications",
    tradingviewSymbol: "NSE:BHARTIARTL",
    providerSymbol: "BHARTIARTL.NS",
    basePrice: 1685.00
  },
  {
    symbol: "ITC",
    name: "ITC Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Consumer Goods (FMCG)",
    tradingviewSymbol: "NSE:ITC",
    providerSymbol: "ITC.NS",
    basePrice: 482.00
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Infrastructure & Engineering",
    tradingviewSymbol: "NSE:LT",
    providerSymbol: "LT.NS",
    basePrice: 3620.00
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Automotive",
    tradingviewSymbol: "NSE:MARUTI",
    providerSymbol: "MARUTI.NS",
    basePrice: 12850.00
  },
  {
    symbol: "KOTAKBANK",
    name: "Kotak Mahindra Bank Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Banking & Financials",
    tradingviewSymbol: "NSE:KOTAKBANK",
    providerSymbol: "KOTAKBANK.NS",
    basePrice: 1780.00
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Automotive",
    tradingviewSymbol: "NSE:TATAMOTORS",
    providerSymbol: "TATAMOTORS.NS",
    basePrice: 930.00
  },
  {
    symbol: "TATASTEEL",
    name: "Tata Steel Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Metals & Mining",
    tradingviewSymbol: "NSE:TATASTEEL",
    providerSymbol: "TATASTEEL.NS",
    basePrice: 155.00
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Information Technology",
    tradingviewSymbol: "NSE:WIPRO",
    providerSymbol: "WIPRO.NS",
    basePrice: 540.00
  },
  {
    symbol: "BAJFINANCE",
    name: "Bajaj Finance Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Financial Services (NBFC)",
    tradingviewSymbol: "NSE:BAJFINANCE",
    providerSymbol: "BAJFINANCE.NS",
    basePrice: 7180.00
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharmaceutical Industries Ltd.",
    exchange: "NSE",
    market: "India",
    currency: "INR",
    currencySymbol: "₹",
    sector: "Pharmaceuticals",
    tradingviewSymbol: "NSE:SUNPHARMA",
    providerSymbol: "SUNPHARMA.NS",
    basePrice: 1890.00
  }
];

export const GLOBAL_MARKET_ASSETS: MarketAsset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    market: "United States",
    currency: "USD",
    currencySymbol: "$",
    sector: "Technology",
    tradingviewSymbol: "NASDAQ:AAPL",
    providerSymbol: "AAPL",
    basePrice: 224.23
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    market: "United States",
    currency: "USD",
    currencySymbol: "$",
    sector: "Semiconductors",
    tradingviewSymbol: "NASDAQ:NVDA",
    providerSymbol: "NVDA",
    basePrice: 128.50
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    exchange: "NASDAQ",
    market: "United States",
    currency: "USD",
    currencySymbol: "$",
    sector: "Automotive",
    tradingviewSymbol: "NASDAQ:TSLA",
    providerSymbol: "TSLA",
    basePrice: 254.10
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    exchange: "NASDAQ",
    market: "United States",
    currency: "USD",
    currencySymbol: "$",
    sector: "Technology",
    tradingviewSymbol: "NASDAQ:MSFT",
    providerSymbol: "MSFT",
    basePrice: 448.90
  },
  {
    symbol: "BTC-USD",
    name: "Bitcoin USD",
    exchange: "Crypto",
    market: "Global",
    currency: "USD",
    currencySymbol: "$",
    sector: "Cryptocurrency",
    tradingviewSymbol: "BINANCE:BTCUSDT",
    providerSymbol: "BTC-USD",
    basePrice: 63450.00
  },
  {
    symbol: "ETH-USD",
    name: "Ethereum USD",
    exchange: "Crypto",
    market: "Global",
    currency: "USD",
    currencySymbol: "$",
    sector: "Cryptocurrency",
    tradingviewSymbol: "BINANCE:ETHUSDT",
    providerSymbol: "ETH-USD",
    basePrice: 2650.00
  }
];

export const ALL_VERIFIED_ASSETS: MarketAsset[] = [
  ...INDIAN_BENCHMARK_INDICES,
  ...TOP_INDIAN_EQUITIES,
  ...GLOBAL_MARKET_ASSETS
];

export const DEFAULT_ASSET: MarketAsset = TOP_INDIAN_EQUITIES[0]; // RELIANCE
export const DEFAULT_INDEX: MarketAsset = INDIAN_BENCHMARK_INDICES[0]; // NIFTY 50

/**
 * Resolves any raw symbol to its verified TradingView chart symbol.
 * Default exchange is NSE for bare Indian equities.
 */
export function resolveClientTradingViewSymbol(rawSymbol: string): string {
  const sym = (rawSymbol || "RELIANCE").trim().toUpperCase();
  if (sym.includes(":")) return sym;

  // Search in verified assets
  const match = ALL_VERIFIED_ASSETS.find(
    a => a.symbol === sym || a.providerSymbol.toUpperCase() === sym || a.symbol.replace(" ", "") === sym.replace(" ", "")
  );
  if (match) return match.tradingviewSymbol;

  // Check suffix
  if (sym.endsWith(".NS")) return `NSE:${sym.replace(".NS", "")}`;
  if (sym.endsWith(".BO")) return `BSE:${sym.replace(".BO", "")}`;

  // Default bare equities to NSE India
  return `NSE:${sym}`;
}

export const INDIAN_STOCKS = TOP_INDIAN_EQUITIES;
export const INDIAN_INDICES = INDIAN_BENCHMARK_INDICES;
