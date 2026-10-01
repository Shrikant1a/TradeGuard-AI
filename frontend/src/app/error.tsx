"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Shield } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TradeGuard AI caught application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#0b1329] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">
          <Shield className="w-3.5 h-3.5" />
          TradeGuard AI Terminal
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
          Terminal Status Notice
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          The workstation encountered an unexpected condition. Your paper portfolio, active orders, and models remain completely secure.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Workspace
          </button>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
