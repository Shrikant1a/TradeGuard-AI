"use client";
import React, { useEffect, useRef } from "react";

/**
 * TradingView Ticker Tape Widget
 * Live scrolling price strip showing real-time quotes.
 * Uses TradingView's official embed widget — no scraping, no unofficial API calls.
 */
interface TickerTapeWidgetProps {
  symbols?: Array<{ proName: string; title: string }>;
}

const DEFAULT_SYMBOLS = [
  { proName: "NASDAQ:AAPL", title: "Apple" },
  { proName: "NASDAQ:NVDA", title: "NVIDIA" },
  { proName: "NASDAQ:TSLA", title: "Tesla" },
  { proName: "NASDAQ:MSFT", title: "Microsoft" },
  { proName: "NASDAQ:GOOGL", title: "Alphabet" },
  { proName: "NASDAQ:AMZN", title: "Amazon" },
  { proName: "NASDAQ:META", title: "Meta" },
  { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
  { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
  { proName: "NSE:RELIANCE", title: "Reliance" },
  { proName: "NSE:TCS", title: "TCS" },
  { proName: "NSE:INFY", title: "Infosys" },
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
  { proName: "TVC:GOLD", title: "Gold" },
];

export function TickerTapeWidget({ symbols = DEFAULT_SYMBOLS }: TickerTapeWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "regular",
      colorTheme: "dark",
      locale: "en",
    });
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbols]);

  return (
    <div
      className="tradingview-widget-container w-full overflow-hidden"
      style={{ height: "46px" }}
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
