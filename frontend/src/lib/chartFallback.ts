/**
 * High-fidelity fallback candlestick & volume data generator
 * Provides institutional-quality OHLCV data and quote summaries
 * when the backend API is unreachable (e.g. standalone Netlify deployment, offline, or recovery).
 */

export interface FallbackCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FallbackQuote {
  symbol: string;
  price: number;
  close: number;
  change: number;
  change_pct: number;
  currency: string;
  day_high: number;
  day_low: number;
  volume: number;
  is_fallback?: boolean;
}

export interface FallbackChartResult {
  symbol: string;
  candles: FallbackCandle[];
  quote: FallbackQuote;
}

const ASSET_CATALOG: Record<string, { price: number; currency: string; vol: number }> = {
  // Indian Indices & Equities
  "^NSEI": { price: 25320.0, currency: "INR", vol: 0.008 },
  "NIFTY": { price: 25320.0, currency: "INR", vol: 0.008 },
  "^BSESN": { price: 82850.0, currency: "INR", vol: 0.008 },
  "SENSEX": { price: 82850.0, currency: "INR", vol: 0.008 },
  "RELIANCE.NS": { price: 2980.5, currency: "INR", vol: 0.012 },
  "TCS.NS": { price: 4250.0, currency: "INR", vol: 0.011 },
  "INFY.NS": { price: 1890.0, currency: "INR", vol: 0.013 },
  "HDFCBANK.NS": { price: 1680.0, currency: "INR", vol: 0.012 },
  "ICICIBANK.NS": { price: 1240.0, currency: "INR", vol: 0.012 },
  "TATAMOTORS.NS": { price: 985.0, currency: "INR", vol: 0.016 },

  // US Equities & Tech
  "AAPL": { price: 230.51, currency: "USD", vol: 0.014 },
  "NVDA": { price: 128.50, currency: "USD", vol: 0.024 },
  "TSLA": { price: 254.10, currency: "USD", vol: 0.028 },
  "MSFT": { price: 448.90, currency: "USD", vol: 0.013 },
  "AMZN": { price: 186.40, currency: "USD", vol: 0.016 },
  "META": { price: 565.00, currency: "USD", vol: 0.018 },
  "GOOGL": { price: 182.15, currency: "USD", vol: 0.014 },
  "JPM": { price: 215.00, currency: "USD", vol: 0.012 },

  // US Indices
  "^GSPC": { price: 5750.0, currency: "USD", vol: 0.008 },
  "^NDX": { price: 19800.0, currency: "USD", vol: 0.011 },
  "^DJI": { price: 42100.0, currency: "USD", vol: 0.007 },

  // Crypto
  "BTC-USD": { price: 94150.0, currency: "USD", vol: 0.032 },
  "ETH-USD": { price: 2680.0, currency: "USD", vol: 0.035 },
  "SOL-USD": { price: 182.0, currency: "USD", vol: 0.045 },
  "BNB-USD": { price: 595.0, currency: "USD", vol: 0.025 },
  "XRP-USD": { price: 0.58, currency: "USD", vol: 0.038 },
  "DOGE-USD": { price: 0.14, currency: "USD", vol: 0.05 },
  "ADA-USD": { price: 0.38, currency: "USD", vol: 0.04 },
  "MATIC-USD": { price: 0.42, currency: "USD", vol: 0.04 },

  // Commodities
  "GC=F": { price: 2658.0, currency: "USD", vol: 0.009 },
  "SI=F": { price: 31.80, currency: "USD", vol: 0.016 },
  "CL=F": { price: 71.50, currency: "USD", vol: 0.02 },
  "BZ=F": { price: 75.20, currency: "USD", vol: 0.019 },
  "NG=F": { price: 2.85, currency: "USD", vol: 0.035 },
  "HG=F": { price: 4.35, currency: "USD", vol: 0.014 },
  "PL=F": { price: 995.0, currency: "USD", vol: 0.015 },

  // Forex
  "EURUSD=X": { price: 1.0850, currency: "USD", vol: 0.004 },
  "GBPUSD=X": { price: 1.3020, currency: "USD", vol: 0.005 },
  "USDJPY=X": { price: 152.40, currency: "JPY", vol: 0.006 },
  "USDINR=X": { price: 84.10, currency: "INR", vol: 0.003 },
  "AUDUSD=X": { price: 0.6650, currency: "USD", vol: 0.005 },
  "USDCHF=X": { price: 0.8650, currency: "CHF", vol: 0.004 },
  "DX-Y.NYB": { price: 103.45, currency: "USD", vol: 0.004 },
  "^VIX": { price: 15.80, currency: "USD", vol: 0.05 },
};

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateFallbackChart(
  rawSymbol: string,
  timeframe: string = "1d"
): FallbackChartResult {
  const sym = rawSymbol.trim().toUpperCase();
  const meta = ASSET_CATALOG[sym] || {
    price: 150.0 + (stringHash(sym) % 200),
    currency: sym.endsWith(".NS") || sym.endsWith(".BO") ? "INR" : "USD",
    vol: 0.016,
  };

  const currentPrice = meta.price;
  const numBars = timeframe === "1h" ? 96 : timeframe === "1wk" ? 104 : 140;
  const prng = createPrng(stringHash(sym + timeframe));

  // Determine date intervals
  const now = new Date();
  const candles: FallbackCandle[] = [];
  let price = currentPrice * (1 - (prng() - 0.45) * 0.15); // Start slightly offset to end near current

  for (let i = numBars; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Skip weekends for traditional equities/forex
    if (!sym.includes("BTC") && !sym.includes("ETH") && !sym.includes("SOL")) {
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
    }

    const dateStr = d.toISOString().split("T")[0];
    const change = (prng() - 0.485) * meta.vol * price;
    const open = Math.round(price * 100) / 100;
    const close = Math.round((price + change) * 100) / 100;
    const range = Math.abs(close - open) + prng() * meta.vol * price;
    const high = Math.round((Math.max(open, close) + range * prng()) * 100) / 100;
    const low = Math.round((Math.min(open, close) - range * prng()) * 100) / 100;
    const volume = Math.floor(1000000 + prng() * 15000000);

    candles.push({
      time: dateStr,
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume,
    });

    price = close;
  }

  // Anchor the final bar close to target current price
  if (candles.length > 1) {
    const lastBar = candles[candles.length - 1];
    lastBar.close = currentPrice;
    lastBar.high = Math.max(lastBar.high, currentPrice);
    lastBar.low = Math.min(lastBar.low, currentPrice);
  }

  const last = candles[candles.length - 1] || { open: currentPrice, close: currentPrice, high: currentPrice, low: currentPrice, volume: 5000000 };
  const prev = candles[candles.length - 2] || last;
  const change = Math.round((last.close - prev.close) * 100) / 100;
  const change_pct = Math.round(((last.close - prev.close) / (prev.close || 1)) * 10000) / 100;

  return {
    symbol: sym,
    candles,
    quote: {
      symbol: sym,
      price: currentPrice,
      close: currentPrice,
      change,
      change_pct,
      currency: meta.currency,
      day_high: last.high,
      day_low: last.low,
      volume: last.volume,
      is_fallback: true,
    },
  };
}
