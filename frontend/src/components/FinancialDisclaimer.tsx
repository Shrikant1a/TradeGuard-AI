"use client";
import React from "react";
import { ShieldAlert } from "lucide-react";

export function FinancialDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-200/90 text-xs flex items-start gap-2.5 ${className}`}>
      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-amber-300">Important Financial Notice: </span>
        TradeGuard AI provides probabilistic market analysis, historical backtest estimates, research analytics, and simulated paper-trading tools. 
        It <span className="underline decoration-amber-400/50">does not guarantee future performance or profits</span>. 
        All models generate statistical estimates based on historical regimes. Users retain full responsibility for their capital decisions.
      </div>
    </div>
  );
}
