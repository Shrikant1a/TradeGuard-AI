"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { TickerTapeWidget } from "@/components/TickerTapeWidget";
import { MarketOverviewWidget } from "@/components/MarketOverviewWidget";
import { ScreenerWidget } from "@/components/ScreenerWidget";
import { TechnicalAnalysisWidget } from "@/components/TechnicalAnalysisWidget";
import { CryptoMarketWidget } from "@/components/CryptoMarketWidget";
import { LightweightChartWidget } from "@/components/LightweightChartWidget";
import { TradeGuardLogo } from "@/components/TradeGuardLogo";

/**
 * POPULAR_SYMBOLS – each entry has:
 *   tv  : TradingView symbol (used by LightweightChartWidget → converted to Yahoo internally)
 *   ta  : TradingView Technical-Analysis widget symbol (must be supported by TV free embed)
 *          Use null to hide the TA widget for symbols that TV blocks (NSE, BSE indices etc..)
 */
const POPULAR_SYMBOLS: { label: string; tv: string; ta: string | null }[] = [
  { label: "AAPL",    tv: "NASDAQ:AAPL",     ta: "NASDAQ:AAPL"     },
  { label: "NVDA",    tv: "NASDAQ:NVDA",     ta: "NASDAQ:NVDA"     },
  { label: "TSLA",    tv: "NASDAQ:TSLA",     ta: "NASDAQ:TSLA"     },
  { label: "BTC",     tv: "BINANCE:BTCUSDT", ta: "BINANCE:BTCUSDT" },
  { label: "ETH",     tv: "BINANCE:ETHUSDT", ta: "BINANCE:ETHUSDT" },
  { label: "NIFTY",   tv: "NSE:NIFTY50",     ta: null              },
  { label: "GOLD",    tv: "TVC:GOLD",        ta: "TVC:GOLD"        },
  { label: "EUR/USD", tv: "FX_IDC:EURUSD",   ta: "FX_IDC:EURUSD"  },
];

/** Extensive suggestion list for autocomplete */
const SUGGESTION_DB: { label: string; tv: string; ta: string | null; name: string; category: string }[] = [
  // 🇮🇳 NSE India
  { label: "RELIANCE", tv: "NSE:RELIANCE",   ta: null, name: "Reliance Industries",        category: "🇮🇳 NSE India" },
  { label: "TCS",      tv: "NSE:TCS",        ta: null, name: "Tata Consultancy Services",  category: "🇮🇳 NSE India" },
  { label: "INFY",     tv: "NSE:INFY",       ta: null, name: "Infosys Ltd.",                category: "🇮🇳 NSE India" },
  { label: "HDFCBANK", tv: "NSE:HDFCBANK",   ta: null, name: "HDFC Bank",                  category: "🇮🇳 NSE India" },
  { label: "ICICIBANK",tv: "NSE:ICICIBANK",  ta: null, name: "ICICI Bank",                 category: "🇮🇳 NSE India" },
  { label: "SBIN",     tv: "NSE:SBIN",       ta: null, name: "State Bank of India",        category: "🇮🇳 NSE India" },
  { label: "BHARTIARTL",tv:"NSE:BHARTIARTL", ta: null, name: "Bharti Airtel",              category: "🇮🇳 NSE India" },
  { label: "ITC",      tv: "NSE:ITC",        ta: null, name: "ITC Limited",                category: "🇮🇳 NSE India" },
  { label: "LT",       tv: "NSE:LT",         ta: null, name: "Larsen & Toubro",            category: "🇮🇳 NSE India" },
  { label: "TATAMOTORS",tv:"NSE:TATAMOTORS", ta: null, name: "Tata Motors",                category: "🇮🇳 NSE India" },
  { label: "TATASTEEL",tv: "NSE:TATASTEEL",  ta: null, name: "Tata Steel",                 category: "🇮🇳 NSE India" },
  { label: "AXISBANK", tv: "NSE:AXISBANK",   ta: null, name: "Axis Bank",                  category: "🇮🇳 NSE India" },
  { label: "KOTAKBANK",tv: "NSE:KOTAKBANK",  ta: null, name: "Kotak Mahindra Bank",        category: "🇮🇳 NSE India" },
  { label: "WIPRO",    tv: "NSE:WIPRO",      ta: null, name: "Wipro Ltd.",                  category: "🇮🇳 NSE India" },
  { label: "SUNPHARMA",tv: "NSE:SUNPHARMA",  ta: null, name: "Sun Pharma",                 category: "🇮🇳 NSE India" },
  { label: "MARUTI",   tv: "NSE:MARUTI",     ta: null, name: "Maruti Suzuki India",        category: "🇮🇳 NSE India" },
  { label: "HINDUNILVR",tv:"NSE:HINDUNILVR", ta: null, name: "Hindustan Unilever",         category: "🇮🇳 NSE India" },
  { label: "ADANIENT", tv: "NSE:ADANIENT",   ta: null, name: "Adani Enterprises",          category: "🇮🇳 NSE India" },
  { label: "ADANIPORTS",tv:"NSE:ADANIPORTS", ta: null, name: "Adani Ports",                category: "🇮🇳 NSE India" },
  { label: "BAJFINANCE",tv:"NSE:BAJFINANCE", ta: null, name: "Bajaj Finance",              category: "🇮🇳 NSE India" },
  { label: "BAJAJFINSV",tv:"NSE:BAJAJFINSV", ta: null, name: "Bajaj Finserv",              category: "🇮🇳 NSE India" },
  { label: "NTPC",     tv: "NSE:NTPC",       ta: null, name: "NTPC Ltd.",                  category: "🇮🇳 NSE India" },
  { label: "POWERGRID",tv: "NSE:POWERGRID",  ta: null, name: "Power Grid Corporation",     category: "🇮🇳 NSE India" },
  { label: "ONGC",     tv: "NSE:ONGC",       ta: null, name: "ONGC",                        category: "🇮🇳 NSE India" },
  { label: "COALINDIA",tv: "NSE:COALINDIA",  ta: null, name: "Coal India",                 category: "🇮🇳 NSE India" },
  { label: "HCLTECH",  tv: "NSE:HCLTECH",    ta: null, name: "HCL Technologies",           category: "🇮🇳 NSE India" },
  { label: "TECHM",    tv: "NSE:TECHM",      ta: null, name: "Tech Mahindra",              category: "🇮🇳 NSE India" },
  // 🇮🇳 NSE Indices
  { label: "NIFTY 50",      tv: "NSE:NIFTY50",       ta: null, name: "NIFTY 50 Index",          category: "🇮🇳 NSE Indices" },
  { label: "NIFTY BANK",    tv: "NSE:BANKNIFTY",     ta: null, name: "Bank NIFTY Index",         category: "🇮🇳 NSE Indices" },
  { label: "SENSEX",        tv: "BSE:SENSEX",         ta: null, name: "BSE SENSEX",              category: "🇮🇳 NSE Indices" },
  { label: "NIFTY IT",      tv: "NSE:CNXIT",          ta: null, name: "NIFTY IT Index",          category: "🇮🇳 NSE Indices" },
  { label: "NIFTY MIDCAP",  tv: "NSE:NIFTYMIDCAP100",ta: null, name: "NIFTY Midcap 100",        category: "🇮🇳 NSE Indices" },
  // 🌎 US Stocks
  { label: "AAPL",  tv: "NASDAQ:AAPL",  ta: "NASDAQ:AAPL",  name: "Apple Inc.",          category: "🌎 US Stocks" },
  { label: "MSFT",  tv: "NASDAQ:MSFT",  ta: "NASDAQ:MSFT",  name: "Microsoft Corp.",     category: "🌎 US Stocks" },
  { label: "NVDA",  tv: "NASDAQ:NVDA",  ta: "NASDAQ:NVDA",  name: "NVIDIA Corp.",        category: "🌎 US Stocks" },
  { label: "GOOGL", tv: "NASDAQ:GOOGL", ta: "NASDAQ:GOOGL", name: "Alphabet Inc.",       category: "🌎 US Stocks" },
  { label: "AMZN",  tv: "NASDAQ:AMZN",  ta: "NASDAQ:AMZN",  name: "Amazon.com Inc.",     category: "🌎 US Stocks" },
  { label: "META",  tv: "NASDAQ:META",  ta: "NASDAQ:META",  name: "Meta Platforms",      category: "🌎 US Stocks" },
  { label: "TSLA",  tv: "NASDAQ:TSLA",  ta: "NASDAQ:TSLA",  name: "Tesla Inc.",          category: "🌎 US Stocks" },
  { label: "JPM",   tv: "NYSE:JPM",     ta: "NYSE:JPM",     name: "JPMorgan Chase",      category: "🌎 US Stocks" },
  { label: "BAC",   tv: "NYSE:BAC",     ta: "NYSE:BAC",     name: "Bank of America",     category: "🌎 US Stocks" },
  { label: "SPY",   tv: "AMEX:SPY",     ta: "AMEX:SPY",     name: "S&P 500 ETF",         category: "🌎 US Stocks" },
  // ₿ Crypto
  { label: "BTC/USDT", tv: "BINANCE:BTCUSDT", ta: "BINANCE:BTCUSDT", name: "Bitcoin",           category: "₿ Crypto" },
  { label: "ETH/USDT", tv: "BINANCE:ETHUSDT", ta: "BINANCE:ETHUSDT", name: "Ethereum",          category: "₿ Crypto" },
  { label: "BNB/USDT", tv: "BINANCE:BNBUSDT", ta: "BINANCE:BNBUSDT", name: "Binance Coin",      category: "₿ Crypto" },
  { label: "SOL/USDT", tv: "BINANCE:SOLUSDT", ta: "BINANCE:SOLUSDT", name: "Solana",            category: "₿ Crypto" },
  { label: "XRP/USDT", tv: "BINANCE:XRPUSDT", ta: "BINANCE:XRPUSDT", name: "XRP",               category: "₿ Crypto" },
  { label: "DOGE/USDT",tv: "BINANCE:DOGEUSDT",ta: "BINANCE:DOGEUSDT",name: "Dogecoin",          category: "₿ Crypto" },
  // 💱 Forex & Commodities
  { label: "EUR/USD", tv: "FX_IDC:EURUSD",  ta: "FX_IDC:EURUSD",  name: "Euro / US Dollar",    category: "💱 Forex" },
  { label: "GBP/USD", tv: "FX_IDC:GBPUSD",  ta: "FX_IDC:GBPUSD",  name: "British Pound / USD", category: "💱 Forex" },
  { label: "USD/JPY", tv: "FX_IDC:USDJPY",  ta: "FX_IDC:USDJPY",  name: "USD / Japanese Yen",  category: "💱 Forex" },
  { label: "USD/INR", tv: "FX_IDC:USDINR",  ta: "FX_IDC:USDINR",  name: "USD / Indian Rupee",  category: "💱 Forex" },
  { label: "GOLD",    tv: "TVC:GOLD",       ta: "TVC:GOLD",       name: "Gold Spot",            category: "🏅 Commodities" },
  { label: "SILVER",  tv: "TVC:SILVER",     ta: "TVC:SILVER",     name: "Silver Spot",          category: "🏅 Commodities" },
  { label: "OIL",     tv: "TVC:USOIL",      ta: "TVC:USOIL",      name: "Crude Oil (WTI)",      category: "🏅 Commodities" },
];

/** Resolve any arbitrary user-typed symbol to a chart-loadable entry */
function resolveCustomSymbol(raw: string): { label: string; tv: string; ta: string | null } {
  const up = raw.toUpperCase().trim();
  // Check known DB first
  const known = SUGGESTION_DB.find(
    (s) =>
      s.label.toUpperCase() === up ||
      s.tv.toUpperCase() === up ||
      s.tv.toUpperCase().split(":")[1] === up
  );
  if (known) return known;
  // Auto-detect pattern
  if (up.endsWith(".NS") || up.startsWith("NSE:")) {
    const sym = up.replace(/^NSE:/, "").replace(/\.NS$/, "");
    return { label: sym, tv: `NSE:${sym}`, ta: null };
  }
  if (up.endsWith(".BO") || up.startsWith("BSE:")) {
    const sym = up.replace(/^BSE:/, "").replace(/\.BO$/, "");
    return { label: sym, tv: `BSE:${sym}`, ta: null };
  }
  if (up.includes("USDT") || up.includes("BTC") || up.includes("ETH") || up.startsWith("BINANCE:")) {
    const sym = up.replace(/^BINANCE:/, "");
    const pair = sym.includes("USDT") ? sym : `${sym}USDT`;
    return { label: sym, tv: `BINANCE:${pair}`, ta: `BINANCE:${pair}` };
  }
  if (up.includes("/")) {
    const sym = up.replace("/", "");
    return { label: up, tv: `FX_IDC:${sym}`, ta: `FX_IDC:${sym}` };
  }
  // Default: try as NASDAQ stock
  return { label: up, tv: `NASDAQ:${up}`, ta: `NASDAQ:${up}` };
}

type ScreenerMarket = "us" | "india" | "crypto" | "forex";

const SCREENER_MARKETS: { label: string; value: ScreenerMarket }[] = [
  { label: "US Stocks", value: "us" },
  { label: "India",     value: "india" },
  { label: "Crypto",    value: "crypto" },
  { label: "Forex",     value: "forex" },
];

export default function LiveMarketsPage() {
  const [selected, setSelected] = useState(POPULAR_SYMBOLS[0]);
  const [screenerMarket, setScreenerMarket] = useState<ScreenerMarket>("us");

  // ── Search Bar State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof SUGGESTION_DB>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const filtered = SUGGESTION_DB.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.tv.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    ).slice(0, 8);
    setSuggestions(filtered);
  }, []);

  const handleSelect = useCallback(
    (entry: { label: string; tv: string; ta: string | null }) => {
      setSelected(entry);
      setSearchQuery("");
      setSuggestions([]);
      setIsSearchFocused(false);
      searchRef.current?.blur();
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        handleSelect(resolveCustomSymbol(searchQuery));
        setSearchQuery("");
        setSuggestions([]);
        setIsSearchFocused(false);
      }
    },
    [searchQuery, suggestions, handleSelect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* ── Sticky Live Ticker Tape ── */}
      <div className="sticky top-0 z-50 bg-[#070c18] border-b border-slate-800/80">
        <TickerTapeWidget onSelectSymbol={(sym) => {
          const clean = sym.toUpperCase().trim();
          const match = POPULAR_SYMBOLS.find(s =>
            s.label.toUpperCase() === clean ||
            s.tv.toUpperCase().includes(clean)
          );
          if (match) {
            setSelected(match);
          } else {
            setSelected(resolveCustomSymbol(clean));
          }
        }} />
      </div>

      {/* ── Page Header ── */}
      <div className="px-3 sm:px-6 pt-4 sm:pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-semibold tracking-widest uppercase">
              Live Market Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Global Market Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Real-time charts powered by TradingView Lightweight Charts · Data via Yahoo Finance
          </p>
        </div>
        <div className="hidden sm:block">
          <TradeGuardLogo size="sm" subtitle="Global Intelligence Feed" />
        </div>
      </div>

      <div className="px-3 sm:px-6 pb-12 space-y-6 sm:space-y-8">

        {/* ── Row 1: Chart + Technical Analysis ── */}
        <section>
          {/* ── Search Bar ── */}
          <div className="mb-4 relative" ref={dropdownRef as any}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all duration-200 bg-[#111827]/80 ${
                  isSearchFocused
                    ? "border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  id="live-market-search"
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search any stock, index, crypto, forex… (e.g. RELIANCE, AAPL, BTC, EUR/USD)"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-mono"
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                    className="text-white/30 hover:text-white/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wide transition-all"
                >
                  Load
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {suggestions.length > 0 && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => handleSelect(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">{s.label}</span>
                        <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-sans">{s.category}</span>
                      </div>
                      <div className="text-xs text-white/40 truncate">{s.name}</div>
                    </div>
                    <span className="text-[10px] text-white/25 font-mono shrink-0">{s.tv}</span>
                  </button>
                ))}
                <div className="px-4 py-2 bg-white/2 border-t border-white/5 text-[10px] text-white/25 flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  Press Enter or click to load · Type any valid symbol not in the list
                </div>
              </div>
            )}
          </div>

          {/* Quick symbol picker */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-white/40 uppercase tracking-widest mr-2">Quick Symbol:</span>
            {POPULAR_SYMBOLS.map((s) => (
              <button
                key={s.tv}
                onClick={() => setSelected(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  selected.tv === s.tv
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* ── Main chart (LightweightChartWidget — no TV restrictions) ── */}
            <div className="xl:col-span-2 bg-[#111827]/60 rounded-2xl border border-white/10 overflow-hidden p-3">
              <LightweightChartWidget symbol={selected.tv} height={500} />
            </div>

            {/* ── Technical Analysis (only shown when TV supports the symbol) ── */}
            <div className="bg-[#111827]/60 rounded-2xl border border-white/10 overflow-hidden p-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2 px-1">
                Technical Analysis
              </h3>

              {selected.ta ? (
                /* TradingView TA widget — works for US/crypto/forex/commodity symbols */
                <TechnicalAnalysisWidget symbol={selected.ta} height={460} />
              ) : (
                /* Fallback for NSE / blocked symbols */
                <div className="flex flex-col items-center justify-center h-[460px] text-center gap-3 px-4">
                  <div className="text-5xl">📊</div>
                  <p className="text-white/60 text-sm font-semibold">
                    Technical Analysis Unavailable
                  </p>
                  <p className="text-white/30 text-xs max-w-xs leading-relaxed">
                    TradingView's Technical Analysis widget does not support this symbol
                    in the free embed tier.<br /><br />
                    The candlestick chart above is powered by our backend data — you can
                    read the EMA 20 / EMA 50 overlays for trend signals.
                  </p>
                  <a
                    href={`https://www.tradingview.com/chart/?symbol=${selected.tv}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold hover:bg-blue-600/30 transition-all"
                  >
                    Open Full Chart on TradingView ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Row 2: Market Overview ── */}
        <section className="bg-[#111827]/60 rounded-2xl border border-white/10 overflow-hidden p-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            📊 Global Market Overview
          </h3>
          <MarketOverviewWidget height={520} />
        </section>

        {/* ── Row 3: Crypto Heatmap + Screener ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Crypto Heatmap */}
          <div className="bg-[#111827]/60 rounded-2xl border border-white/10 overflow-hidden p-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
              🔥 Crypto Market Heatmap
            </h3>
            <CryptoMarketWidget height={480} />
          </div>

          {/* Screener */}
          <div className="bg-[#111827]/60 rounded-2xl border border-white/10 overflow-hidden p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                🔍 Live Screener
              </h3>
              <div className="flex flex-wrap gap-1">
                {SCREENER_MARKETS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setScreenerMarket(m.value)}
                    className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                      screenerMarket === m.value
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <ScreenerWidget market={screenerMarket} height={480} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/20 pb-4">
          Charts powered by TradingView Lightweight Charts · Market data via Yahoo Finance.
          TradeGuard AI is a paper trading and research platform — not investment advice.
        </div>
      </div>
    </div>
  );
}
