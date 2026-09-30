"use client";

import React, { useState } from "react";

interface NewsArticleCardProps {
  article: any;
  onOpenDetail: (article: any) => void;
  onSelectSymbol?: (symbol: string) => void;
}

export function NewsArticleCard({ article, onOpenDetail, onSelectSymbol }: NewsArticleCardProps) {
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Time format: relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);
      if (diffSec < 60) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
      if (diffSec < 172800) return "Yesterday";
      return past.toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  const sentiment = article.sentiment || "NEUTRAL";
  const sentScore = article.sentiment_score ?? 0;
  const impact = article.importance || "MEDIUM";
  const impactScore = article.impact_score ?? 50;
  const relScore = article.relevance_score ?? 85;

  const getSentimentPill = (s: string) => {
    if (s === "POSITIVE") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (s === "NEGATIVE") return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  };

  const getImpactPill = (i: string) => {
    if (i === "CRITICAL") return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    if (i === "HIGH") return "text-orange-400 bg-orange-500/10 border-orange-500/30";
    if (i === "MEDIUM") return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  };

  return (
    <div className="relative group bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-950/20 flex flex-col justify-between space-y-4">
      {/* Top Metadata Row */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              {article.source || "NewsWire"}
            </span>
            <span
              className="text-slate-400 cursor-help"
              title={new Date(article.published_at).toLocaleString()}
            >
              {getRelativeTime(article.published_at)}
            </span>
            {article.is_demo && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                DEMO
              </span>
            )}
          </div>

          {article.is_breaking && (
            <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> BREAKING
            </span>
          )}
        </div>

        {/* Headline */}
        <h3
          onClick={() => onOpenDetail(article)}
          className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {article.title}
        </h3>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
      </div>

      {/* Associated Symbols Badges */}
      {article.symbols && article.symbols.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {article.symbols.slice(0, 4).map((sym: string) => (
            <button
              key={sym}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectSymbol) onSelectSymbol(sym);
              }}
              className="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700 transition-colors"
            >
              ${sym}
            </button>
          ))}
          {article.category && (
            <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-800">
              {article.category}
            </span>
          )}
        </div>
      )}

      {/* Analytics Scores Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800/80">
        {/* Sentiment */}
        <div className={`py-1.5 px-1 rounded-lg border ${getSentimentPill(sentiment)}`}>
          <div className="text-[10px] uppercase opacity-75 font-medium">Sentiment</div>
          <div className="font-bold text-[11px] truncate">
            {sentiment} {sentScore !== 0 && `(${sentScore >= 0 ? `+${sentScore.toFixed(1)}` : sentScore.toFixed(1)})`}
          </div>
        </div>

        {/* Impact */}
        <div className={`py-1.5 px-1 rounded-lg border ${getImpactPill(impact)}`}>
          <div className="text-[10px] uppercase opacity-75 font-medium">Impact</div>
          <div className="font-bold text-[11px] truncate">{impact} ({impactScore})</div>
        </div>

        {/* Relevance */}
        <div className="py-1.5 px-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          <div className="text-[10px] uppercase opacity-75 font-medium">Relevance</div>
          <div className="font-bold text-[11px]">{relScore}%</div>
        </div>
      </div>

      {/* Duplicate Sources Expander (Section 21) */}
      {article.duplicate_sources && article.duplicate_sources.length > 0 && (
        <div className="pt-1 text-[11px]">
          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <span>{showDuplicates ? "▼" : "▶"}</span>
            <span>{article.duplicate_sources.length} other source(s) reporting this event</span>
          </button>
          {showDuplicates && (
            <div className="mt-1.5 pl-3 border-l-2 border-slate-700 space-y-1 text-[11px]">
              {article.duplicate_sources.map((ds: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-slate-400">
                  <span>{ds.source}</span>
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Source ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <a
          href={article.source_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Read Original</span>
          <span>↗</span>
        </a>

        <button
          onClick={() => onOpenDetail(article)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/30"
        >
          <span>AI Summary</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
