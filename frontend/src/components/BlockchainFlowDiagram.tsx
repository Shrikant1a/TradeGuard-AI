"use client";
import React from "react";
import { Database, Cpu, Zap, ShieldCheck, ShoppingCart, Link2, CheckCircle2, ArrowRight } from "lucide-react";

export function BlockchainFlowDiagram() {
  const steps = [
    { label: "Market Data", sub: "Provider Abstraction", icon: Database, color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
    { label: "AI Analysis", sub: "Multi-Model Ensemble", icon: Cpu, color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/10" },
    { label: "Signal Gen", sub: "Probabilistic Output", icon: Zap, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
    { label: "Risk Engine", sub: "Pre-Trade Validation", icon: ShieldCheck, color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10" },
    { label: "Paper Trade", sub: "Virtual Execution", icon: ShoppingCart, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
    { label: "Stellar Soroban", sub: "SHA-256 On-Chain", icon: Link2, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
    { label: "Auditable Result", sub: "Immutable Proof", icon: CheckCircle2, color: "text-emerald-300", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="glass-panel rounded-xl p-4 sm:p-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">TradeGuard Architecture Pipeline</span>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            The Trust Machine: AI Decides, Risk Validates, Blockchain Proves
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          Stellar Soroban Testnet Verified
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative group">
              <div className={`p-3 rounded-lg border ${step.border} ${step.bg} transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between h-full`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${step.color}`} />
                  <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{step.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{step.sub}</div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
