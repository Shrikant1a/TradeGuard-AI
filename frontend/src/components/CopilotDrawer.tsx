"use client";
import React, { useState } from "react";
import { X, Send, Bot, User, Sparkles, Shield, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol?: string;
}

export function CopilotDrawer({
  isOpen,
  onClose,
  activeSymbol = "RELIANCE"
}: CopilotDrawerProps) {
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user', content: string }>>([
    {
      role: "assistant",
      content: `👋 Hello, I am **TradeGuard Copilot**—your context-aware AI trading intelligence assistant. I analyze multi-factor market signals, explain indicator drivers, verify blockchain audit proofs, and interpret pre-trade risk engine decisions.\n\n*Reminder: All insights are probabilistic estimates based on historical regimes and should not be construed as guaranteed returns.*`
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    `Why is ${activeSymbol} showing a BUY/HOLD signal?`,
    "What are the main risk factors right now?",
    "Why was my paper trade blocked by the risk policy?",
    "Show me my highest-risk portfolio position."
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    setInputQuery("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await api.chatWithCopilot(q, activeSymbol);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response || "No response received." }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Failed to fetch Copilot analysis: ${err.message}. Please verify the backend service is operational.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] glass-panel border-l border-cyan-500/30 bg-[#0a1020]/95 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              TradeGuard Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">Context: {activeSymbol}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Suggested Prompts</span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 p-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>TradeGuard Copilot is querying application signals and risk parameters...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about signals, risks, or blocked orders..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <span className="text-[10px] text-slate-500 block text-center mt-2">
          Model estimates only. Not fiduciary financial advice.
        </span>
      </div>
    </div>
  </>
);
}
