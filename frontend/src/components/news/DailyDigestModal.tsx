"use client";

import React, { useState } from "react";

interface DailyDigestModalProps {
  digest: any;
  onClose: () => void;
  onRefresh?: () => void;
  isGenerating?: boolean;
}

export function DailyDigestModal({ digest, onClose, onRefresh, isGenerating }: DailyDigestModalProps) {
  const [copied, setCopied] = useState(false);

  if (!digest) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(digest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(digest, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TradeGuard_Daily_Digest_${digest.date.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 sm:space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                DAILY MARKET INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {digest.date} ({digest.generated_at})
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              TradeGuard AI Daily Market Digest
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic multi-factor market intelligence brief. All key conclusions link to verified publications.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sector Overview Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>🌐</span> Market Overview by Sector
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(digest.market_overview || {}).map(([sec, text]: [string, any]) => (
              <div key={sec} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                  {sec.replace(/_/g, " ")}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Market Events */}
        {digest.top_market_events && digest.top_market_events.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Top Market Events
            </h3>
            <div className="space-y-2">
              {digest.top_market_events.map((evt: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{evt.headline}</span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Source: <strong className="text-slate-300">{evt.source}</strong></span>
                      <span>•</span>
                      <span>Sentiment: <strong className={evt.sentiment === "POSITIVE" ? "text-emerald-400" : "text-amber-400"}>{evt.sentiment}</strong></span>
                      <span>•</span>
                      <span>Impact: <strong className="text-orange-400">{evt.impact}</strong></span>
                    </div>
                  </div>
                  <a
                    href={evt.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded-lg border border-blue-500/20 whitespace-nowrap"
                  >
                    Source ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Stock News */}
        {digest.top_stock_news && digest.top_stock_news.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>📊</span> Top Stock Headlines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {digest.top_stock_news.map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-400">${item.symbol}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.sentiment === "POSITIVE" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{item.headline}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Risks */}
        {digest.market_risks && digest.market_risks.length > 0 && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> Identified Market Risks & Tail Hazards
            </h3>
            <ul className="space-y-1 text-xs text-slate-300">
              {digest.market_risks.map((risk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions & Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isGenerating}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Regenerating..." : "↻ Refresh Digest"}
              </button>
            )}
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? "✓ Copied JSON" : "Copy JSON"}
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-colors"
            >
              📥 Download Report
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
          >
            Close Digest
          </button>
        </div>
      </div>
    </div>
  );
}
