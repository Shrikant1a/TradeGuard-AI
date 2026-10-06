"use client";

import React, { useState, useEffect } from "react";

export interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePct: string;
  isPositive: boolean;
  currencyPrefix?: string;
  exchange?: string;
  iconType: string;
}

const INITIAL_TICKERS: TickerItem[] = [
  {
    symbol: "NIFTY 50",
    name: "Nifty 50",
    price: "25,150.25",
    change: "+145.30",
    changePct: "+0.58%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "nifty"
  },
  {
    symbol: "SENSEX",
    name: "BSE Sensex",
    price: "81,980.50",
    change: "+420.15",
    changePct: "+0.52%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "BSE",
    iconType: "sensex"
  },
  {
    symbol: "NIFTY BANK",
    name: "Bank Nifty",
    price: "52,410.80",
    change: "+310.40",
    changePct: "+0.60%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "bank"
  },
  {
    symbol: "RELIANCE",
    name: "Reliance",
    price: "2,850.50",
    change: "+32.10",
    changePct: "+1.14%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "reliance"
  },
  {
    symbol: "TCS",
    name: "TCS",
    price: "4,210.00",
    change: "+35.50",
    changePct: "+0.85%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "tcs"
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: "1,680.00",
    change: "+12.40",
    changePct: "+0.74%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "hdfc"
  },
  {
    symbol: "INFY",
    name: "Infosys",
    price: "1,895.00",
    change: "+15.20",
    changePct: "+0.81%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "infosys"
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    price: "1,245.00",
    change: "+18.30",
    changePct: "+1.49%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "icici"
  },
  {
    symbol: "SBIN",
    name: "SBI",
    price: "795.00",
    change: "+8.50",
    changePct: "+1.08%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "sbi"
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel",
    price: "1,685.00",
    change: "+21.00",
    changePct: "+1.26%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "airtel"
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    price: "482.00",
    change: "-1.50",
    changePct: "-0.31%",
    isPositive: false,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "itc"
  },
  {
    symbol: "LT",
    name: "L&T",
    price: "3,620.00",
    change: "+45.00",
    changePct: "+1.26%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "lt"
  },
  {
    symbol: "BTC-USD",
    name: "Bitcoin",
    price: "63,450.00",
    change: "+450.00",
    changePct: "+0.71%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "Crypto",
    iconType: "bitcoin"
  }
];

function TickerIcon({ type }: { type: string }) {
  switch (type) {
    case "nifty":
    case "sensex":
      return (
        <span className="w-4 h-4 rounded-sm bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[8px] font-black text-white shrink-0">
          50
        </span>
      );
    case "bank":
      return (
        <span className="w-4 h-4 rounded-sm bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[8px] font-black text-white shrink-0">
          BK
        </span>
      );
    case "reliance":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#0047ba] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          R
        </span>
      );
    case "tcs":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#5c2d91] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          T
        </span>
      );
    case "hdfc":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#004c8f] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          H
        </span>
      );
    case "infosys":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#007cc3] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          I
        </span>
      );
    case "icici":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#b32b17] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          IC
        </span>
      );
    case "sbi":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#22579b] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          SB
        </span>
      );
    case "airtel":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#ea2328] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          A
        </span>
      );
    case "itc":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#0a5c36] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          ITC
        </span>
      );
    case "lt":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#005a9c] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          LT
        </span>
      );
    case "bitcoin":
      return (
        <span className="w-4 h-4 rounded-full bg-[#f7931a] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          ₿
        </span>
      );
    default:
      return (
        <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-semibold text-slate-300 shrink-0">
          ●
        </span>
      );
  }
}

interface TickerTapeWidgetProps {
  onSelectSymbol?: (symbol: string) => void;
}

export function TickerTapeWidget({ onSelectSymbol }: TickerTapeWidgetProps) {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);

  // Background price micro-jitter / live update to simulate real-time ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          if (Math.random() > 0.4) return t; // Only update subset randomly
          const rawNum = parseFloat(t.price.replace(/,/g, ""));
          const delta = (Math.random() - 0.49) * (rawNum * 0.0008);
          const newPrice = Math.max(0.1, rawNum + delta);
          const isUp = delta >= 0;
          return {
            ...t,
            price: newPrice > 1000 ? newPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : newPrice.toFixed(2),
            isPositive: isUp ? true : t.isPositive
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#070c18] border-b border-slate-800/80 select-none z-10"
      style={{ height: "42px" }}
    >
      {/* Left subtle fade gradient mask */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#070c18] to-transparent z-10 pointer-events-none" />

      {/* Right subtle fade gradient mask */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#070c18] to-transparent z-10 pointer-events-none" />

      {/* Continuous Marquee Track (Duplicated for seamless 100% infinite scroll) */}
      <div className="ticker-marquee-track h-full items-center">
        {/* First track */}
        {tickers.map((item, idx) => (
          <div
            key={`ticker-1-${idx}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSymbol) onSelectSymbol(item.symbol);
            }}
            className="flex items-center space-x-2 px-3.5 h-full cursor-pointer hover:bg-slate-800/60 active:scale-[0.98] transition-all group shrink-0 border-r border-slate-800/60"
            title={`Click to analyze ${item.name} (${item.symbol})`}
          >
            <TickerIcon type={item.iconType} />
            <span className="text-[13px] font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              {item.name}
            </span>
            <div className="flex items-baseline space-x-0.5">
              <span className="text-[12.5px] font-medium text-slate-200 tabular-nums tracking-tight whitespace-nowrap">
                {item.price}
              </span>
              <span className="text-[9.5px] font-bold text-amber-500 leading-none select-none">
                D
              </span>
            </div>
            <span
              className={`text-[12px] font-medium tabular-nums tracking-tight whitespace-nowrap ${
                item.isPositive ? "text-[#00d09c]" : "text-[#f43f5e]"
              }`}
            >
              {item.change} ({item.changePct})
            </span>
          </div>
        ))}

        {/* Second identical track: aria-hidden intentional — required for seamless infinite CSS marquee loop (TC-057) */}
        {tickers.map((item, idx) => (
          <div
            key={`ticker-2-${idx}`}
            aria-hidden="true"
            data-marquee-duplicate="true"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSymbol) onSelectSymbol(item.symbol);
            }}
            className="flex items-center space-x-2 px-3.5 h-full cursor-pointer hover:bg-slate-800/60 active:scale-[0.98] transition-all group shrink-0 border-r border-slate-800/60"
            title={`Click to analyze ${item.name} (${item.symbol})`}
          >
            <TickerIcon type={item.iconType} />
            <span className="text-[13px] font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              {item.name}
            </span>
            <div className="flex items-baseline space-x-0.5">
              <span className="text-[12.5px] font-medium text-slate-200 tabular-nums tracking-tight whitespace-nowrap">
                {item.price}
              </span>
              <span className="text-[9.5px] font-bold text-amber-500 leading-none select-none">
                D
              </span>
            </div>
            <span
              className={`text-[12px] font-medium tabular-nums tracking-tight whitespace-nowrap ${
                item.isPositive ? "text-[#00d09c]" : "text-[#f43f5e]"
              }`}
            >
              {item.change} ({item.changePct})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
