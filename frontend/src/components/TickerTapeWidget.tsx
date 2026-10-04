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
    symbol: "AAPL",
    name: "Apple",
    price: "336.11",
    change: "+6.71",
    changePct: "+2.04%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "apple"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "230.51",
    change: "+3.30",
    changePct: "+1.45%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "nvidia"
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: "352.57",
    change: "-0.27",
    changePct: "-0.08%",
    isPositive: false,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "tesla"
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: "518.08",
    change: "+9.12",
    changePct: "+1.79%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "microsoft"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    price: "344.08",
    change: "+3.16",
    changePct: "+0.93%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "google"
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    price: "249.15",
    change: "+2.48",
    changePct: "+1.01%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "amazon"
  },
  {
    symbol: "META",
    name: "Meta",
    price: "725.18",
    change: "-13.61",
    changePct: "-1.84%",
    isPositive: false,
    currencyPrefix: "$",
    exchange: "NASDAQ",
    iconType: "meta"
  },
  {
    symbol: "BTC-USD",
    name: "Bitcoin",
    price: "84,222.00",
    change: "+598.40",
    changePct: "+0.72%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "Crypto",
    iconType: "bitcoin"
  },
  {
    symbol: "ETH-USD",
    name: "Ethereum",
    price: "2,715.19",
    change: "+29.18",
    changePct: "+1.09%",
    isPositive: true,
    currencyPrefix: "$",
    exchange: "Crypto",
    iconType: "ethereum"
  },
  {
    symbol: "RELIANCE.NS",
    name: "Reliance",
    price: "2,985.40",
    change: "+18.20",
    changePct: "+0.61%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "reliance"
  },
  {
    symbol: "TCS.NS",
    name: "TCS",
    price: "4,210.15",
    change: "+24.50",
    changePct: "+0.59%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "tcs"
  },
  {
    symbol: "INFY.NS",
    name: "Infosys",
    price: "1,890.30",
    change: "+12.10",
    changePct: "+0.64%",
    isPositive: true,
    currencyPrefix: "₹",
    exchange: "NSE",
    iconType: "infosys"
  },
  {
    symbol: "SPX",
    name: "S&P 500",
    price: "5,842.10",
    change: "+34.50",
    changePct: "+0.59%",
    isPositive: true,
    currencyPrefix: "",
    exchange: "INDEX",
    iconType: "spx"
  },
  {
    symbol: "NDX",
    name: "Nasdaq 100",
    price: "20,412.30",
    change: "+142.80",
    changePct: "+0.70%",
    isPositive: true,
    currencyPrefix: "",
    exchange: "INDEX",
    iconType: "ndx"
  }
];

function TickerIcon({ type }: { type: string }) {
  switch (type) {
    case "apple":
      return (
        <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
          
        </span>
      );
    case "nvidia":
      return (
        <span className="w-4 h-4 rounded-sm bg-[#76b900] flex items-center justify-center text-[9px] text-black font-extrabold shrink-0">
          N
        </span>
      );
    case "tesla":
      return (
        <span className="w-4 h-4 rounded-full bg-[#e82127] flex items-center justify-center text-[9px] text-white font-black shrink-0">
          T
        </span>
      );
    case "microsoft":
      return (
        <span className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5 shrink-0">
          <span className="bg-[#f25022] rounded-[1px]" />
          <span className="bg-[#7fba00] rounded-[1px]" />
          <span className="bg-[#00a4ef] rounded-[1px]" />
          <span className="bg-[#ffb900] rounded-[1px]" />
        </span>
      );
    case "google":
      return (
        <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-[#4285f4] shrink-0">
          G
        </span>
      );
    case "amazon":
      return (
        <span className="w-4 h-4 rounded-full bg-[#ff9900] flex items-center justify-center text-[9px] font-black text-black shrink-0">
          a
        </span>
      );
    case "meta":
      return (
        <span className="w-4 h-4 rounded-full bg-[#0081fb] flex items-center justify-center text-[9px] font-extrabold text-white shrink-0">
          ∞
        </span>
      );
    case "bitcoin":
      return (
        <span className="w-4 h-4 rounded-full bg-[#f7931a] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          ₿
        </span>
      );
    case "ethereum":
      return (
        <span className="w-4 h-4 rounded-full bg-[#627eea] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          Ξ
        </span>
      );
    case "spx":
    case "ndx":
      return (
        <span className="w-4 h-4 rounded-sm bg-rose-600/90 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
          500
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
            price: newPrice > 1000 ? newPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : newPrice.toFixed(2),
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

        {/* Second identical track for seamless infinite marquee loop */}
        {tickers.map((item, idx) => (
          <div
            key={`ticker-2-${idx}`}
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
