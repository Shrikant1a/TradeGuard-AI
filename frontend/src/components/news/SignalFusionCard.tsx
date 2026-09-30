"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SignalFusionCardProps {
  symbol: string;
  onOpenAudit?: () => void;
}

export function SignalFusionCard({ symbol, onOpenAudit }: SignalFusionCardProps) {
  const [fusion, setFusion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFusion() {
      if (!symbol) return;
      setLoading(true);
      try {
        const data = await api.getSignalFusion(symbol);
        setFusion(data);
      } catch (e) {
        console.error("Failed to load signal fusion:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFusion();
  }, [symbol]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse text-xs text-slate-400">
        Synthesizing Technical Indicators with Financial News Intelligence for {symbol}...
      </div>
    );
  }

  if (!fusion) return null;

  const combinedSignal = fusion.combined_signal || "HOLD";
  const getSignalBadge = (sig: string) => {
    if (sig === "BUY") return "text-emerald-400 bg-emerald-500/15 border-emerald-500/40";
    if (sig === "SELL") return "text-rose-400 bg-rose-500/15 border-rose-500/40";
    return "text-amber-400 bg-amber-500/15 border-amber-500/40";
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl shadow-blue-950/10">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Technical + News AI Signal Fusion</span>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.2 rounded border border-blue-500/20">
                Probabilistic
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Combines mathematical indicators with live news sentiment & event materiality
            </p>
          </div>
        </div>

        {fusion.blockchain_verified && (
          <button
            onClick={onOpenAudit}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 hover:bg-emerald-500/25 transition-colors"
          >
            <span>✓ Stellar Verified</span>
            <span className="text-[10px] opacity-75">Soroban</span>
          </button>
        )}
      </div>

      {/* Signal Comparison Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Technical */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Technical Analysis</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-base font-extrabold px-2 py-0.5 rounded border ${getSignalBadge(fusion.technical_signal)}`}>
              {fusion.technical_signal}
            </span>
            <span className="text-xs text-slate-300 font-mono">{fusion.technical_confidence}% conf</span>
          </div>
        </div>

        {/* News Intelligence */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">News Intelligence</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-base font-extrabold px-2 py-0.5 rounded border ${
              fusion.news_sentiment === "POSITIVE"
                ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/40"
                : fusion.news_sentiment === "NEGATIVE"
                ? "text-rose-400 bg-rose-500/15 border-rose-500/40"
                : "text-amber-400 bg-amber-500/15 border-amber-500/40"
            }`}>
              {fusion.news_sentiment}
            </span>
            <span className="text-xs text-slate-300 font-mono">Impact: {fusion.news_impact_score}/100</span>
          </div>
        </div>

        {/* Combined Fusion Signal */}
        <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/40 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-blue-300 uppercase">Combined AI Verdict</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className={`text-lg font-black px-2.5 py-0.5 rounded border ${getSignalBadge(combinedSignal)}`}>
              {combinedSignal}
            </span>
            <span className="text-xs text-blue-200 font-bold font-mono">{fusion.combined_confidence}% conf</span>
          </div>
        </div>
      </div>

      {/* Factor Context List (Section 14) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        {/* Technical Drivers */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span className="text-blue-400">📈</span> Technical Factors
          </span>
          <ul className="space-y-1 text-slate-300">
            {(fusion.technical_factors || []).map((f: string, i: number) => (
              <li key={i} className="leading-snug">{f}</li>
            ))}
          </ul>
        </div>

        {/* News Drivers */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span className="text-emerald-400">📰</span> News Materiality
          </span>
          <ul className="space-y-1 text-slate-300">
            {(fusion.news_factors || []).map((f: string, i: number) => (
              <li key={i} className="leading-snug">{f}</li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
            <span className="text-rose-400">🛡️</span> Risk & Volatility
          </span>
          <ul className="space-y-1 text-slate-300">
            {(fusion.risk_factors || []).map((f: string, i: number) => (
              <li key={i} className="leading-snug">{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Synthesis Reasoning Box */}
      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <strong className="text-white font-semibold">Synthesis Reasoning: </strong>
        {fusion.reasoning}
      </div>
    </div>
  );
}
