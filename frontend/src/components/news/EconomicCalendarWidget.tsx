"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function EconomicCalendarWidget() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await api.getEconomicCalendar();
        setEvents(data);
      } catch (e) {
        console.error("Failed to load economic calendar:", e);
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, []);

  const getImpactBadge = (impact: string) => {
    if (impact === "HIGH") return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    if (impact === "MEDIUM") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-400 text-xs animate-pulse">Loading Economic Calendar...</div>;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>📅</span> Institutional Economic Calendar
          </h3>
          <p className="text-xs text-slate-400">
            Macroeconomic releases and transmission channels across asset classes
          </p>
        </div>
        <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
          Live Central Bank Schedule
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <th className="pb-2.5">Event</th>
              <th className="pb-2.5">Date & Time</th>
              <th className="pb-2.5">Expected</th>
              <th className="pb-2.5">Previous</th>
              <th className="pb-2.5">Actual</th>
              <th className="pb-2.5">Impact</th>
              <th className="pb-2.5">Potentially Affected Assets</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {events.map((evt) => (
              <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-4 font-semibold text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {evt.country}
                    </span>
                    <span>{evt.event}</span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-slate-400 whitespace-nowrap">
                  {evt.date} • {evt.time}
                </td>
                <td className="py-3 pr-3 font-mono">{evt.expected}</td>
                <td className="py-3 pr-3 font-mono text-slate-400">{evt.previous}</td>
                <td className="py-3 pr-3 font-mono font-bold text-emerald-400">
                  {evt.actual}
                </td>
                <td className="py-3 pr-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getImpactBadge(evt.impact)}`}>
                    {evt.impact}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {(evt.affected_assets || []).map((asset: string) => (
                      <span key={asset} className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {asset}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 pt-1 italic">
        *Disclaimer: Analytical transmission estimates. Actual market volatility varies based on surprise deviations.
      </p>
    </div>
  );
}
