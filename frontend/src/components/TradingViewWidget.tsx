"use client";
import React, { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "dark" | "light";
  height?: number;
}

/**
 * Comprehensive symbol resolver — maps human-readable names and bare tickers
 * to valid TradingView exchange:symbol format.
 */
export function resolveTVSymbol(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");

  // Already fully qualified
  if (s.includes(":")) return s;

  // ── Commodities ───────────────────────────────────────────────────────────
  const commodities: Record<string, string> = {
    GOLD: "TVC:GOLD",
    XAU: "TVC:GOLD",
    XAUUSD: "TVC:GOLD",
    SILVER: "TVC:SILVER",
    XAG: "TVC:SILVER",
    XAGUSD: "TVC:SILVER",
    OIL: "TVC:USOIL",
    CRUDE: "TVC:USOIL",
    CRUDEOIL: "TVC:USOIL",
    WTI: "TVC:USOIL",
    BRENT: "TVC:UKOIL",
    UKOIL: "TVC:UKOIL",
    NATURALGAS: "TVC:NATURALGAS",
    GAS: "TVC:NATURALGAS",
    COPPER: "TVC:COPPER",
    PLATINUM: "TVC:PLATINUM",
    PALLADIUM: "TVC:PALLADIUM",
    WHEAT: "CBOT:ZW1!",
    CORN: "CBOT:ZC1!",
    COTTON: "NYMEX:CT1!",
  };
  if (commodities[s]) return commodities[s];

  // ── Indices ───────────────────────────────────────────────────────────────
  const indices: Record<string, string> = {
    NIFTY: "NSE:NIFTY50",
    NIFTY50: "NSE:NIFTY50",
    BANKNIFTY: "NSE:BANKNIFTY",
    SENSEX: "BSE:SENSEX",
    SPX: "FOREXCOM:SPXUSD",
    SP500: "FOREXCOM:SPXUSD",
    "S&P500": "FOREXCOM:SPXUSD",
    NASDAQ: "FOREXCOM:NSXUSD",
    NDX: "FOREXCOM:NSXUSD",
    DOW: "FOREXCOM:DJI",
    DOWJONES: "FOREXCOM:DJI",
    DJI: "FOREXCOM:DJI",
    NIKKEI: "INDEX:NKY",
    FTSE: "FOREXCOM:UKXGBP",
    DAX: "INDEX:DEU40",
    VIX: "TVC:VIX",
  };
  if (indices[s]) return indices[s];

  // ── Crypto ────────────────────────────────────────────────────────────────
  const crypto: Record<string, string> = {
    BTC: "BINANCE:BTCUSDT",
    BITCOIN: "BINANCE:BTCUSDT",
    "BTC-USD": "BINANCE:BTCUSDT",
    BTCUSD: "BINANCE:BTCUSDT",
    BTCUSDT: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    ETHEREUM: "BINANCE:ETHUSDT",
    "ETH-USD": "BINANCE:ETHUSDT",
    ETHUSD: "BINANCE:ETHUSDT",
    ETHUSDT: "BINANCE:ETHUSDT",
    SOL: "BINANCE:SOLUSDT",
    SOLANA: "BINANCE:SOLUSDT",
    BNB: "BINANCE:BNBUSDT",
    XRP: "BINANCE:XRPUSDT",
    RIPPLE: "BINANCE:XRPUSDT",
    ADA: "BINANCE:ADAUSDT",
    CARDANO: "BINANCE:ADAUSDT",
    DOGE: "BINANCE:DOGEUSDT",
    DOGECOIN: "BINANCE:DOGEUSDT",
    MATIC: "BINANCE:MATICUSDT",
    POLYGON: "BINANCE:MATICUSDT",
    DOT: "BINANCE:DOTUSDT",
    POLKADOT: "BINANCE:DOTUSDT",
    AVAX: "BINANCE:AVAXUSDT",
    AVALANCHE: "BINANCE:AVAXUSDT",
    LINK: "BINANCE:LINKUSDT",
    CHAINLINK: "BINANCE:LINKUSDT",
    LTC: "BINANCE:LTCUSDT",
    LITECOIN: "BINANCE:LTCUSDT",
    UNI: "BINANCE:UNIUSDT",
    UNISWAP: "BINANCE:UNIUSDT",
    ATOM: "BINANCE:ATOMUSDT",
    COSMOS: "BINANCE:ATOMUSDT",
    XLM: "BINANCE:XLMUSDT",
    STELLAR: "BINANCE:XLMUSDT",
    NEAR: "BINANCE:NEARUSDT",
    SUI: "BINANCE:SUIUSDT",
    ARB: "BINANCE:ARBUSDT",
    OP: "BINANCE:OPUSDT",
  };
  if (crypto[s]) return crypto[s];

  // ── Forex ─────────────────────────────────────────────────────────────────
  const forex: Record<string, string> = {
    EURUSD: "FX_IDC:EURUSD",
    "EUR/USD": "FX_IDC:EURUSD",
    GBPUSD: "FX_IDC:GBPUSD",
    "GBP/USD": "FX_IDC:GBPUSD",
    USDJPY: "FX_IDC:USDJPY",
    "USD/JPY": "FX_IDC:USDJPY",
    USDINR: "FX_IDC:USDINR",
    "USD/INR": "FX_IDC:USDINR",
    USDCAD: "FX_IDC:USDCAD",
    AUDUSD: "FX_IDC:AUDUSD",
    USDCHF: "FX_IDC:USDCHF",
    NZDUSD: "FX_IDC:NZDUSD",
    DXY: "TVC:DXY",
    DOLLAR: "TVC:DXY",
  };
  if (forex[s]) return forex[s];

  // ── Indian NSE stocks (common names) ──────────────────────────────────────
  const nseNames: Record<string, string> = {
    RELIANCE: "NSE:RELIANCE",
    TCS: "NSE:TCS",
    INFOSYS: "NSE:INFY",
    INFY: "NSE:INFY",
    WIPRO: "NSE:WIPRO",
    HDFC: "NSE:HDFCBANK",
    HDFCBANK: "NSE:HDFCBANK",
    ICICIBANK: "NSE:ICICIBANK",
    SBIN: "NSE:SBIN",
    STATEBANK: "NSE:SBIN",
    BAJAJFINANCE: "NSE:BAJFINANCE",
    BAJFINANCE: "NSE:BAJFINANCE",
    TITAN: "NSE:TITAN",
    ADANI: "NSE:ADANIENT",
    ADANIENT: "NSE:ADANIENT",
    TATAMOTORS: "NSE:TATAMOTORS",
    TATA: "NSE:TATAMOTORS",
    MARUTI: "NSE:MARUTI",
    SUNPHARMA: "NSE:SUNPHARMA",
    ASIANPAINTS: "NSE:ASIANPAINT",
    KOTAK: "NSE:KOTAKBANK",
    KOTAKBANK: "NSE:KOTAKBANK",
    ULTRACEMCO: "NSE:ULTRACEMCO",
    POWERGRID: "NSE:POWERGRID",
    NTPC: "NSE:NTPC",
    ONGC: "NSE:ONGC",
    HINDALCO: "NSE:HINDALCO",
  };
  if (nseNames[s]) return nseNames[s];

  // ── Indian .NS suffix → NSE ───────────────────────────────────────────────
  if (s.endsWith(".NS")) return `NSE:${s.replace(".NS", "")}`;
  if (s.endsWith(".BO")) return `BSE:${s.replace(".BO", "")}`;

  // ── US stocks — default to NASDAQ ─────────────────────────────────────────
  // Well-known NYSE tickers
  const nyse = new Set([
    "JPM","BAC","GS","MS","WFC","C","BRK.A","BRK.B",
    "XOM","CVX","COP","BP","PFE","JNJ","MRK","ABT",
    "WMT","KO","PG","DIS","HD","NKE","MCD","VZ","T",
    "GE","BA","CAT","MMM","UPS","FDX","GM","F",
  ]);
  if (nyse.has(s)) return `NYSE:${s}`;

  return `NASDAQ:${s}`;
}

export function TradingViewWidget({
  symbol = "NASDAQ:AAPL",
  theme = "dark",
  height = 580,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const tvSymbol = resolveTVSymbol(symbol);

    container.className =
      "tradingview-widget-container w-full rounded-xl overflow-hidden border border-slate-800 bg-[#080c14]";
    container.style.height = `${height}px`;

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: height,
      symbol: tvSymbol,
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      backgroundColor: "rgba(8, 12, 20, 0)",
      gridColor: "rgba(42, 46, 57, 0.4)",
      support_host: "https://www.tradingview.com",
      studies: ["STD;EMA", "STD;RSI", "STD;MACD"],
    });

    container.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, theme, height]);

  return (
    <div ref={containerRef} style={{ height: `${height}px`, width: "100%" }} />
  );
}

export default TradingViewWidget;
