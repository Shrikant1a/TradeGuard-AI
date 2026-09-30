"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface NewsAlertsModalProps {
  onClose: () => void;
}

export function NewsAlertsModal({ onClose }: NewsAlertsModalProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [symbol, setSymbol] = useState("AAPL");
  const [minImpact, setMinImpact] = useState(70);
  const [sentiment, setSentiment] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await api.getNewsAlerts();
      setAlerts(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;
    setSubmitting(true);
    try {
      await api.createNewsAlert({
        symbol: symbol.toUpperCase(),
        min_impact: minImpact,
        sentiment_filter: sentiment
      });
      await loadAlerts();
      setSymbol("");
    } catch (e) {
      console.error("Failed to create alert:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteNewsAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (e) {
      console.error("Failed to delete alert:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 sm:space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <div>
              <h2 className="text-lg font-bold text-white">News Intelligence Alerts</h2>
              <p className="text-xs text-slate-400">Configure notifications for market-moving headline events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="space-y-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Create New Market Impact Alert
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Asset Symbol</label>
              <input
                type="text"
                placeholder="e.g. AAPL, NVDA, TSLA"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Min Impact Score: {minImpact}
              </label>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={minImpact}
                onChange={(e) => setMinImpact(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Sentiment Filter</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {["ALL", "POSITIVE", "NEGATIVE"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSentiment(s)}
                  className={`py-1.5 rounded-lg border font-semibold transition-colors ${
                    sentiment === s
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "+ Add News Alert"}
          </button>
        </form>

        {/* Existing Alerts */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Configured Alerts ({alerts.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">${a.symbol}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Impact &gt; {a.min_impact}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {a.sentiment_filter || "ALL"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
