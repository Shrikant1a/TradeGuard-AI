"use client";

import React, { useState } from "react";
import { 
  BookOpen, Sparkles, Zap, Shield, Wallet, Cpu, 
  Binary, History, Link2, Bot, ArrowRight, CheckCircle2, 
  AlertTriangle, ChevronDown, ChevronUp, Search, Sliders, 
  TrendingUp, Play, Layers
} from "lucide-react";

interface HowToUseGuideProps {
  onNavigateTab: (tabId: string) => void;
  onOpenTradeModal: () => void;
}

export function HowToUseGuide({ onNavigateTab, onOpenTradeModal }: HowToUseGuideProps) {
  const [activeSection, setActiveSection] = useState<string>("quickstart");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const sections = [
    {
      id: "quickstart",
      title: "1. Quickstart & Navigation",
      icon: Sparkles,
      tag: "BASICS",
      summary: "How to navigate the terminal, use the live ticker tape, and search any stock or cryptocurrency."
    },
    {
      id: "signals",
      title: "2. Understanding AI Signals",
      icon: Zap,
      tag: "AI LOGIC",
      summary: "How our machine-learning ensemble predicts market directions with calibrated confidence."
    },
    {
      id: "papertrading",
      title: "3. Safe Virtual Paper Trading",
      icon: Wallet,
      tag: "PRACTICE",
      summary: "How to buy and sell using virtual ₹10,00,000 capital without risking real money."
    },
    {
      id: "risk",
      title: "4. Institutional Risk Gatekeeper",
      icon: Shield,
      tag: "PROTECTION",
      summary: "The 5 safety rules that automatically protect your capital and block reckless trades."
    },
    {
      id: "backtest",
      title: "5. Historical Backtesting",
      icon: History,
      tag: "QUANT",
      summary: "How to simulate multi-year AI strategies accounting for slippage and commissions."
    },
    {
      id: "blockchain",
      title: "6. Stellar Blockchain Proof",
      icon: Link2,
      tag: "VERIFICATION",
      summary: "Why signals are inscribed on the Stellar Soroban blockchain to prevent hindsight cheating."
    },
    {
      id: "bot",
      title: "7. TradingView Bot & Webhooks",
      icon: Layers,
      tag: "AUTOMATION",
      summary: "How to connect the included Pine Script v5 strategy for automated alerts."
    },
    {
      id: "copilot",
      title: "8. Asking the AI Copilot",
      icon: Bot,
      tag: "ASSISTANT",
      summary: "How to chat with your conversational trading assistant for market and risk advice."
    },
  ];

  const faqs = [
    {
      q: "Does TradeGuard AI use real money?",
      a: "No! TradeGuard AI is strictly designed for research, strategy testing, and simulated paper trading. You are given ₹10,00,000 (INR) in virtual demo capital to practice freely without any financial risk."
    },
    {
      q: "How do I change the stock or cryptocurrency being analyzed?",
      a: "You have 3 easy ways: 1) Click any stock pill (e.g. AAPL, NVDA, TSLA, BTC-USD) in the AI Stock Analyzer header. 2) Click the dropdown menu next to the stock name. 3) Type any ticker in the top search bar and press Enter."
    },
    {
      q: "Why was my paper trade rejected or blocked by the Risk Engine?",
      a: "TradeGuard AI has an active Risk Gatekeeper. Your order will be blocked if: 1) You did not set a Stop-Loss. 2) The total dollar risk on the trade exceeds 1.0% of your account capital (₹10,000). 3) Total open exposure exceeds 40%. 4) The Emergency Circuit Breaker is turned ON."
    },
    {
      q: "What is the difference between Bullish, Bearish, and Neutral signals?",
      a: "• Bullish (BUY): The AI model calculates a high probability of upward price movement over the next 5 days.\n• Bearish (SELL): The model estimates a downward price move.\n• Neutral (HOLD): Market conditions are choppy or uncertain, so capital preservation is advised."
    },
    {
      q: "What does 'Stellar Soroban Verified' mean?",
      a: "Most trading bots alter their historical records to pretend they made winning calls. TradeGuard AI hashes every trade signal using SHA-256 and writes cryptographic proof to the public Stellar Soroban smart contract ledger the moment it is generated, proving zero hindsight bias."
    },
    {
      q: "How can I reset my virtual balance back to ₹10,00,000?",
      a: "Click on 'User Profile' in the left menu, then click the red 'Reset Virtual Paper Balance to ₹10,00,000' button to start fresh anytime."
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Header Welcome Banner ── */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-[#0a142c] to-slate-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Platform User Manual</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight font-logo">
            HOW TO USE <span className="text-cyan-400">TRADEGUARD AI</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Welcome to TradeGuard AI! This interactive step-by-step guide explains how to analyze markets, 
            interpret calibrated AI signals, practice with virtual paper money, and verify records on the Stellar blockchain.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab("scanner")}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Binary className="w-3.5 h-3.5" />
              Explore Market Scanner
            </button>
            <button
              onClick={onOpenTradeModal}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              Try Virtual Paper Trade
            </button>
            <button
              onClick={() => onNavigateTab("dashboard")}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold"
            >
              Back to Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* ── Step-by-Step Interactive Guide ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2 font-mono flex items-center justify-between">
            <span>Guide Topics</span>
            <span className="text-cyan-400 font-bold">8 Chapters</span>
          </div>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg shadow-cyan-950/40"
                    : "glass-panel border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isCurrent ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{sec.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/60 font-mono text-cyan-400 font-bold">
                      {sec.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sec.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Topic Content */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 min-h-[500px]">
            {/* Section 1: Quickstart */}
            {activeSection === "quickstart" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Chapter 1: The Basics
                </div>
                <h2 className="text-xl font-bold text-slate-100">Navigating the Terminal & Switching Stocks</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">1</span>
                      Live Streaming Price Ticker
                    </h3>
                    <p>
                      At the top of your screen, the <strong>continuous auto-moving ticker tape</strong> shows real-time quotes, 
                      net points change, and percentages for major assets (Apple, NVIDIA, Tesla, Bitcoin, Ethereum, Reliance, TCS, Gold).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">2</span>
                      How to Change or Search Any Stock
                    </h3>
                    <p>
                      You are never limited to one stock. You can switch assets at any time:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                      <li><strong>Click on the Top Search Bar:</strong> An instant dropdown appears with popular stocks & cryptos.</li>
                      <li><strong>Type Any Ticker:</strong> Type e.g. <code className="text-cyan-300 font-mono">NVDA</code>, <code className="text-cyan-300 font-mono">TSLA</code>, or <code className="text-cyan-300 font-mono">BTC-USD</code> and press Enter.</li>
                      <li><strong>One-Click Stock Switcher Pills:</strong> In the <em>AI Stock Analyzer</em>, click the pill buttons (<code className="text-cyan-300 font-mono">[AAPL] [NVDA] [TSLA]</code>) to jump between assets immediately.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">3</span>
                      The 16 Terminal Views
                    </h3>
                    <p>
                      Use the left menu to explore:
                      <strong> Dashboard</strong>, <strong>News Intelligence</strong>, <strong>Market Scanner</strong>, <strong>Stock Analyzer</strong>, <strong>TradingView Charts</strong>, <strong>AI Signals</strong>, <strong>Paper Trading</strong>, <strong>Portfolio</strong>, <strong>Backtesting</strong>, and <strong>Blockchain Audit</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setActiveSection("signals")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 ml-auto"
                  >
                    Next: AI Signals & XAI <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: AI Signals */}
            {activeSection === "signals" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4" /> Chapter 2: Artificial Intelligence
                </div>
                <h2 className="text-xl font-bold text-slate-100">How to Read AI Signals & Explanations</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    TradeGuard AI uses walk-forward machine learning ensembles (Logistic Regression, Random Forest, Gradient Boosting) 
                    trained on historical price action, momentum, moving average crosses, and volatility.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold text-xs uppercase block">BULLISH (BUY)</span>
                      <p className="text-[11px] text-slate-300 mt-1">High probability of upward expansion. Momentum indicators and moving averages align positively.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <span className="text-amber-400 font-bold text-xs uppercase block">NEUTRAL (HOLD)</span>
                      <p className="text-[11px] text-slate-300 mt-1">Market is consolidating in a range. Risk/reward ratio is not favorable for entering new trades.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <span className="text-rose-400 font-bold text-xs uppercase block">BEARISH (SELL)</span>
                      <p className="text-[11px] text-slate-300 mt-1">Downside pressure detected. High probability of price retesting lower support levels.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm">Explainable AI (XAI) — "Why This Signal?"</h3>
                    <p>
                      Never trust a black box. On the dashboard banner, click <strong>"Why This Signal?"</strong> to see the exact mathematical drivers:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                      <li><strong>Moving Average Regimes:</strong> EMA 20 above EMA 50 (Golden Trend).</li>
                      <li><strong>RSI Momentum:</strong> Oversold bounce (&lt;35) or Overbought exhaustion (&gt;70).</li>
                      <li><strong>ATR Volatility Brackets:</strong> Dynamically calculates Stop-Loss (1.5x ATR) and Take-Profit (2.5x ATR).</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("quickstart")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("papertrading")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Next: Virtual Paper Trading <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 3: Paper Trading */}
            {activeSection === "papertrading" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Wallet className="w-4 h-4" /> Chapter 3: Safe Practice
                </div>
                <h2 className="text-xl font-bold text-slate-100">Step-by-Step: Placing a Virtual Paper Trade</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider block">Your Starting Capital</span>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">₹10,00,000 INR (Virtual)</div>
                    </div>
                    <button
                      onClick={onOpenTradeModal}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Open Order Window
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <h3 className="font-bold text-slate-200 text-sm">How to Execute a Simulated Trade:</h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                      <li>Click the cyan <strong>"Place Paper Order"</strong> button on any asset.</li>
                      <li>Choose your side: <strong className="text-emerald-400">BUY (Long)</strong> or <strong className="text-rose-400">SELL (Short)</strong>.</li>
                      <li>Enter the <strong>Quantity</strong> of shares.</li>
                      <li>Review the <strong>Stop-Loss (SL)</strong> and <strong>Take-Profit (TP)</strong> levels (automatically calculated from ATR).</li>
                      <li>Check the Risk Summary: the system calculates your maximum potential loss. If it is within 1% (₹10,000), it will approve your order.</li>
                      <li>Click <strong>"Submit Order"</strong> — your position is instantly executed at the current price and recorded in your Portfolio.</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("signals")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("risk")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Next: Risk Gatekeeper <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 4: Risk Rules */}
            {activeSection === "risk" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Shield className="w-4 h-4" /> Chapter 4: Risk Management
                </div>
                <h2 className="text-xl font-bold text-slate-100">The 5 Cardinal Institutional Safety Rules</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    In real hedge funds, risk management takes precedence over signal accuracy. 
                    TradeGuard AI enforces 5 hard rules:
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">1</div>
                      <div>
                        <strong className="text-slate-100 text-xs">Max 1.0% Capital Risk Per Trade:</strong>
                        <span className="text-slate-400 block mt-0.5">You can never risk losing more than ₹10,000 on a single trade. If an order risks more, the system blocks it.</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">2</div>
                      <div>
                        <strong className="text-slate-100 text-xs">Mandatory Stop-Loss Protection:</strong>
                        <span className="text-slate-400 block mt-0.5">Every order must have a defined stop-loss. Unhedged trades are automatically rejected.</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">3</div>
                      <div>
                        <strong className="text-slate-100 text-xs">40% Total Portfolio Exposure Cap:</strong>
                        <span className="text-slate-400 block mt-0.5">The combined value of all your active holdings cannot exceed 40% of your account equity.</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-xs">4</div>
                      <div>
                        <strong className="text-slate-100 text-xs">Max 5 Open Positions:</strong>
                        <span className="text-slate-400 block mt-0.5">Prevents over-diversification and ensures you keep capital concentrated in the highest-probability setups.</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 text-xs">5</div>
                      <div>
                        <strong className="text-rose-300 text-xs">Emergency Circuit Breaker:</strong>
                        <span className="text-slate-300 block mt-0.5">In the top bar, toggling the Circuit Breaker ON immediately halts all new order execution during extreme market volatility.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("papertrading")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("backtest")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Next: Backtesting <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 5: Backtesting */}
            {activeSection === "backtest" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <History className="w-4 h-4" /> Chapter 5: Quantitative Simulation
                </div>
                <h2 className="text-xl font-bold text-slate-100">How to Backtest an AI Strategy</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Backtesting lets you travel back in time to simulate how an AI strategy would have performed over the last 1 to 5 years.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm">Key Backtest Metrics Explained:</h3>
                    <ul className="space-y-2 text-slate-400 pl-1">
                      <li><strong>Total Return (%):</strong> The overall percentage gain or loss generated over the backtest period.</li>
                      <li><strong>Sharpe Ratio:</strong> Measures risk-adjusted return. A Sharpe ratio above 1.5 indicates a high-performance strategy.</li>
                      <li><strong>Maximum Drawdown (MDD %):</strong> The largest peak-to-trough drop in account equity. Lower is safer.</li>
                      <li><strong>Profit Factor:</strong> Gross Profits divided by Gross Losses. A value above 1.75 indicates consistent profitability.</li>
                      <li><strong>Realistic Friction:</strong> TradeGuard simulations factor in 0.05% slippage and 0.03% broker fees per trade.</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => onNavigateTab("backtesting")}
                    className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <History className="w-4 h-4" />
                    Open Backtesting Terminal Now
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("risk")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("blockchain")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Next: Stellar Blockchain <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 6: Blockchain */}
            {activeSection === "blockchain" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Link2 className="w-4 h-4" /> Chapter 6: Trust & Verification
                </div>
                <h2 className="text-xl font-bold text-slate-100">Why Stellar Soroban Blockchain?</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    In the trading industry, many signal providers delete bad predictions and cherry-pick winning calls in hindsight. 
                    TradeGuard AI solves this forever using smart contracts:
                  </p>

                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <h3 className="font-bold text-purple-300 text-sm">How Cryptographic Verification Works:</h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                      <li>The AI Engine computes indicators and generates a signal at timestamp <code className="text-purple-300 font-mono">T</code>.</li>
                      <li>A cryptographic <strong>SHA-256 hash</strong> of the signal payload is generated immediately.</li>
                      <li>The hash and model version are inscribed on the <strong>Stellar Soroban</strong> smart contract ledger.</li>
                      <li>Because blockchains are immutable, nobody can alter or backdate a signal after the price moves.</li>
                    </ol>
                  </div>

                  <p className="text-slate-400">
                    To audit any signal: go to the <strong>Blockchain Audit</strong> tab and click <strong>"Verify Proof"</strong> to see the exact cryptographic seal.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("backtest")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("bot")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Next: TradingView Bot <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 7: TradingView Bot */}
            {activeSection === "bot" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Layers className="w-4 h-4" /> Chapter 7: Automated Trading
                </div>
                <h2 className="text-xl font-bold text-slate-100">Connecting the TradingView Pine Script Bot</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    TradeGuard AI includes a complete production-grade <strong>Pine Script v5 strategy</strong> located in:
                    <br />
                    <code className="text-cyan-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      pinescript/TradeGuard_AI_Strategy.pine
                    </code>
                  </p>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm">3 Steps to Automate Webhook Alerts:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-400 pl-1">
                      <li>Copy the script into TradingView's <strong>Pine Editor</strong> and click <strong>"Add to chart"</strong>.</li>
                      <li>Click the Clock icon in TradingView to create an Alert on the TradeGuard Strategy.</li>
                      <li>Check <strong>"Webhook URL"</strong> and enter:
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 mt-1 select-all">
                          https://your-domain/api/webhooks/tradingview
                        </div>
                      </li>
                    </ol>
                  </div>

                  <p className="text-slate-400">
                    When TradingView fires an alert, TradeGuard AI automatically parses the webhook, runs pre-trade risk checks, 
                    logs the alert in the Alerts Hub, and writes the SHA-256 record to Stellar.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("blockchain")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("copilot")}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Next: AI Copilot <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 8: AI Copilot */}
            {activeSection === "copilot" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Bot className="w-4 h-4" /> Chapter 8: AI Assistant
                </div>
                <h2 className="text-xl font-bold text-slate-100">Interacting with the AI Copilot</h2>
                
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    TradeGuard includes a conversational trading assistant that understands real-time market data, 
                    your open positions, and your risk limits.
                  </p>

                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                    <h3 className="font-bold text-cyan-300 text-sm">Example Questions You Can Ask:</h3>
                    <div className="space-y-1.5">
                      <div className="p-2 rounded bg-slate-900/80 text-slate-200 font-mono text-[11px]">
                        "Why is AAPL showing a Bullish signal today?"
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 text-slate-200 font-mono text-[11px]">
                        "Is my portfolio risk within the 40% exposure policy?"
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 text-slate-200 font-mono text-[11px]">
                        "Why was my paper order rejected by the Risk Engine?"
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400">
                    To start chatting, click the floating <strong>AI Copilot</strong> button at the bottom-right corner of any page.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button onClick={() => setActiveSection("bot")} className="text-xs text-slate-400 hover:text-white">← Previous</button>
                  <button
                    onClick={() => setActiveSection("quickstart")}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  >
                    Back to Chapter 1
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Frequently Asked Questions (FAQ) Accordion ── */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Frequently Asked Questions (FAQ)</h2>
        </div>
        <p className="text-xs text-slate-400">
          Click any question below for simple, straightforward answers.
        </p>

        <div className="space-y-2.5 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="font-bold text-xs text-slate-200 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 font-sans whitespace-pre-line bg-slate-950/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
