"use client";
import React, { useEffect, useRef } from "react";

/**
 * TradingView Symbol Info Widget
 * Shows live price, volume, 52-week range for a specific symbol.
 */
interface SymbolInfoWidgetProps {
  symbol?: string;
}

export function SymbolInfoWidget({ symbol = "NASDAQ:AAPL" }: SymbolInfoWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      locale: "en",
      colorTheme: "dark",
      isTransparent: true,
    });
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
