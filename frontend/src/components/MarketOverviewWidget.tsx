"use client";
import React, { useEffect, useRef } from "react";

/**
 * TradingView Market Overview Widget
 * Shows live market performance across major indices, currencies, and crypto.
 */
interface MarketOverviewWidgetProps {
  height?: number;
}

export function MarketOverviewWidget({ height = 600 }: MarketOverviewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: height,
      plotLineColorGrowing: "rgba(41, 98, 255, 1)",
      plotLineColorFalling: "rgba(255, 74, 104, 1)",
      gridLineColor: "rgba(42, 46, 57, 0)",
      scaleFontColor: "rgba(134, 137, 147, 1)",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(255, 74, 104, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(255, 74, 104, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" },
            { s: "FOREXCOM:DJI", d: "Dow Jones" },
            { s: "INDEX:NKY", d: "Nikkei 225" },
            { s: "INDEX:DEU40", d: "DAX" },
            { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
            { s: "NSE:NIFTY50", d: "Nifty 50" },
            { s: "BSE:SENSEX", d: "Sensex" },
          ],
          originalTitle: "Indices",
        },
        {
          title: "Commodities",
          symbols: [
            { s: "CME_MINI:ES1!", d: "S&P 500" },
            { s: "COMEX:GC1!", d: "Gold" },
            { s: "NYMEX:CL1!", d: "Crude Oil" },
            { s: "NYMEX:NG1!", d: "Natural Gas" },
            { s: "COMEX:SI1!", d: "Silver" },
            { s: "CBOT:ZW1!", d: "Wheat" },
          ],
          originalTitle: "Commodities",
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
            { s: "BINANCE:XRPUSDT", d: "XRP" },
            { s: "BINANCE:ADAUSDT", d: "Cardano" },
          ],
          originalTitle: "Crypto",
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX_IDC:EURUSD", d: "EUR/USD" },
            { s: "FX_IDC:USDJPY", d: "USD/JPY" },
            { s: "FX_IDC:GBPUSD", d: "GBP/USD" },
            { s: "FX_IDC:USDINR", d: "USD/INR" },
            { s: "FX_IDC:USDCNY", d: "USD/CNY" },
            { s: "FX_IDC:AUDUSD", d: "AUD/USD" },
          ],
          originalTitle: "Forex",
        },
      ],
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
