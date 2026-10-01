"use client";

import React, { useState } from "react";
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
 *          Use null to hide the TA widget for symbols that TV blocks (NSE, BSE indices etc.)
 */
const POPULAR_SYMBOLS: { label: string; tv: string; ta: string | null }[] = [
  { label: "AAPL",    tv: "NASDAQ:AAPL",     ta: "NASDAQ:AAPL"     },
  { label: "NVDA",    tv: "NASDAQ:NVDA",     ta: "NASDAQ:NVDA"     },
  { label: "TSLA",    tv: "NASDAQ:TSLA",     ta: "NASDAQ:TSLA"     },
  { label: "BTC",     tv: "BINANCE:BTCUSDT", ta: "BINANCE:BTCUSDT" },
  { label: "ETH",     tv: "BINANCE:ETHUSDT", ta: "BINANCE:ETHUSDT" },
  { label: "NIFTY",   tv: "NSE:NIFTY50",     ta: null              }, // TV embed blocks NSE index
  { label: "GOLD",    tv: "TVC:GOLD",        ta: "TVC:GOLD"        },
  { label: "EUR/USD", tv: "FX_IDC:EURUSD",   ta: "FX_IDC:EURUSD"  },
];

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* ── Sticky Live Ticker Tape ── */}
      <div className="sticky top-0 z-50 bg-[#0d0d1a]/95 backdrop-blur border-b border-white/5">
        <TickerTapeWidget onSelectSymbol={(sym) => {
          const clean = sym.toUpperCase().trim();
          const match = POPULAR_SYMBOLS.find(s => 
            s.label.toUpperCase() === clean || 
            s.tv.toUpperCase().includes(clean)
          );
          if (match) {
            setSelected(match);
          } else {
            const tv = clean.endsWith(".NS") ? `BSE:${clean.replace(".NS", "")}` : clean.includes("-USD") ? `BINANCE:${clean.replace("-USD", "USDT")}` : `NASDAQ:${clean}`;
            setSelected({ label: clean, tv, ta: clean.endsWith(".NS") ? null : tv });
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
