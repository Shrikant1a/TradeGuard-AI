"use client";
import React, { useEffect, useRef } from "react";

/**
 * TradingView Screener Widget
 * Live stock screener showing top movers, most active, etc.
 */
interface ScreenerWidgetProps {
  market?: "us" | "india" | "crypto" | "forex";
  height?: number;
}

export function ScreenerWidget({ market = "us", height = 490 }: ScreenerWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: height,
      defaultColumn: "overview",
      defaultScreen: "most_capitalized",
      market,
      showToolbar: true,
      colorTheme: "dark",
      locale: "en",
      isTransparent: true,
    });
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [market]);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
