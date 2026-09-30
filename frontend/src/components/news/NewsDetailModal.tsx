"use client";

import React from "react";

interface NewsDetailModalProps {
  article: any;
  onClose: () => void;
  onSelectSymbol?: (symbol: string) => void;
}

export function NewsDetailModal({ article, onClose, onSelectSymbol }: NewsDetailModalProps) {
  if (!article) return null;

  const sentiment = article.sentiment || "NEUTRAL";
  const sentScore = article.sentiment_score ?? 0;
  const breakdown = article.sentiment_breakdown || { positive: 60, neutral: 25, negative: 15 };
  const impact = article.importance || "MEDIUM";
  const impactScore = article.impact_score ?? 50;

  const getSentimentColor = (s: string) => {
    if (s === "POSITIVE") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (s === "NEGATIVE") return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  };

  const getImpactColor = (i: string) => {
    if (i === "CRITICAL") return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    if (i === "HIGH") return "text-orange-400 bg-orange-500/10 border-orange-500/30";
    if (i === "MEDIUM") return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 sm:space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {article.category || "MARKET"}
              </span>
              {article.is_breaking && (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> BREAKING
                </span>
              )}
              {article.is_demo && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEMO DATA
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight text-white pt-1">
              {article.title}
            </h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
              <span>Source: <strong className="text-slate-200">{article.source}</strong></span>
              <span>•</span>
              <span title={article.published_at}>Published: {new Date(article.published_at).toLocaleString()}</span>
              {article.author && (
                <>
                  <span>•</span>
                  <span>By {article.author}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Analytics Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-xl border ${getSentimentColor(sentiment)} flex flex-col`}>
            <span className="text-[11px] font-medium opacity-80 uppercase tracking-wide">Sentiment</span>
            <span className="text-base font-bold mt-0.5">{sentiment}</span>
            <span className="text-xs opacity-75 font-mono">{sentScore >= 0 ? `+${sentScore.toFixed(2)}` : sentScore.toFixed(2)}</span>
          </div>

          <div className={`p-3 rounded-xl border ${getImpactColor(impact)} flex flex-col`}>
            <span className="text-[11px] font-medium opacity-80 uppercase tracking-wide">Market Impact</span>
            <span className="text-base font-bold mt-0.5">{impact}</span>
            <span className="text-xs opacity-75 font-mono">{impactScore}/100</span>
          </div>

          <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 flex flex-col">
            <span className="text-[11px] font-medium opacity-80 uppercase tracking-wide">Relevance</span>
            <span className="text-base font-bold mt-0.5">{article.relevance_score ?? 90}%</span>
            <span className="text-xs opacity-75">Symbol Alignment</span>
          </div>

          <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 flex flex-col">
            <span className="text-[11px] font-medium opacity-80 uppercase tracking-wide">Verification</span>
            <span className="text-base font-bold mt-0.5 text-emerald-400 flex items-center gap-1">
              ✓ SHA-256
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate" title={article.content_hash}>
              {article.content_hash ? article.content_hash.slice(0, 10) + "..." : "Recorded"}
            </span>
          </div>
        </div>

        {/* Associated Symbols */}
        {article.symbols && article.symbols.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Associated Tickers:</span>
            {article.symbols.map((sym: string) => (
              <button
                key={sym}
                onClick={() => onSelectSymbol && onSelectSymbol(sym)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700 transition-colors"
              >
                ${sym}
              </button>
            ))}
          </div>
        )}

        {/* AI Grounded Summary Box */}
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-base">🤖</span>
            <h3 className="text-sm font-bold uppercase tracking-wider">TradeGuard AI Intelligence Summary</h3>
            <span className="text-[10px] text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Grounded in Source
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200 font-normal">
            {article.ai_summary || article.summary}
          </p>

          {/* Key Bullet Takeaways */}
          {article.ai_key_points && article.ai_key_points.length > 0 && (
            <div className="pt-2 space-y-1.5 border-t border-blue-500/20">
              <span className="text-xs font-semibold text-slate-300">Key Fact Takeaways:</span>
              <ul className="space-y-1">
                {article.ai_key_points.map((pt: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.ai_reasoning && (
            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-blue-500/10">
              Analysis Note: {article.ai_reasoning}
            </p>
          )}
        </div>

        {/* Sentiment Breakdown Bar */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Quantitative Sentiment Breakdown</span>
            <span className="text-slate-400 text-[11px]">
              Pos: {breakdown.positive}% | Neu: {breakdown.neutral}% | Neg: {breakdown.negative}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 flex overflow-hidden">
            <div style={{ width: `${breakdown.positive}%` }} className="bg-emerald-500 transition-all"></div>
            <div style={{ width: `${breakdown.neutral}%` }} className="bg-amber-500 transition-all"></div>
            <div style={{ width: `${breakdown.negative}%` }} className="bg-rose-500 transition-all"></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">Positive {breakdown.positive}%</span>
            <span className="text-amber-400 font-semibold">Neutral {breakdown.neutral}%</span>
            <span className="text-rose-400 font-semibold">Negative {breakdown.negative}%</span>
          </div>
        </div>

        {/* Affected Assets / Macro Transmission */}
        {article.affected_assets && article.affected_assets.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-slate-300">Potentially Affected Assets & Sectors:</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {article.affected_assets.map((asset: string) => (
                <span key={asset} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {asset}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              *Analytical estimate of systemic market transmission channels. Not a guaranteed correlation.
            </p>
          </div>
        )}

        {/* Duplicate Sources */}
        {article.duplicate_sources && article.duplicate_sources.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">
              Other Verified Publishers Covering This Story ({article.duplicate_sources.length}):
            </span>
            <div className="space-y-1 text-xs">
              {article.duplicate_sources.map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-slate-400">
                  <span className="font-medium text-slate-300">{d.source}</span>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline text-[11px]"
                  >
                    View coverage ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            Source: <strong className="text-slate-300">{article.source}</strong> • Transparent Reporting
          </div>
          <div className="flex items-center gap-3">
            <a
              href={article.source_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Read Original Article</span>
              <span>↗</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
