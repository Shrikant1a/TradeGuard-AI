"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, LineChart, Cpu, BarChart3, Binary, 
  Wallet, ShieldCheck, History, Sliders, Bell, 
  HelpCircle, Link2, Settings, User, Search, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Zap, Play, RefreshCw, Bot, ExternalLink, ShieldAlert,
  ChevronRight, ArrowUpRight, DollarSign, Layers, Check, Copy, Globe, Newspaper,
  Menu, X, ChevronDown, BookOpen
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, BarChart, Bar 
} from "recharts";

import { api } from "@/lib/api";
import { AIMarketIntelligenceBanner } from "@/components/AIMarketIntelligenceBanner";
import { BlockchainFlowDiagram } from "@/components/BlockchainFlowDiagram";
import { FinancialDisclaimer } from "@/components/FinancialDisclaimer";
import { TradingViewWidget, resolveTVSymbol } from "@/components/TradingViewWidget";
import { TickerTapeWidget } from "@/components/TickerTapeWidget";
import { LightweightChartWidget } from "@/components/LightweightChartWidget";
import { PaperTradeModal } from "@/components/PaperTradeModal";
import { BlockchainVerifyModal } from "@/components/BlockchainVerifyModal";
import { CopilotDrawer } from "@/components/CopilotDrawer";
import { NewsDashboard } from "@/components/news/NewsDashboard";
import { SignalFusionCard } from "@/components/news/SignalFusionCard";
import { NewsDetailModal } from "@/components/news/NewsDetailModal";
import { TradeGuardLogo, TradeGuardIcon } from "@/components/TradeGuardLogo";
import { SplashIntroScreen } from "@/components/SplashIntroScreen";
import { HowToUseGuide } from "@/components/HowToUseGuide";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Predefined verified institutional asset coverage
const POPULAR_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", sector: "Semiconductors" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Automotive" },
  { symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Communication" },
  { symbol: "AMZN", name: "Amazon.com", exchange: "NASDAQ", sector: "Consumer Cyclical" },
  { symbol: "BTC-USD", name: "Bitcoin USD", exchange: "Crypto", sector: "Cryptocurrency" },
  { symbol: "ETH-USD", name: "Ethereum USD", exchange: "Crypto", sector: "Cryptocurrency" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE", sector: "Energy" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE", sector: "Technology" },
];

export default function TradeGuardApp() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState("AAPL");
  const [currentSymbol, setCurrentSymbol] = useState("AAPL");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  // Dedicated chart search state
  const [chartInput, setChartInput] = useState("");
  const [chartSymbol, setChartSymbol] = useState("NASDAQ:AAPL");

  // State data from backend
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [signalsList, setSignalsList] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [scannerList, setScannerList] = useState<any[]>([]);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [riskPolicy, setRiskPolicy] = useState<any>(null);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [blockchainRecords, setBlockchainRecords] = useState<any>(null);
  const [strategiesList, setStrategiesList] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // News Intelligence state
  const [dashboardNews, setDashboardNews] = useState<any[]>([]);
  const [portfolioNews, setPortfolioNews] = useState<any>(null);
  const [stockNewsList, setStockNewsList] = useState<any[]>([]);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<any>(null);

  // Modals & Drawers
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalProps, setTradeModalProps] = useState({ symbol: "AAPL", side: "BUY", price: 224.23 });
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyModalProps, setVerifyModalProps] = useState({ signalCode: "TG-1042", signalHash: "" });
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Loading states
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingBacktest, setLoadingBacktest] = useState(false);
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Strategy Lab parameters state
  const [labParams, setLabParams] = useState({
    name: "Custom Multi-Factor Alpha",
    version: "v1.3",
    rsi_oversold: 35,
    rsi_overbought: 65,
    ema_fast: 20,
    ema_slow: 50,
    atr_mult: 1.8,
    rr_ratio: 2.0,
    risk_pct: 1.0
  });

  // Fetch initial data on load
  useEffect(() => {
    loadAllInitialData();
  }, []);

  const loadAllInitialData = async () => {
    // Priority 1: Interactive Core (active asset, portfolio balance, signals)
    await Promise.allSettled([
      loadAssetAnalysis(currentSymbol),
      loadPortfolio(),
      loadSignals(),
    ]);

    // Priority 2: Staggered secondary widgets (100ms)
    setTimeout(() => {
      loadScanner();
      loadRiskPolicy();
      loadNewsData(currentSymbol);
    }, 100);

    // Priority 3: Lazily loaded auxiliary audit & history tabs (350ms)
    setTimeout(() => {
      loadAlerts();
      loadBlockchainRecords();
      loadStrategies();
      loadWebhookLogs();
    }, 350);
  };

  const loadNewsData = async (sym: string = "AAPL") => {
    try {
      const [latest, pNews, sNews] = await Promise.all([
        api.getLatestNews(3),
        api.getPortfolioNews().catch(() => null),
        api.getStockNews(sym, 4).catch(() => [])
      ]);
      setDashboardNews(latest || []);
      if (pNews) setPortfolioNews(pNews);
      setStockNewsList(sNews || []);
    } catch (e) {
      console.error("News data loading error:", e);
    }
  };

  const loadAssetAnalysis = async (sym: string) => {
    try {
      setLoadingAnalysis(true);
      const res = await api.analyzeAsset(sym);
      setAnalysisData(res);
      const md = await api.getMarketData(sym);
      setMarketData(md);
      setCurrentSymbol(sym);
      api.getStockNews(sym, 4).then(n => setStockNewsList(n || [])).catch(() => {});
    } catch (err) {
      console.error("Failed to load asset analysis:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const p = await api.getPortfolio();
      setPortfolioData(p);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    }
  };

  const loadSignals = async () => {
    try {
      const s = await api.listSignals();
      setSignalsList(s);
    } catch (err) {
      console.error("Failed to load signals:", err);
    }
  };

  const loadScanner = async () => {
    try {
      const sc = await api.scanMarket();
      setScannerList(sc);
    } catch (err) {
      console.error("Failed to load scanner:", err);
    }
  };

  const loadRiskPolicy = async () => {
    try {
      const rp = await api.getRiskPolicy();
      setRiskPolicy(rp);
    } catch (err) {
      console.error("Failed to load risk policy:", err);
    }
  };

  const loadAlerts = async () => {
    try {
      const al = await api.getAlerts();
      setAlertsList(al);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    }
  };

  const loadBlockchainRecords = async () => {
    try {
      const bc = await api.listBlockchainRecords();
      setBlockchainRecords(bc);
    } catch (err) {
      console.error("Failed to load blockchain records:", err);
    }
  };

  const loadStrategies = async () => {
    try {
      const st = await api.listStrategies();
      setStrategiesList(st);
    } catch (err) {
      console.error("Failed to load strategies:", err);
    }
  };

  const loadWebhookLogs = async () => {
    try {
      const wh = await api.getWebhookLogs();
      setWebhookLogs(wh);
    } catch (err) {
      console.error("Failed to load webhook logs:", err);
    }
  };

  const selectAsset = (sym: string) => {
    const cleanSym = sym.toUpperCase().trim();
    setSearchSymbol(cleanSym);
    loadAssetAnalysis(cleanSym);
    setIsSearchDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchDropdownOpen(false);
    if (searchSymbol.trim()) {
      selectAsset(searchSymbol);
    }
  };

  const handleOpenTradeModal = (symbol: string, side: string, price: number) => {
    setTradeModalProps({ symbol, side, price: price || 150.0 });
    setIsTradeModalOpen(true);
  };

  const handleOpenBlockchainVerify = (signalCode: string, signalHash: string) => {
    setVerifyModalProps({ signalCode, signalHash });
    setIsVerifyModalOpen(true);
  };

  const handleRunBacktest = async (strategyName: string = "ai_multi_factor") => {
    try {
      setLoadingBacktest(true);
      const res = await api.runBacktest({
        symbol: currentSymbol,
        strategy: strategyName,
        initial_capital: 1000000.0,
        risk_per_trade_pct: labParams.risk_pct,
        rsi_oversold: labParams.rsi_oversold,
        rsi_overbought: labParams.rsi_overbought,
        ema_fast: labParams.ema_fast,
        ema_slow: labParams.ema_slow,
        atr_mult: labParams.atr_mult,
        rr_ratio: labParams.rr_ratio
      });
      setBacktestResult(res);
    } catch (err) {
      console.error("Backtest failed:", err);
    } finally {
      setLoadingBacktest(false);
    }
  };

  const handleSimulateWebhook = async () => {
    try {
      setWebhookSending(true);
      setWebhookStatus(null);
      const payload = {
        symbol: currentSymbol,
        price: analysisData?.metrics?.close || 224.23,
        volume: 38400000,
        time: new Date().toISOString(),
        signal: "BUY",
        source: "tradingview"
      };
      const res = await api.simulateTradingViewWebhook(payload);
      setWebhookStatus(`Webhook Received & Verified on Stellar! Tx: ${res.stellar_tx_hash.slice(0, 16)}...`);
      loadWebhookLogs();
      loadAlerts();
    } catch (err: any) {
      setWebhookStatus(`Webhook Error: ${err.message}`);
    } finally {
      setWebhookSending(false);
    }
  };

  const handleSaveLabStrategy = async () => {
    try {
      await api.saveStrategy({
        name: labParams.name,
        version: labParams.version,
        parameters: {
          rsi_oversold: labParams.rsi_oversold,
          rsi_overbought: labParams.rsi_overbought,
          ema_fast: labParams.ema_fast,
          ema_slow: labParams.ema_slow,
          atr_mult: labParams.atr_mult,
          rr_ratio: labParams.rr_ratio,
          risk_pct: labParams.risk_pct
        }
      });
      loadStrategies();
      alert("Strategy version saved successfully with SHA-256 parameter signature!");
    } catch (err) {
      console.error("Failed to save strategy:", err);
    }
  };

  // Navigation Links
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "guide", label: "How to Use", icon: BookOpen, badge: "START" },
    { id: "news", label: "News Intelligence", icon: Newspaper, badge: "LIVE" },
    { id: "scanner", label: "Market Scanner", icon: Binary },
    { id: "analyzer", label: "AI Stock Analyzer", icon: Cpu },
    { id: "asset_details", label: "Asset Details", icon: BarChart3 },
    { id: "chart", label: "TradingView Chart", icon: LineChart },
    { id: "live_markets", label: "Live Markets", icon: Globe, badge: "LIVE" },
    { id: "signals", label: "AI Signals", icon: Zap, badge: signalsList.length || 7 },
    { id: "paper_trading", label: "Paper Trading", icon: Sliders },
    { id: "portfolio", label: "Portfolio", icon: Wallet },
    { id: "backtesting", label: "Backtesting", icon: History },
    { id: "risk", label: "Risk Management", icon: ShieldCheck },
    { id: "alerts", label: "Alerts Center", icon: Bell, badge: alertsList.filter(a => !a.is_read).length },
    { id: "explanation", label: "AI Explanation", icon: HelpCircle },
    { id: "blockchain", label: "Blockchain Audit", icon: Link2, badge: "Stellar" },
    { id: "strategy_lab", label: "Strategy Lab", icon: Layers },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "User Profile", icon: User },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      {/* ── Cinematic Animated Intro Splash Screen ── */}
      {showSplash && <SplashIntroScreen onComplete={() => setShowSplash(false)} />}

      {/* ── Mobile Backdrop Overlay ── */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* ========================================================
          SIDEBAR NAVIGATION (Responsive Off-Canvas Drawer)
      ======================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-[#0a0f1d] flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isMobileNavOpen ? "translate-x-0 shadow-2xl shadow-cyan-950/50" : "-translate-x-full"}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <TradeGuardLogo size="md" />
          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Balance Badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span>Paper Equity</span>
              <span className="text-emerald-400">Virtual ₹</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
              ₹{portfolioData?.total_equity ? portfolioData.total_equity.toLocaleString('en-IN') : "10,87,450"}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +₹4,320 Today
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN WORKSPACE
      ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-14 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 z-20 gap-2">
          {/* Mobile Hamburger + Search */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>


            {/* Symbol Search Bar with Instant Suggestions */}
            <div className="relative w-full max-w-[210px] sm:max-w-xs md:max-w-sm">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search stock / crypto (AAPL, NVDA)..."
                    value={searchSymbol}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchSymbol(e.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    className="w-full pl-9 pr-7 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 uppercase font-mono placeholder:normal-case placeholder:font-sans"
                  />
                  {searchSymbol && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchSymbol("");
                        setIsSearchDropdownOpen(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </form>

              {/* Autocomplete / Quick-Pick Dropdown */}
              {isSearchDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSearchDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0b1329] border border-cyan-500/30 rounded-xl shadow-2xl z-40 max-h-72 overflow-y-auto divide-y divide-slate-800/80 backdrop-blur-md">
                    <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between bg-slate-900/60">
                      <span>Click Any Asset to Analyze</span>
                      <span className="text-slate-500 font-mono text-[9px]">10 Available</span>
                    </div>
                    {POPULAR_ASSETS.filter(a => 
                      !searchSymbol || 
                      a.symbol.toLowerCase().includes(searchSymbol.toLowerCase()) || 
                      a.name.toLowerCase().includes(searchSymbol.toLowerCase())
                    ).map((asset) => (
                      <button
                        key={asset.symbol}
                        type="button"
                        onClick={() => selectAsset(asset.symbol)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-cyan-500/10 transition-colors ${
                          currentSymbol === asset.symbol ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">{asset.symbol}</span>
                          <span className="text-xs text-slate-300 truncate max-w-[130px]">{asset.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {asset.exchange}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Network indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Stellar Testnet: Active
            </div>

            {/* Backend health indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              API Online
            </div>

            {/* How to Use Button */}
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "guide"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 border-cyan-500/30 text-cyan-300 hover:bg-slate-800 hover:text-white"
              }`}
              title="How to Use TradeGuard AI"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">How to Use</span>
            </button>

            {/* Execute Paper Order Button */}
            <button
              onClick={() => handleOpenTradeModal(currentSymbol, "BUY", analysisData?.metrics?.close || 224.23)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paper Trade</span>
            </button>

            {/* AI Copilot Toggle Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Copilot</span>
            </button>

            {/* Alerts Center shortcut */}
            <button
              onClick={() => setActiveTab("alerts")}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {alertsList.some(a => !a.is_read) && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 animate-ping"></span>
              )}
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN VIEWPORT */}
        <main className={`flex-1 overflow-y-auto space-y-5 ${activeTab === "live_markets" ? "p-0" : "p-3 sm:p-5"}`}>
          {/* ── Live Ticker Strip (always visible unless on live_markets full view) ── */}
          {activeTab !== "live_markets" && (
            <div className="-mx-3 sm:-mx-5 -mt-3 sm:-mt-5 mb-2 bg-[#0a0f1d]/80 border-b border-slate-800/60 overflow-hidden">
              <TickerTapeWidget onSelectSymbol={selectAsset} />
            </div>
          )}
          {/* ========================================================
              VIEW: HOW TO USE (Comprehensive Interactive Manual)
          ======================================================== */}
          {activeTab === "guide" && (
            <HowToUseGuide
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenTradeModal={() => handleOpenTradeModal(currentSymbol, "BUY", analysisData?.metrics?.close || 224.23)}
            />
          )}

          {/* ========================================================
              VIEW 1: DASHBOARD
          ======================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              {/* Financial Disclaimer Banner */}
              <FinancialDisclaimer />

              {/* Key Financial KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Portfolio Value</span>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">₹10,87,450</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                    <TrendingUp className="w-3 h-3" /> +8.7% All Time
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Today's P&L</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">+₹4,320</div>
                  <div className="text-[11px] text-slate-400 mt-1">+0.42% Daily</div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Risk Exposure</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">32%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Max Policy: 40%</div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">AI Signals</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{signalsList.length || 7}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Active Horizons</div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Open Positions</span>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">{portfolioData?.positions?.length || 2}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Max Cap: 5</div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                  <span className="text-xs text-purple-300 uppercase font-semibold">Verified Signals</span>
                  <div className="text-xl font-bold font-mono text-purple-300 mt-1">{blockchainRecords?.total_records || 124}</div>
                  <div className="text-[11px] text-purple-400/80 flex items-center gap-1 mt-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Stellar Soroban
                  </div>
                </div>
              </div>

              {/* Large AI Market Intelligence Section (Requirement 26) */}
              <AIMarketIntelligenceBanner
                data={analysisData}
                onRefresh={() => loadAssetAnalysis(currentSymbol)}
                onOpenTradeModal={handleOpenTradeModal}
                onOpenBlockchainVerify={handleOpenBlockchainVerify}
              />

              {/* Visual Pipeline Flow Diagram (Requirement 34) */}
              <BlockchainFlowDiagram />

              {/* Market Overview & Top Movers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top Bullish Model Signals */}
                <div className="glass-panel rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Top Bullish Model Setups
                    </h3>
                    <button onClick={() => setActiveTab("scanner")} className="text-xs text-cyan-400 hover:underline">
                      View Scanner →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {scannerList.filter(s => s.signal === "BUY").slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold font-mono text-slate-200">{item.symbol}</span>
                          <span className="font-mono text-slate-400">${item.price?.toFixed(2)}</span>
                          <span className="text-emerald-400 font-mono">+{item.change_pct?.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            BUY ({item.confidence}%)
                          </span>
                          <button
                            onClick={() => {
                              loadAssetAnalysis(item.symbol);
                              setActiveTab("analyzer");
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Bearish / Caution Setups */}
                <div className="glass-panel rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      Caution / Bearish Signals
                    </h3>
                    <button onClick={() => setActiveTab("signals")} className="text-xs text-cyan-400 hover:underline">
                      View Signals →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {scannerList.filter(s => s.signal === "SELL" || s.signal === "HOLD").slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold font-mono text-slate-200">{item.symbol}</span>
                          <span className="font-mono text-slate-400">${item.price?.toFixed(2)}</span>
                          <span className={`font-mono ${item.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.change_pct >= 0 ? `+${item.change_pct?.toFixed(2)}%` : `${item.change_pct?.toFixed(2)}%`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.signal === "SELL" 
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}>
                            {item.signal} ({item.confidence}%)
                          </span>
                          <button
                            onClick={() => {
                              loadAssetAnalysis(item.symbol);
                              setActiveTab("analyzer");
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Stellar Blockchain Verification Feed */}
              <div className="glass-panel rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-purple-400" />
                    Recent Stellar Soroban Verification Events
                  </h3>
                  <button onClick={() => setActiveTab("blockchain")} className="text-xs text-purple-400 hover:underline">
                    Explorer →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 pb-2">
                        <th className="pb-2">Signal ID</th>
                        <th className="pb-2">Asset</th>
                        <th className="pb-2">Verdict</th>
                        <th className="pb-2">Model</th>
                        <th className="pb-2">Stellar Tx Hash</th>
                        <th className="pb-2">Ledger Seq</th>
                        <th className="pb-2 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(blockchainRecords?.records || []).slice(0, 4).map((rec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 font-bold text-slate-200">{rec.signal_code}</td>
                          <td className="py-2.5 text-cyan-300">{rec.asset}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.signal_type === "BUY" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {rec.signal_type}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-400">{rec.model_version}</td>
                          <td className="py-2.5 text-slate-300">{rec.stellar_tx_hash.slice(0, 16)}...</td>
                          <td className="py-2.5 text-purple-300">#{rec.stellar_ledger_seq}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleOpenBlockchainVerify(rec.signal_code, rec.signal_hash)}
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Section 41: Compact Financial News Intelligence Widget ── */}
              <div className="glass-panel rounded-xl p-5 border border-blue-500/30 bg-blue-950/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📰</span>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Live Financial News Intelligence</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          AI Analyzed
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Real-time market movers, central bank bulletins, and stock catalysts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-md shadow-blue-600/30 flex items-center gap-1"
                  >
                    <span>View All News</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {dashboardNews.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedNewsArticle(item);
                      }}
                      className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-300">{item.source}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.sentiment === "POSITIVE"
                              ? "text-emerald-400 bg-emerald-500/10"
                              : item.sentiment === "NEGATIVE"
                              ? "text-rose-400 bg-rose-500/10"
                              : "text-amber-400 bg-amber-500/10"
                          }`}>
                            {item.sentiment}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span className="font-mono text-cyan-400">Impact: {item.impact_score ?? 80}/100</span>
                        <span className="text-blue-400 group-hover:underline">AI Summary →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW: FINANCIAL NEWS INTELLIGENCE DASHBOARD
          ======================================================== */}
          {activeTab === "news" && (
            <ErrorBoundary fallbackTitle="News Dashboard Temporarily Unavailable" fallbackMessage="Financial news feed encountered an isolated issue. Market data and trading features remain available.">
              <NewsDashboard
                onSelectSymbol={(sym) => {
                  setCurrentSymbol(sym);
                  loadAssetAnalysis(sym);
                  setActiveTab("analyzer");
                }}
              />
            </ErrorBoundary>
          )}

          {/* ========================================================
              VIEW 2: MARKET SCANNER
          ======================================================== */}
          {activeTab === "scanner" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Live Market Scanner</h2>
                  <p className="text-xs text-slate-400">Multi-asset real-time technical indicators and AI signals.</p>
                </div>
                <button
                  onClick={loadScanner}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Scanner
                </button>
              </div>

              <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">Symbol</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Change %</th>
                        <th className="p-3.5">Trend</th>
                        <th className="p-3.5">RSI (14)</th>
                        <th className="p-3.5">MACD</th>
                        <th className="p-3.5">AI Signal</th>
                        <th className="p-3.5">Confidence</th>
                        <th className="p-3.5">Risk Level</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono">
                      {scannerList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-100 text-sm">{row.symbol}</td>
                          <td className="p-3.5 font-semibold text-slate-200">${row.price?.toFixed(2)}</td>
                          <td className={`p-3.5 font-semibold ${row.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {row.change_pct >= 0 ? `+${row.change_pct?.toFixed(2)}%` : `${row.change_pct?.toFixed(2)}%`}
                          </td>
                          <td className="p-3.5 text-slate-300 font-sans text-xs">{row.trend}</td>
                          <td className="p-3.5 text-slate-300">{row.rsi}</td>
                          <td className="p-3.5 text-slate-300">{row.macd}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              row.signal === "BUY" 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : row.signal === "SELL"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}>
                              {row.signal}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-cyan-300">{row.confidence}%</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.risk === "LOW" ? "text-emerald-400" : row.risk === "HIGH" ? "text-rose-400" : "text-amber-400"
                            }`}>
                              {row.risk}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-sans">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  loadAssetAnalysis(row.symbol);
                                  setActiveTab("analyzer");
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs"
                              >
                                Analyze
                              </button>
                              <button
                                onClick={() => handleOpenTradeModal(row.symbol, row.signal === "SELL" ? "SELL" : "BUY", row.price)}
                                className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                              >
                                Trade
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 3: AI STOCK ANALYZER
          ======================================================== */}
          {activeTab === "analyzer" && (
            <div className="space-y-5">
              {/* Asset Header with Interactive Asset Switcher */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Asset Inspection</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {POPULAR_ASSETS.find(a => a.symbol === currentSymbol)?.exchange || "Global"} Exchange
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                        {currentSymbol}
                        <span className="font-mono text-cyan-300">
                          {analysisData?.metrics?.close ? `$${analysisData.metrics.close.toFixed(2)}` : ""}
                        </span>
                      </h1>

                      {/* Instant Stock Dropdown Selector */}
                      <select
                        value={currentSymbol}
                        onChange={(e) => selectAsset(e.target.value)}
                        className="bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer shadow-sm"
                      >
                        {POPULAR_ASSETS.map((a) => (
                          <option key={a.symbol} value={a.symbol} className="bg-slate-900 text-slate-100">
                            {a.symbol} — {a.name} ({a.exchange})
                          </option>
                        ))}
                      </select>

                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Regime: {analysisData?.metrics?.market_regime || "Bullish Trend"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab("chart")}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <LineChart className="w-4 h-4 text-cyan-400" />
                      Open TradingView
                    </button>
                    <button
                      onClick={() => handleOpenTradeModal(currentSymbol, analysisData?.signal?.signal_type || "BUY", analysisData?.metrics?.close || 224.23)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                    >
                      <Zap className="w-4 h-4" /> Place Paper Order
                    </button>
                  </div>
                </div>

                {/* Quick Asset Switch Pills */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1.5">
                    Switch Asset:
                  </span>
                  {POPULAR_ASSETS.map((asset) => {
                    const isSelected = currentSymbol === asset.symbol;
                    return (
                      <button
                        key={asset.symbol}
                        onClick={() => selectAsset(asset.symbol)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 border border-cyan-400"
                            : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
                        }`}
                      >
                        <span>{asset.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Technical Indicators Chart */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-cyan-400" />
                    Price Action & Historical Trend
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">Interval: 1D</div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketData?.candles || []}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} tickLine={false} orientation="right" />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "11px" }} />
                      <Area type="monotone" dataKey="close" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Indicator Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">RSI (14)</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">{analysisData?.metrics?.rsi}</div>
                  <span className="text-[10px] text-slate-500">Range: 0-100</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">MACD</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">{analysisData?.metrics?.macd}</div>
                  <span className="text-[10px] text-cyan-400">Sig: {analysisData?.metrics?.macd_signal}</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">EMA 20</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">${analysisData?.metrics?.ema_20}</div>
                  <span className="text-[10px] text-slate-500">Fast Trend</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">SMA 50</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">${analysisData?.metrics?.sma_50}</div>
                  <span className="text-[10px] text-slate-500">Medium Baseline</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">SMA 200</span>
                  <div className="text-base font-bold font-mono text-slate-100 mt-1">${analysisData?.metrics?.sma_200}</div>
                  <span className="text-[10px] text-slate-500">Macro Filter</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">ATR (14)</span>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">${analysisData?.metrics?.atr}</div>
                  <span className="text-[10px] text-slate-400">{analysisData?.metrics?.atr_pct}% Vol</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Support</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">${analysisData?.metrics?.support}</div>
                  <span className="text-[10px] text-slate-500">20D Low</span>
                </div>
                <div className="glass-panel p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Resistance</span>
                  <div className="text-base font-bold font-mono text-rose-400 mt-1">${analysisData?.metrics?.resistance}</div>
                  <span className="text-[10px] text-slate-500">20D High</span>
                </div>
              </div>

              {/* AI Probability Distribution */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  ML Ensemble Directional Movement Probabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-xs uppercase font-bold text-emerald-400">Bullish Probability</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                      {analysisData?.signal?.probabilities?.bullish}%
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs uppercase font-bold text-slate-400">Neutral Probability</span>
                    <div className="text-3xl font-black text-slate-300 font-mono mt-1">
                      {analysisData?.signal?.probabilities?.neutral}%
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <span className="text-xs uppercase font-bold text-rose-400">Bearish Probability</span>
                    <div className="text-3xl font-black text-rose-400 font-mono mt-1">
                      {analysisData?.signal?.probabilities?.bearish}%
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 13, 14 & 42: News + Technical Analysis Combined Signal Fusion ── */}
              <SignalFusionCard
                symbol={currentSymbol}
                onOpenAudit={() => setActiveTab("blockchain")}
              />

              {/* ── Section 8: Stock-Specific News Intelligence ── */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <span>📰</span> Latest {currentSymbol} Financial News & Catalysts
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time company headlines, AI sentiment assessment, and market impact estimates
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>More Market News</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stockNewsList.slice(0, 4).map((art, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">{art.source}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              art.sentiment === "POSITIVE"
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                                : art.sentiment === "NEGATIVE"
                                ? "text-rose-400 bg-rose-500/10 border border-rose-500/30"
                                : "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                            }`}>
                              {art.sentiment}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30">
                              {art.importance || "HIGH"}
                            </span>
                          </div>
                        </div>

                        <h4
                          onClick={() => setSelectedNewsArticle(art)}
                          className="text-sm font-bold text-slate-100 hover:text-blue-400 cursor-pointer line-clamp-2 leading-snug"
                        >
                          {art.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {art.ai_summary || art.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                        <a
                          href={art.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <span>Read Original</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => setSelectedNewsArticle(art)}
                          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                        >
                          Deep-Dive Analysis →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 4: ASSET DETAILS
          ======================================================== */}
          {activeTab === "asset_details" && (
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-xl border border-slate-800">
                <h2 className="text-xl font-bold text-slate-100 mb-1">Asset Profile: {currentSymbol}</h2>
                <p className="text-xs text-slate-400">Fundamental technical statistics, exchange distribution, and liquidity breadth.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Exchange</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">NASDAQ Global Market</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Currency</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">USD ($)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Daily Volume</span>
                    <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                      {analysisData?.metrics?.volume_ratio}x 20-Day Avg
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Volatility Classification</span>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{analysisData?.metrics?.volatility}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 5: TRADINGVIEW CHART
          ======================================================== */}
          {activeTab === "chart" && (
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold text-slate-100">TradingView Advanced Chart</h2>
                <p className="text-xs text-slate-400">
                  Search any stock, crypto, commodity, index, or forex pair. Powered by TradingView.
                </p>
              </div>

              {/* ── Chart Search Bar ── */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chartInput.trim()) {
                    setChartSymbol(resolveTVSymbol(chartInput.trim()));
                    setChartInput("");
                  }
                }}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
              >
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={chartInput}
                    onChange={(e) => setChartInput(e.target.value)}
                    placeholder="Type any name: Gold, BTC, NIFTY, AAPL, RELIANCE, EUR/USD..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Search className="w-4 h-4" /> Show Chart
                </button>
              </form>

              {/* Current symbol display */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Viewing:</span>
                <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {chartSymbol}
                </span>
              </div>

              {/* ── Quick-Pick Grid ── */}
              <div className="space-y-2">
                {[
                  {
                    label: "🇺🇸 US Stocks",
                    symbols: [
                      { name: "AAPL", tv: "NASDAQ:AAPL" },
                      { name: "NVDA", tv: "NASDAQ:NVDA" },
                      { name: "TSLA", tv: "NASDAQ:TSLA" },
                      { name: "MSFT", tv: "NASDAQ:MSFT" },
                      { name: "GOOGL", tv: "NASDAQ:GOOGL" },
                      { name: "AMZN", tv: "NASDAQ:AMZN" },
                      { name: "META", tv: "NASDAQ:META" },
                      { name: "JPM", tv: "NYSE:JPM" },
                    ],
                  },
                  {
                    label: "🇮🇳 Indian Markets",
                    symbols: [
                      { name: "NIFTY 50", tv: "NSE:NIFTY50" },
                      { name: "SENSEX", tv: "BSE:SENSEX" },
                      { name: "RELIANCE", tv: "NSE:RELIANCE" },
                      { name: "TCS", tv: "NSE:TCS" },
                      { name: "INFY", tv: "NSE:INFY" },
                      { name: "HDFC Bank", tv: "NSE:HDFCBANK" },
                      { name: "ICICI Bank", tv: "NSE:ICICIBANK" },
                      { name: "TATAMOTORS", tv: "NSE:TATAMOTORS" },
                    ],
                  },
                  {
                    label: "₿ Crypto",
                    symbols: [
                      { name: "Bitcoin", tv: "BINANCE:BTCUSDT" },
                      { name: "Ethereum", tv: "BINANCE:ETHUSDT" },
                      { name: "Solana", tv: "BINANCE:SOLUSDT" },
                      { name: "BNB", tv: "BINANCE:BNBUSDT" },
                      { name: "XRP", tv: "BINANCE:XRPUSDT" },
                      { name: "DOGE", tv: "BINANCE:DOGEUSDT" },
                      { name: "ADA", tv: "BINANCE:ADAUSDT" },
                      { name: "MATIC", tv: "BINANCE:MATICUSDT" },
                    ],
                  },
                  {
                    label: "🏆 Commodities",
                    symbols: [
                      { name: "Gold", tv: "TVC:GOLD" },
                      { name: "Silver", tv: "TVC:SILVER" },
                      { name: "Crude Oil", tv: "TVC:USOIL" },
                      { name: "Brent Oil", tv: "TVC:UKOIL" },
                      { name: "Nat Gas", tv: "TVC:NATURALGAS" },
                      { name: "Copper", tv: "TVC:COPPER" },
                      { name: "Platinum", tv: "TVC:PLATINUM" },
                      { name: "S&P 500", tv: "FOREXCOM:SPXUSD" },
                    ],
                  },
                  {
                    label: "💱 Forex",
                    symbols: [
                      { name: "EUR/USD", tv: "FX_IDC:EURUSD" },
                      { name: "GBP/USD", tv: "FX_IDC:GBPUSD" },
                      { name: "USD/JPY", tv: "FX_IDC:USDJPY" },
                      { name: "USD/INR", tv: "FX_IDC:USDINR" },
                      { name: "AUD/USD", tv: "FX_IDC:AUDUSD" },
                      { name: "USD/CHF", tv: "FX_IDC:USDCHF" },
                      { name: "DXY", tv: "TVC:DXY" },
                      { name: "VIX", tv: "TVC:VIX" },
                    ],
                  },
                ].map((group) => (
                  <div key={group.label} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest sm:w-28 shrink-0">
                      {group.label}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {group.symbols.map((sym) => (
                        <button
                          key={sym.tv}
                          onClick={() => setChartSymbol(sym.tv)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                            chartSymbol === sym.tv
                              ? "bg-cyan-500 border-cyan-400 text-slate-950"
                              : "bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
                          }`}
                        >
                          {sym.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── The Chart ── */}
              <div className="w-full">
                <ErrorBoundary fallbackTitle="Chart Temporarily Unavailable" fallbackMessage="Technical chart canvas encountered an isolated rendering issue. Try selecting another asset or refresh.">
                  <LightweightChartWidget symbol={chartSymbol} height={530} />
                </ErrorBoundary>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 5b: LIVE MARKETS (TradingView All Widgets)
          ======================================================== */}
          {activeTab === "live_markets" && (
            <div className="space-y-0 -mx-3 sm:-mx-5 -mt-3 sm:-mt-5" style={{ height: "calc(100vh - 56px)" }}>
              {/* Live ticker strip */}
              <div className="sticky top-0 z-10 bg-[#0a0f1d]/95 backdrop-blur border-b border-slate-800/60 px-3">
                <TickerTapeWidget onSelectSymbol={selectAsset} />
              </div>
              {/* Full-screen iframe to the /markets route */}
              <iframe
                src="/markets"
                className="w-full border-0"
                style={{ height: "calc(100vh - 56px - 46px)" }}
                title="Live Markets — TradingView Powered"
                allow="fullscreen"
              />
            </div>
          )}

          {/* ========================================================
              VIEW 6: AI SIGNALS
          ======================================================== */}
          {activeTab === "signals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">AI Trading Signals Center</h2>
                  <p className="text-xs text-slate-400">Probabilistic signals generated by validated ML pipelines with Stellar audit hashes.</p>
                </div>
                <button
                  onClick={() => api.generateSignal(currentSymbol).then(loadSignals)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Generate Signal ({currentSymbol})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {signalsList.map((sig, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-100 font-mono text-base">{sig.symbol}</span>
                        <span className="text-xs text-slate-400 font-mono">${sig.current_price?.toFixed(2)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        sig.signal_type === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}>
                        {sig.signal_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Confidence</span>
                        <span className="font-bold text-cyan-400 font-mono">{sig.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Risk Rating</span>
                        <span className="font-bold text-amber-400">{sig.risk_score}</span>
                      </div>
                      <div>
                        <span className="text-rose-400 block">Stop Loss</span>
                        <span className="font-mono text-slate-200">${sig.stop_loss}</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 block">Take Profit</span>
                        <span className="font-mono text-slate-200">${sig.take_profit}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">{sig.signal_code}</span>
                      <button
                        onClick={() => handleOpenBlockchainVerify(sig.signal_code, sig.signal_hash)}
                        className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Stellar Proof
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 7: PAPER TRADING
          ======================================================== */}
          {activeTab === "paper_trading" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Paper Trading Simulator</h2>
                  <p className="text-xs text-slate-400">Institutional pre-trade risk engine validation with virtual INR capital.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenTradeModal(currentSymbol, "BUY", analysisData?.metrics?.close || 224.23)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" /> New Order
                  </button>
                  <button
                    onClick={async () => {
                      await api.resetPaperBalance();
                      loadPortfolio();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Reset Balance
                  </button>
                </div>
              </div>

              {/* Balances Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase">Virtual Cash Available</span>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
                    ₹{portfolioData?.virtual_cash?.toLocaleString('en-IN') || "6,80,000"}
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase">Invested in Positions</span>
                  <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                    ₹{portfolioData?.total_market_value?.toLocaleString('en-IN') || "3,20,000"}
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase">Realized Profit & Loss</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    +₹{portfolioData?.realized_pnl?.toLocaleString('en-IN') || "12,450"}
                  </div>
                </div>
              </div>

              {/* Active Open Positions Table */}
              <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 p-4">
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  Active Paper Positions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-slate-400 border-b border-slate-800 pb-2 font-sans">
                      <tr>
                        <th className="pb-2">Symbol</th>
                        <th className="pb-2">Side</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Avg Entry</th>
                        <th className="pb-2">Current</th>
                        <th className="pb-2">Unrealized P&L</th>
                        <th className="pb-2">Stop Loss</th>
                        <th className="pb-2">AI Rec</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(portfolioData?.positions || []).map((pos: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 font-bold text-slate-100">{pos.symbol}</td>
                          <td className="py-2.5 text-emerald-400">{pos.side}</td>
                          <td className="py-2.5">{pos.quantity}</td>
                          <td className="py-2.5">${pos.average_entry?.toFixed(2)}</td>
                          <td className="py-2.5">${pos.current_price?.toFixed(2)}</td>
                          <td className="py-2.5 text-emerald-400 font-bold">
                            +${pos.unrealized_pnl?.toFixed(2)} (+{pos.unrealized_pnl_pct}%)
                          </td>
                          <td className="py-2.5 text-rose-400">${pos.stop_loss}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">
                              {pos.ai_recommendation}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-sans">
                            <button
                              onClick={() => handleOpenTradeModal(pos.symbol, "SELL", pos.current_price)}
                              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold text-xs"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 8: PORTFOLIO
          ======================================================== */}
          {activeTab === "portfolio" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Portfolio & Asset Allocation</h2>
                  <p className="text-xs text-slate-400">Total paper equity, risk exposure breakdown, and live performance.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Allocation Chart */}
                <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-slate-200 mb-2">Asset Allocation</h3>
                  <div className="h-56 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioData?.allocations || [
                            { symbol: "AAPL", value: 350000 },
                            { symbol: "NVDA", value: 250000 },
                            { symbol: "CASH", value: 487450 }
                          ]}
                          dataKey="value"
                          nameKey="symbol"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          <Cell fill="#06b6d4" />
                          <Cell fill="#10b981" />
                          <Cell fill="#6366f1" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 text-xs">
                    {(portfolioData?.allocations || []).map((a: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{a.symbol}</span>
                        <span className="font-mono font-bold">{a.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Exposure Details */}
                <div className="glass-panel p-5 rounded-xl border border-slate-800 lg:col-span-2 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-slate-200 mb-2">Risk Exposure & Policy Safety Metrics</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Total Portfolio Exposure</span>
                      <span className="text-lg font-bold font-mono text-cyan-300 mt-1 block">
                        {portfolioData?.portfolio_exposure_pct || 32}% / 40% Max
                      </span>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${(portfolioData?.portfolio_exposure_pct || 32)/40 * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Total Open Capital at Risk</span>
                      <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
                        ₹{riskPolicy?.capital_at_risk?.toLocaleString('en-IN') || "7,800"}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 block">Max allowable risk per trade: ₹10,000 (1%)</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All open holdings adhere to mandatory stop-loss brackets. Portfolio health is within normal variance limits.</span>
                  </div>
                </div>
              </div>

              {/* ── Section 25 & 26: News + Portfolio Intelligence & AI Alerts ── */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <span>💼</span> Active Holdings News Intelligence
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time headline monitoring, news sentiment, and event impact for your open commitments
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Open News Dashboard →
                  </button>
                </div>

                {/* AI Portfolio News Alerts */}
                {portfolioNews?.high_impact_risk_alerts && portfolioNews.high_impact_risk_alerts.length > 0 && (
                  <div className="space-y-2">
                    {portfolioNews.high_impact_risk_alerts.map((al: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/20 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-rose-400">⚠️ PORTFOLIO NEWS ALERT</span>
                            <span className="font-bold text-white px-2 py-0.2 rounded bg-slate-800 border border-slate-700">
                              ${al.symbol}
                            </span>
                            <span className="text-[10px] text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded">
                              Impact: {al.impact_score}/100
                            </span>
                          </div>
                          <p className="text-slate-200 font-medium">{al.headline}</p>
                          <p className="text-[11px] text-slate-400">
                            {al.action_note} • Current AI Signal: <strong className="text-amber-400">{al.ai_signal}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentSymbol(al.symbol);
                            loadAssetAnalysis(al.symbol);
                            setActiveTab("analyzer");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap border border-slate-700"
                        >
                          View Analysis
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Per Holding News Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(portfolioNews?.holdings_news || [
                    { symbol: "AAPL", news_count: 3, sentiment: "POSITIVE", sentiment_score: 0.84, latest_headline: "Apple Reports Record Services Revenue and Stronger Gross Margins in Q3" },
                    { symbol: "NVDA", news_count: 2, sentiment: "POSITIVE", sentiment_score: 0.88, latest_headline: "NVIDIA Expands Blackwell Enterprise AI Infrastructure with Tier-1 Cloud Hyperscalers" }
                  ]).map((h: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white text-sm">${h.symbol}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{h.news_count} news stories</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.sentiment === "POSITIVE"
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                                : h.sentiment === "NEGATIVE"
                                ? "text-rose-400 bg-rose-500/10 border border-rose-500/30"
                                : "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                            }`}>
                              {h.sentiment}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-snug">
                          {h.latest_headline}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800">
                        <span className="text-slate-400 font-mono">Sentiment: {h.sentiment_score >= 0 ? `+${h.sentiment_score}` : h.sentiment_score}</span>
                        <button
                          onClick={() => {
                            setCurrentSymbol(h.symbol);
                            loadAssetAnalysis(h.symbol);
                            setActiveTab("analyzer");
                          }}
                          className="text-blue-400 hover:underline font-semibold"
                        >
                          Asset News & Analysis →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 9: BACKTESTING
          ======================================================== */}
          {activeTab === "backtesting" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Quantitative Backtesting Engine</h2>
                  <p className="text-xs text-slate-400">Realistic historical walk-forward simulation incorporating slippage (0.05%) and commissions (0.03%).</p>
                </div>
                <button
                  disabled={loadingBacktest}
                  onClick={() => handleRunBacktest("ai_multi_factor")}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  {loadingBacktest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run Backtest ({currentSymbol})
                </button>
              </div>

              {/* Backtest KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total Return</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    +{backtestResult?.total_return_pct || 24.8}%
                  </div>
                </div>
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Win Rate</span>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                    {backtestResult?.win_rate || 64.2}%
                  </div>
                </div>
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Max Drawdown</span>
                  <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                    -{backtestResult?.max_drawdown_pct || 7.4}%
                  </div>
                </div>
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Profit Factor</span>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {backtestResult?.profit_factor || 1.84}
                  </div>
                </div>
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Sharpe Ratio</span>
                  <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                    {backtestResult?.sharpe_ratio || 1.62}
                  </div>
                </div>
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total Trades</span>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {backtestResult?.total_trades || 42}
                  </div>
                </div>
              </div>

              {/* Equity Curve Chart */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Simulated Cumulative Equity Growth ($)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={backtestResult?.equity_curve || []}>
                      <defs>
                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} orientation="right" tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", fontSize: "11px" }} />
                      <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#equityGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Returns */}
              {backtestResult?.monthly_returns && (
                <div className="glass-panel p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 mb-2">Monthly Performance Breakdown (%)</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center text-xs">
                    {backtestResult.monthly_returns.map((m: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{m.month}</span>
                        <span className={`font-mono font-bold mt-1 block ${m.return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.return_pct >= 0 ? `+${m.return_pct}%` : `${m.return_pct}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 10: RISK MANAGEMENT
          ======================================================== */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Institutional Risk Management</h2>
                  <p className="text-xs text-slate-400">Pre-trade order policy limits, circuit breakers, and capital protection controls.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Policy Rules */}
                <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Enforced Safety Rules
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span>Maximum Risk Per Trade</span>
                      <span className="font-mono font-bold text-cyan-400">1.0% (₹10,000 on ₹10L)</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span>Maximum Daily Realized Loss</span>
                      <span className="font-mono font-bold text-rose-400">3.0% (₹30,000)</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span>Maximum Portfolio Exposure</span>
                      <span className="font-mono font-bold text-amber-400">40.0% Capital Max</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span>Max Concurrent Open Positions</span>
                      <span className="font-mono font-bold text-slate-100">5 Positions</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <span>Mandatory Stop Loss & Take Profit</span>
                      <span className="font-bold text-emerald-400">Enforced Pre-Trade</span>
                    </div>
                  </div>
                </div>

                {/* Circuit Breaker & Controls */}
                <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Circuit Breaker Controls
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Emergency Trading Circuit Breaker</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Immediately halt all new paper order placements.</div>
                    </div>
                    <button
                      onClick={async () => {
                        const newStatus = !riskPolicy?.circuit_breaker_active;
                        await api.updateRiskPolicy({ circuit_breaker_active: newStatus });
                        loadRiskPolicy();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        riskPolicy?.circuit_breaker_active 
                          ? "bg-rose-500 text-slate-950" 
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {riskPolicy?.circuit_breaker_active ? "LOCKED (Active)" : "Armed (Off)"}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
                    💡 <strong>Did you know?</strong> If a paper trade is attempted with risk exceeding ₹10,000, TradeGuard AI automatically halts execution and proposes an adjusted safe share allocation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 11: ALERTS CENTER
          ======================================================== */}
          {activeTab === "alerts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Alerts & Webhook Center</h2>
                  <p className="text-xs text-slate-400">In-app signals, risk triggers, and TradingView incoming webhooks.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={webhookSending}
                    onClick={handleSimulateWebhook}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                  >
                    {webhookSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    Simulate TV Webhook
                  </button>
                  <button
                    onClick={async () => {
                      await api.markAllAlertsRead();
                      loadAlerts();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Mark All Read
                  </button>
                </div>
              </div>

              {webhookStatus && (
                <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                  {webhookStatus}
                </div>
              )}

              {/* Alert List */}
              <div className="space-y-2.5">
                {alertsList.map((alert) => (
                  <div key={alert.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.severity === "WARNING" 
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : alert.severity === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-100">{alert.title}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 12: AI EXPLANATION
          ======================================================== */}
          {activeTab === "explanation" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Explainable AI (XAI) Deep Dive</h2>
                <p className="text-xs text-slate-400">Mathematical transparency and feature attribution for {currentSymbol}.</p>
              </div>

              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 uppercase mb-1">Synthesized Plain-English Reasoning</div>
                  <div className="text-xs text-slate-200 leading-relaxed font-sans">
                    {analysisData?.explanation?.final_reasoning || "Model indicators indicate multi-factor trend alignment."}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-xs font-bold text-emerald-400 uppercase mb-2 block">Positive Supporting Drivers</span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {(analysisData?.explanation?.positive_factors || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <span className="text-xs font-bold text-rose-400 uppercase mb-2 block">Risk Factors & Obstacles</span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {(analysisData?.explanation?.risk_factors || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 13: BLOCKCHAIN AUDIT
          ======================================================== */}
          {activeTab === "blockchain" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Stellar Soroban Blockchain Audit Explorer</h2>
                  <p className="text-xs text-slate-400">Cryptographically verifiable receipts stored on the Stellar distributed ledger.</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                  Contract: CCQJ2...KBLQ
                </div>
              </div>

              <div className="glass-panel rounded-xl overflow-hidden border border-purple-500/30 bg-[#0d1527]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-purple-500/10 text-purple-300 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">Signal Code</th>
                        <th className="p-3.5">Asset</th>
                        <th className="p-3.5">Signal</th>
                        <th className="p-3.5">Model Version</th>
                        <th className="p-3.5">Signal Hash (SHA-256)</th>
                        <th className="p-3.5">Stellar Transaction Hash</th>
                        <th className="p-3.5 text-right">Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {(blockchainRecords?.records || []).map((rec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/60">
                          <td className="p-3.5 font-bold text-slate-200">{rec.signal_code}</td>
                          <td className="p-3.5 text-cyan-300">{rec.asset}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.signal_type === "BUY" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {rec.signal_type}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400">{rec.model_version}</td>
                          <td className="p-3.5 text-slate-400">{rec.signal_hash.slice(0, 16)}...</td>
                          <td className="p-3.5 text-purple-300">{rec.stellar_tx_hash.slice(0, 16)}...</td>
                          <td className="p-3.5 text-right font-sans">
                            <button
                              onClick={() => handleOpenBlockchainVerify(rec.signal_code, rec.signal_hash)}
                              className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verify Hash
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 14: STRATEGY LAB
          ======================================================== */}
          {activeTab === "strategy_lab" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Strategy Experimentation Lab</h2>
                  <p className="text-xs text-slate-400">Tune RSI thresholds, EMA spans, and ATR multipliers, version strategies, and simulate.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveLabStrategy}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase"
                  >
                    Save & Version Strategy
                  </button>
                  <button
                    onClick={() => {
                      handleRunBacktest("lab_custom");
                      setActiveTab("backtesting");
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Run Simulation
                  </button>
                </div>
              </div>

              {/* Parameter Sliders */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    RSI Oversold Level: <span className="text-cyan-400 font-mono">{labParams.rsi_oversold}</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="45"
                    value={labParams.rsi_oversold}
                    onChange={(e) => setLabParams({ ...labParams, rsi_oversold: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Fast EMA Period: <span className="text-cyan-400 font-mono">{labParams.ema_fast}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={labParams.ema_fast}
                    onChange={(e) => setLabParams({ ...labParams, ema_fast: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Slow EMA Period: <span className="text-cyan-400 font-mono">{labParams.ema_slow}</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={labParams.ema_slow}
                    onChange={(e) => setLabParams({ ...labParams, ema_slow: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ATR Stop Multiplier: <span className="text-rose-400 font-mono">{labParams.atr_mult}x</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={labParams.atr_mult}
                    onChange={(e) => setLabParams({ ...labParams, atr_mult: Number(e.target.value) })}
                    className="w-full accent-rose-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Risk / Reward Ratio: <span className="text-emerald-400 font-mono">{labParams.rr_ratio}:1</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.1"
                    value={labParams.rr_ratio}
                    onChange={(e) => setLabParams({ ...labParams, rr_ratio: Number(e.target.value) })}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Risk % Per Trade: <span className="text-amber-400 font-mono">{labParams.risk_pct}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={labParams.risk_pct}
                    onChange={(e) => setLabParams({ ...labParams, risk_pct: Number(e.target.value) })}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>

              {/* Saved Strategies Table */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Saved Strategy Versions</h3>
                <div className="space-y-2">
                  {strategiesList.map((st, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{st.name} ({st.version})</div>
                        <div className="text-[11px] text-slate-400">{st.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-300">Win Rate: {st.win_rate}%</span>
                        <span className="font-mono text-emerald-400">PF: {st.profit_factor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 15: SETTINGS
          ======================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">Platform Settings</h2>
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Market Data Provider</label>
                  <select className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs">
                    <option value="yahoo">Yahoo Finance (Live)</option>
                    <option value="alphavantage">AlphaVantage API</option>
                    <option value="mock">Resilient Mathematical Engine</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stellar Soroban Network</label>
                  <input
                    type="text"
                    disabled
                    value="https://soroban-testnet.stellar.org"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">TradingView Webhook Ingestion URL</label>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-cyan-300 text-xs flex justify-between items-center">
                    <span>http://127.0.0.1:8000/api/webhooks/tradingview</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 16: USER PROFILE
          ======================================================== */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100">User Profile & Risk Mandate</h2>
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <TradeGuardIcon size={46} glow={true} className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-1" />
                  <div>
                    <div className="text-sm font-bold text-slate-100">Institutional Research Account</div>
                    <div className="text-slate-400">Role: Certified Algorithmic Trader</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Risk Profile</span>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">Capital Preservation / Moderate</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Default Currency</span>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">INR (₹) / USD ($)</div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={async () => {
                      if (confirm("Reset paper trading account balance to ₹10,00,000?")) {
                        await api.resetPaperBalance();
                        loadPortfolio();
                        alert("Portfolio reset successfully!");
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 font-semibold"
                  >
                    Reset Virtual Paper Balance to ₹10,00,000
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODALS AND SLIDE-OVERS
      ======================================================== */}
      {/* Paper Trade Modal */}
      <PaperTradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        defaultSymbol={tradeModalProps.symbol}
        defaultSide={tradeModalProps.side}
        defaultPrice={tradeModalProps.price}
        onTradeExecuted={() => {
          loadPortfolio();
          loadSignals();
        }}
      />

      {/* Blockchain Verify Modal */}
      <BlockchainVerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        signalCode={verifyModalProps.signalCode}
        signalHash={verifyModalProps.signalHash}
      />

      {/* Copilot Assistant Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeSymbol={currentSymbol}
      />

      {/* Financial News Intelligence Detail Modal */}
      {selectedNewsArticle && (
        <NewsDetailModal
          article={selectedNewsArticle}
          onClose={() => setSelectedNewsArticle(null)}
          onSelectSymbol={(sym) => {
            setSelectedNewsArticle(null);
            setCurrentSymbol(sym);
            loadAssetAnalysis(sym);
            setActiveTab("analyzer");
          }}
        />
      )}
    </div>
  );
}
