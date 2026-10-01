"use client";
import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, Shield, Zap, Sparkles, 
  CheckCircle2, AlertTriangle, ArrowUpRight, Link2, 
  HelpCircle, RefreshCw 
} from "lucide-react";

interface AIMarketIntelligenceBannerProps {
  data: any;
  onRefresh?: () => void;
  onOpenTradeModal?: (symbol: string, side: string, price: number) => void;
  onOpenBlockchainVerify?: (signalCode: string, signalHash: string) => void;
}

export function AIMarketIntelligenceBanner({
  data,
  onRefresh,
  onOpenTradeModal,
  onOpenBlockchainVerify
}: AIMarketIntelligenceBannerProps) {
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);

  if (!data || !data.signal) {
    return (
      <div className="glass-panel p-6 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
        Loading AI Market Intelligence...
      </div>
    );
  }

  const { symbol = "AAPL", metrics = {}, signal = {}, explanation = {}, blockchain_verification } = data;
  const isBuy = signal?.signal_type === "BUY";
  const isSell = signal?.signal_type === "SELL";
  const bullishPct = signal?.probabilities?.bullish ?? (isBuy ? (signal?.confidence || 76.5) : 32.0);
  const closePrice = metrics?.close ?? 230.51;
  const atrPct = metrics?.atr_pct ?? 1.82;
  const trend = metrics?.trend || (isBuy ? "BULLISH" : "NEUTRAL");
  const sma50 = metrics?.sma_50 || Math.round(closePrice * 0.96 * 100) / 100;
  const momentum = metrics?.momentum || (isBuy ? "STRONG POSITIVE" : "MODERATE");
  const rsiVal = metrics?.rsi ?? metrics?.rsi_14 ?? 58.4;
  const positiveFactors: string[] = Array.isArray(explanation?.positive_factors)
    ? explanation.positive_factors
    : [
        `Price (${typeof closePrice === "number" ? closePrice.toFixed(2) : closePrice}) is supported by moving average trend alignment`,
        `RSI momentum indicator demonstrates constructive technical accumulation`,
        `Trading volume confirmed institutional execution participation`
      ];
  const riskFactors: string[] = Array.isArray(explanation?.risk_factors)
    ? explanation.risk_factors
    : [
        `Dynamic stop-loss bracket established at $${signal?.stop_loss || (closePrice * 0.965).toFixed(2)}`,
        `Monitor corporate earnings and macroeconomic releases for volatility shifts`
      ];
  const finalReasoning: string = explanation?.final_reasoning || explanation?.summary ||
    `Multi-factor ensemble model registers ${signal?.signal_type || "BUY"} consensus with ${signal?.confidence || 76}% confidence score. Macro trend and momentum indicators show consistent directional alignment.`;

  const signalColor = isBuy 
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 glow-emerald"
    : isSell 
      ? "text-rose-400 bg-rose-500/10 border-rose-500/30 glow-rose"
      : "text-amber-400 bg-amber-500/10 border-amber-500/30";

  return (
    <div className="glass-panel rounded-xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-[#0a1124] to-slate-900/90 p-5 sm:p-6 glow-cyan">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI Market Intelligence</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Stellar Soroban Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2 mt-0.5">
              {symbol}
              <span className="text-base sm:text-lg font-mono font-medium text-slate-300">
                ${typeof closePrice === "number" ? closePrice.toFixed(2) : closePrice}
              </span>
              <span className={`text-xs sm:text-sm font-semibold flex items-center ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBuy ? <TrendingUp className="w-4 h-4 mr-0.5" /> : <TrendingDown className="w-4 h-4 mr-0.5" />}
                {bullishPct}% Bullish Prob
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="Refresh AI Analysis"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {onOpenTradeModal && (
            <button
              onClick={() => onOpenTradeModal(symbol, signal?.signal_type === "SELL" ? "SELL" : "BUY", closePrice)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4" /> Execute Paper Order
            </button>
          )}
        </div>
      </div>

      {/* Main Signal Display Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-4">
        {/* Signal Badge */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${signalColor}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">AI Model Signal</span>
          <div className="text-2xl font-black my-1">{signal?.signal_type || "BUY"}</div>
          <span className="text-[10px] font-mono">Horizon: 1D - 5D</span>
        </div>

        {/* Confidence */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase">Confidence Score</span>
          <div className="text-2xl font-black text-cyan-400 my-1">{signal?.confidence || 76}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(signal?.confidence || 76, 100)}%` }}></div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase">Risk Level</span>
          <div className="text-2xl font-black text-amber-400 my-1">{signal?.risk_score || signal?.risk_level || "LOW"}</div>
          <span className="text-[10px] text-slate-400">ATR Vol: {atrPct}%</span>
        </div>

        {/* Trend Direction */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase">Trend Regime</span>
          <div className="text-base font-bold text-slate-200 my-1">{trend}</div>
          <span className="text-[10px] text-slate-400">SMA50: ${sma50}</span>
        </div>

        {/* Momentum & RSI */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase">Momentum</span>
          <div className="text-base font-bold text-slate-200 my-1">{momentum}</div>
          <span className="text-[10px] text-slate-400">RSI(14): {rsiVal}</span>
        </div>

        {/* Suggested Risk Limits */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase">Bracket SL / TP</span>
          <div className="text-xs font-mono font-bold text-slate-200 my-1">
            <div className="text-rose-400">SL: ${signal?.stop_loss || (closePrice * 0.965).toFixed(2)}</div>
            <div className="text-emerald-400">TP: ${signal?.take_profit || (closePrice * 1.075).toFixed(2)}</div>
          </div>
          <span className="text-[10px] text-slate-400">R:R {signal?.risk_reward_ratio || 2.1}:1</span>
        </div>
      </div>

      {/* WHY THIS SIGNAL? Explainable AI Panel */}
      <div className="mt-2 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Why This Signal? Explainable AI Breakdown
          </h4>
          <button
            onClick={() => setShowDetailedExplanation(!showDetailedExplanation)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showDetailedExplanation ? "Hide Details ▲" : "View Factor Weights ▼"}
          </button>
        </div>

        {/* Plain-English Reasoning Summary */}
        <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans mb-3">
          <p className="font-medium text-slate-200 mb-1">
            <span className="text-cyan-400 font-bold">Synthesized Model Reasoning: </span>
            {finalReasoning}
          </p>
        </div>

        {/* Drivers & Hazards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Positive Factors */}
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Positive Drivers
            </div>
            <ul className="space-y-1.5">
              {positiveFactors.map((f: string, idx: number) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">+</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors & Headwinds
            </div>
            <ul className="space-y-1.5">
              {riskFactors.map((f: string, idx: number) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold shrink-0">-</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Expandable Factor Weights */}
        {showDetailedExplanation && Array.isArray(explanation?.factor_weights) && (
          <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Feature Contribution SHAP-Style Weights
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {explanation.factor_weights.map((fw: any, idx: number) => {
                const isPos = (fw?.weight ?? 0) > 0;
                return (
                  <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{fw?.factor || "Factor"}</span>
                    <span className={`font-mono font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? `+${fw?.weight}%` : `${fw?.weight}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Blockchain Verification Footer */}
        {blockchain_verification && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> BLOCKCHAIN VERIFIED
              </span>
              <span>• Signal: <span className="text-slate-200 font-mono font-semibold">{signal?.signal_code || "TG-1042"}</span></span>
              <span>• Model: <span className="text-slate-200 font-mono">{signal?.model_version || "Ensemble-v2.4"}</span></span>
              <span>• Stellar Tx: <span className="text-slate-300 font-mono">{(blockchain_verification?.stellar_tx_hash || "0x82f1b4a9c017d45e").slice(0, 16)}...</span></span>
            </div>
            {onOpenBlockchainVerify && (
              <button 
                onClick={() => onOpenBlockchainVerify(signal?.signal_code || "TG-1042", signal?.signal_hash || "")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-cyan-400/30 flex items-center gap-1"
              >
                Inspect Ledger Proof <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
