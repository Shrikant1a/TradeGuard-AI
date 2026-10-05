"use client";
import React, { useEffect, useRef } from "react";

import { resolveClientTradingViewSymbol } from "@/lib/marketRegistry";

/**
 * TradingView Technical Analysis Widget
 * Shows real-time oscillators + moving averages buy/sell summary.
 */
interface TechnicalAnalysisWidgetProps {
  symbol?: string;
  interval?: string;
  height?: number;
}

export function TechnicalAnalysisWidget({
  symbol = "NSE:RELIANCE",
  interval = "1W",
  height = 450,
}: TechnicalAnalysisWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const resolvedSymbol = resolveClientTradingViewSymbol(symbol);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval,
      width: "100%",
      isTransparent: true,
      height,
      symbol: resolvedSymbol,
      showIntervalTabs: true,
      displayMode: "multiple",
      locale: "en",
      colorTheme: "dark",
    });
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol, interval]);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
