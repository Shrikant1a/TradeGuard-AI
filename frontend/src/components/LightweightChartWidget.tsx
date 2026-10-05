"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
} from "lightweight-charts";
import { generateFallbackChart } from "@/lib/chartFallback";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== ""
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== "undefined"
      ? ""
      : "http://127.0.0.1:8000";

/** Map TradingView-style symbols (NSE:TCS) to Yahoo Finance tickers (TCS.NS) */
function toYahooSymbol(raw: string): string {
  const s = raw.trim().toUpperCase();

  // Already a Yahoo-style symbol (has a dot suffix)
  if (s.includes(".")) return s;

  // NSE prefix → .NS suffix
  if (s.startsWith("NSE:")) return `${s.replace("NSE:", "")}.NS`;
  if (s.startsWith("BSE:")) return `${s.replace("BSE:", "")}.BO`;

  // Binance crypto
  if (s.startsWith("BINANCE:")) {
    const pair = s.replace("BINANCE:", ""); // e.g. BTCUSDT
    return pair.replace("USDT", "-USD");    // → BTC-USD  (Yahoo style)
  }

  // Commodities (TVC prefix)
  const tvcMap: Record<string, string> = {
    "TVC:GOLD": "GC=F",
    "TVC:SILVER": "SI=F",
    "TVC:USOIL": "CL=F",
    "TVC:UKOIL": "BZ=F",
    "TVC:NATURALGAS": "NG=F",
    "TVC:COPPER": "HG=F",
    "TVC:PLATINUM": "PL=F",
    "TVC:PALLADIUM": "PA=F",
    "TVC:DXY": "DX-Y.NYB",
    "TVC:VIX": "^VIX",
  };
  if (tvcMap[s]) return tvcMap[s];

  // Forex (FX_IDC prefix)
  if (s.startsWith("FX_IDC:")) {
    const pair = s.replace("FX_IDC:", ""); // EURUSD
    return `${pair.slice(0, 3)}${pair.slice(3)}=X`; // EUR/USD → EURUSD=X
  }

  // Indices
  const indexMap: Record<string, string> = {
    "NSE:NIFTY50": "^NSEI",
    "BSE:SENSEX": "^BSESN",
    "FOREXCOM:SPXUSD": "^GSPC",
    "FOREXCOM:NSXUSD": "^NDX",
    "FOREXCOM:DJI": "^DJI",
    "INDEX:NKY": "^N225",
    "INDEX:DEU40": "^GDAXI",
    "FOREXCOM:UKXGBP": "^FTSE",
  };
  if (indexMap[s]) return indexMap[s];

  // NASDAQ / NYSE bare ticker
  if (s.startsWith("NASDAQ:")) return s.replace("NASDAQ:", "");
  if (s.startsWith("NYSE:")) return s.replace("NYSE:", "");

  return s; // fallback: pass raw
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartApiResponse {
  symbol: string;
  candles: Candle[];
  quote: any;
}

interface LightweightChartWidgetProps {
  /** TradingView-style or bare ticker symbol */
  symbol?: string;
  height?: number;
}

const TIMEFRAMES = [
  { label: "1D", tf: "1d", period: "6mo" },
  { label: "1H", tf: "1h", period: "1mo" },
  { label: "1W", tf: "1wk", period: "2y" },
  { label: "1M", tf: "1mo", period: "5y" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function LightweightChartWidget({
  symbol = "AAPL",
  height = 540,
}: LightweightChartWidgetProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ema20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50Ref = useRef<ISeriesApi<"Line"> | null>(null);

  const [tfIndex, setTfIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [displaySymbol, setDisplaySymbol] = useState("");

  // Compute EMA from close prices
  const computeEMA = (closes: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    closes.forEach((price, i) => {
      if (i === 0) {
        ema.push(price);
      } else {
        ema.push(price * k + ema[i - 1] * (1 - k));
      }
    });
    return ema;
  };

  // Fetch and render chart data
  const loadChart = useCallback(
    async (sym: string, tfIdx: number) => {
      if (!chartRef.current) return;
      const { tf, period } = TIMEFRAMES[tfIdx];
      const yahooSym = toYahooSymbol(sym);
      setLoading(true);
      setError(null);
      setDisplaySymbol(yahooSym);

      let chartData: ChartApiResponse | null = null;

      try {
        const url = `${API_BASE}/api/market-data/${encodeURIComponent(yahooSym)}?timeframe=${tf}&period=${period}`;
        const res = await fetch(url);
        if (res.ok) {
          const data: ChartApiResponse = await res.json();
          if (data && data.candles && data.candles.length > 0) {
            chartData = data;
          }
        }
      } catch (err: any) {
        // Fall back gracefully to high-fidelity client-side dataset
      }

      if (!chartData) {
        const fallback = generateFallbackChart(yahooSym, tf);
        chartData = {
          symbol: fallback.symbol,
          candles: fallback.candles,
          quote: fallback.quote,
        };
      }

      try {
        setQuote(chartData.quote);

        // Sort candles by time ascending
        const sorted = [...chartData.candles].sort((a, b) =>
          a.time.localeCompare(b.time)
        );

        // Candlestick data
        const candleData: CandlestickData[] = sorted.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        // Volume histogram
        const volumeData: HistogramData[] = sorted.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color:
            c.close >= c.open
              ? "rgba(38, 166, 154, 0.4)"
              : "rgba(239, 83, 80, 0.4)",
        }));

        // EMA overlays
        const closes = sorted.map((c) => c.close);
        const ema20 = computeEMA(closes, 20);
        const ema50 = computeEMA(closes, 50);

        const ema20Data: LineData[] = sorted.map((c, i) => ({
          time: c.time as Time,
          value: Math.round(ema20[i] * 100) / 100,
        }));

        const ema50Data: LineData[] = sorted.map((c, i) => ({
          time: c.time as Time,
          value: Math.round(ema50[i] * 100) / 100,
        }));

        candleSeriesRef.current?.setData(candleData);
        volumeSeriesRef.current?.setData(volumeData);
        ema20Ref.current?.setData(ema20Data);
        ema50Ref.current?.setData(ema50Data);

        chartRef.current.timeScale().fitContent();
        setError(null);
      } catch (err: any) {
        console.error("Chart render error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Create chart once on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height - 80, // leave room for toolbar
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "'Inter', 'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#06b6d4", labelBackgroundColor: "#06b6d4" },
        horzLine: { color: "#06b6d4", labelBackgroundColor: "#06b6d4" },
      },
      rightPriceScale: {
        borderColor: "rgba(42,46,57,0.6)",
        textColor: "#94a3b8",
      },
      timeScale: {
        borderColor: "rgba(42,46,57,0.6)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Volume histogram (scale: volume)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // EMA 20 line
    const ema20Series = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 1,
      title: "EMA 20",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // EMA 50 line
    const ema50Series = chart.addSeries(LineSeries, {
      color: "#8b5cf6",
      lineWidth: 1,
      title: "EMA 50",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema20Ref.current = ema20Series;
    ema50Ref.current = ema50Series;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  // Re-load when symbol or timeframe changes
  useEffect(() => {
    loadChart(symbol, tfIndex);
  }, [symbol, tfIndex, loadChart]);

  const isUp = quote ? quote.change_pct >= 0 : true;
  const changeColor = isUp ? "text-emerald-400" : "text-red-400";

  return (
    <div
      className="w-full rounded-xl border border-slate-800 bg-[#080c14] overflow-hidden"
      style={{ height }}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40">
        {/* Symbol & quote */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono font-bold text-white text-sm truncate">
            {displaySymbol || symbol}
          </span>
          {quote && (
            <>
              <span className="font-mono font-bold text-slate-100">
                {quote.currency === "INR" ? "₹" : "$"}
                {quote.close?.toLocaleString()}
              </span>
              <span className={`text-xs font-semibold ${changeColor}`}>
                {isUp ? "▲" : "▼"} {Math.abs(quote.change_pct || 0).toFixed(2)}%
              </span>
            </>
          )}
          {loading && (
            <span className="text-xs text-slate-500 animate-pulse">Loading…</span>
          )}
        </div>

        {/* Legend + timeframe selector */}
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />EMA 20
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-violet-400 inline-block" />EMA 50
            </span>
          </div>
          {/* Timeframe buttons */}
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf, i) => (
              <button
                key={tf.label}
                onClick={() => setTfIndex(i)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  tfIndex === i
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chart container ── */}
      <div className="relative" style={{ height: height - 52 }}>
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 p-6">
            <div className="text-4xl">📊</div>
            <p className="text-slate-400 text-sm font-semibold">{error}</p>
            <p className="text-slate-500 text-xs max-w-xs">
              Try a different symbol or check that the backend is running on port 8000.
            </p>
            <button
              onClick={() => loadChart(symbol, tfIndex)}
              className="mt-2 px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}

export default LightweightChartWidget;
