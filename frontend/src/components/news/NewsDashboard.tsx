"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { NewsArticleCard } from "@/components/news/NewsArticleCard";
import { NewsDetailModal } from "@/components/news/NewsDetailModal";
import { DailyDigestModal } from "@/components/news/DailyDigestModal";
import { EconomicCalendarWidget } from "@/components/news/EconomicCalendarWidget";
import { NewsAlertsModal } from "@/components/news/NewsAlertsModal";
import { FALLBACK_ARTICLES, filterFallbackArticles } from "@/lib/fallbackNewsData";

interface NewsDashboardProps {
  onSelectSymbol?: (symbol: string) => void;
}

export function NewsDashboard({ onSelectSymbol }: NewsDashboardProps) {
  // Articles and feed state with immediate graceful fallback
  const [articles, setArticles] = useState<any[]>(() => FALLBACK_ARTICLES.slice(0, 12));
  const [breakingNews, setBreakingNews] = useState<any[]>(() => FALLBACK_ARTICLES.filter(a => a.is_breaking).slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isLiveNews, setIsLiveNews] = useState<boolean>(false);
  const [newsStatusMsg, setNewsStatusMsg] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Filters
  const [activeTab, setActiveTab] = useState<"FEED" | "WATCHLIST" | "CALENDAR">("FEED");
  const [category, setCategory] = useState("ALL");
  const [sentiment, setSentiment] = useState("ALL");
  const [minImpact, setMinImpact] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(300); // 5 min default

  // Watchlist feed
  const [watchlistData, setWatchlistData] = useState<any>(null);

  // Modals
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [digestData, setDigestData] = useState<any>(null);
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Debounce search query by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load feed
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const [feedRes, breakingRes] = await Promise.all([
        api.getNewsFeed({
          category: category !== "ALL" ? category : undefined,
          sentiment: sentiment !== "ALL" ? sentiment : undefined,
          min_impact: minImpact,
          search: debouncedSearch || undefined,
          limit: 30
        }),
        api.getBreakingNews(4)
      ]);
      const feedArticles = feedRes?.articles && feedRes.articles.length > 0
        ? feedRes.articles
        : filterFallbackArticles({
            category: category !== "ALL" ? category : undefined,
            sentiment: sentiment !== "ALL" ? sentiment : undefined,
            min_impact: minImpact,
            search: debouncedSearch || undefined,
            limit: 30
          });
      setArticles(feedArticles);
      setIsStale(feedRes?.is_stale || false);
      setIsLiveNews(feedRes?.is_live ?? false);
      setNewsStatusMsg(feedRes?.status_message || "");
      setBreakingNews(breakingRes && breakingRes.length > 0 ? breakingRes : FALLBACK_ARTICLES.filter(a => a.is_breaking).slice(0, 4));
      setLastRefreshed(new Date());
    } catch (e) {
      console.warn("Using curated fallback news feed:", e);
      const fallback = filterFallbackArticles({
        category: category !== "ALL" ? category : undefined,
        sentiment: sentiment !== "ALL" ? sentiment : undefined,
        min_impact: minImpact,
        search: debouncedSearch || undefined,
        limit: 30
      });
      setArticles(fallback);
      setIsLiveNews(false);
      setNewsStatusMsg("Live news temporarily unavailable");
      setBreakingNews(FALLBACK_ARTICLES.filter(a => a.is_breaking).slice(0, 4));
    } finally {
      setLoading(false);
    }
  }, [category, sentiment, minImpact, debouncedSearch]);

  // Load watchlist news
  const fetchWatchlistNews = useCallback(async () => {
    try {
      const data = await api.getWatchlistNews();
      setWatchlistData(data);
    } catch (e) {
      console.error("Failed to fetch watchlist news:", e);
    }
  }, []);

  // Initial and reactive fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (activeTab === "WATCHLIST") {
      fetchWatchlistNews();
    }
  }, [activeTab, fetchWatchlistNews]);

  // Auto-refresh interval with tab visibility awareness
  useEffect(() => {
    if (autoRefreshSec <= 0) return;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return; // Pause background polling when tab is not active
      }
      fetchNews();
    }, autoRefreshSec * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNews(); // Immediate refresh on refocusing tab
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoRefreshSec, fetchNews]);

  // Daily digest modal trigger
  const handleOpenDigest = async () => {
    try {
      setGeneratingDigest(true);
      setShowDigestModal(true);
      const data = await api.getTodayDigest();
      setDigestData(data);
    } catch (e) {
      console.error("Failed to load digest:", e);
    } finally {
      setGeneratingDigest(false);
    }
  };

  const handleRefreshDigest = async () => {
    try {
      setGeneratingDigest(true);
      const data = await api.generateDailyDigest();
      setDigestData(data);
    } catch (e) {
      console.error("Failed to refresh digest:", e);
    } finally {
      setGeneratingDigest(false);
    }
  };

  const CATEGORIES = [
    { id: "ALL", label: "🇮🇳 All Indian & Global News" },
    { id: "RBI_POLICY", label: "🏛️ RBI Policy" },
    { id: "SEBI_REGULATION", label: "⚖️ SEBI & Regulations" },
    { id: "INDIAN_ECONOMY", label: "🇮🇳 Indian Economy" },
    { id: "INDIAN_BANKING", label: "🏦 Indian Banking" },
    { id: "INDIAN_IT", label: "💻 Indian IT & AI" },
    { id: "BREAKING", label: "🚨 Breaking" },
    { id: "MARKET", label: "📊 Markets (NSE/BSE)" },
    { id: "GLOBAL", label: "🌐 Global Markets" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Ticker with Breaking News */}
      {breakingNews.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-black uppercase rounded-lg bg-rose-500 text-white tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span> LIVE BREAKING
            </span>
            <div className="space-y-0.5">
              <h4 
                onClick={() => setSelectedArticle(breakingNews[0])}
                className="text-sm font-bold text-white hover:text-rose-300 cursor-pointer line-clamp-1 transition-colors"
              >
                {breakingNews[0].title}
              </h4>
              <p className="text-[11px] text-slate-400">
                Source: {breakingNews[0].source} • Impact: <strong className="text-rose-400">{breakingNews[0].importance || "CRITICAL"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => setSelectedArticle(breakingNews[0])}
              className="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors whitespace-nowrap"
            >
              Analyze Event →
            </button>
          </div>
        </div>
      )}

      {/* Transparency Banner: Live vs Archive News */}
      {!isLiveNews && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            <span>
              <strong>● DEMONSTRATION ARCHIVE:</strong> Live financial news feed temporarily unavailable (External news API credentials not configured). Curated historical market events displayed with verified sentiment analysis.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0 uppercase">
            Curated Archive
          </span>
        </div>
      )}

      {/* Main Controls Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        {/* Navigation Mode Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
          <button
            onClick={() => setActiveTab("FEED")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "FEED"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            📰 Live Market News
          </button>
          <button
            onClick={() => setActiveTab("WATCHLIST")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "WATCHLIST"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            ⭐ News For You (Watchlist)
          </button>
          <button
            onClick={() => setActiveTab("CALENDAR")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "CALENDAR"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            📅 Economic Calendar
          </button>
        </div>

        {/* Global Digest & Alerts Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenDigest}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <span>📜</span>
            <span>Daily Digest</span>
          </button>

          <button
            onClick={() => setShowAlertsModal(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>🔔</span>
            <span>News Alerts</span>
          </button>

          {/* Auto Refresh Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 text-[11px]">Auto:</span>
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value={30} className="bg-slate-900">30s</option>
              <option value={60} className="bg-slate-900">1m</option>
              <option value={300} className="bg-slate-900">5m (Def)</option>
              <option value={900} className="bg-slate-900">15m</option>
              <option value={0} className="bg-slate-900">Manual</option>
            </select>

            <button
              onClick={() => fetchNews()}
              disabled={loading}
              title="Refresh Now"
              className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition-colors"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {/* Primary Category Filters Bar */}
      {activeTab === "FEED" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === c.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Secondary Search & Refinement Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search RELIANCE, NIFTY, RBI, Inflation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-semibold px-1">Sentiment:</span>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Sentiments</option>
                <option value="POSITIVE">🟢 Positive</option>
                <option value="NEUTRAL">🟡 Neutral</option>
                <option value="NEGATIVE">🔴 Negative</option>
              </select>
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-semibold px-1">Impact:</span>
              <select
                value={minImpact ?? ""}
                onChange={(e) => setMinImpact(e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="">Any Impact</option>
                <option value="70">🔥 High Impact (&gt;70)</option>
                <option value="85">⚡ Critical Only (&gt;85)</option>
              </select>
            </div>

            {/* Stale status & Timestamp */}
            <div className="flex items-center justify-end text-[11px] text-slate-400 pr-2">
              {isStale && (
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 mr-2">
                  STALE DATA
                </span>
              )}
              <span>Updated: {lastRefreshed.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Body per Active Tab */}
      {activeTab === "FEED" && (
        <>
          {loading && articles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4 space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-800 rounded w-full"></div>
                  <div className="h-16 bg-slate-800 rounded w-full"></div>
                  <div className="h-8 bg-slate-800 rounded w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-3xl">📰</span>
              <h3 className="text-sm font-bold text-white">No articles match your current filter</h3>
              <p className="text-xs text-slate-400">Try loosening your category, impact, or search keyword constraints.</p>
              <button
                onClick={() => {
                  setCategory("ALL");
                  setSentiment("ALL");
                  setMinImpact(undefined);
                  setSearchQuery("");
                }}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((art) => (
                <NewsArticleCard
                  key={art.id || art.content_hash}
                  article={art}
                  onOpenDetail={(a) => setSelectedArticle(a)}
                  onSelectSymbol={onSelectSymbol}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Watchlist News View (Section 16) */}
      {activeTab === "WATCHLIST" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>⭐</span> Personalized Watchlist Intelligence
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated real-time headlines tailored to your active watchlists
            </p>
          </div>

          {watchlistData && watchlistData.feed ? (
            <div className="space-y-6">
              {Object.entries(watchlistData.feed).map(([sym, group]: [string, any]) => (
                <div key={sym} className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-blue-400">${sym}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {group.article_count} new stories
                      </span>
                    </div>
                    {onSelectSymbol && (
                      <button
                        onClick={() => onSelectSymbol(sym)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Analyze {sym} →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(group.articles || []).map((art: any) => (
                      <NewsArticleCard
                        key={art.id || art.content_hash}
                        article={art}
                        onOpenDetail={(a) => setSelectedArticle(a)}
                        onSelectSymbol={onSelectSymbol}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
              Loading Watchlist Intelligence...
            </div>
          )}
        </div>
      )}

      {/* Economic Calendar Tab (Section 28) */}
      {activeTab === "CALENDAR" && <EconomicCalendarWidget />}

      {/* Modals */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSelectSymbol={onSelectSymbol}
        />
      )}

      {showDigestModal && (
        <DailyDigestModal
          digest={digestData}
          onClose={() => setShowDigestModal(false)}
          onRefresh={handleRefreshDigest}
          isGenerating={generatingDigest}
        />
      )}

      {showAlertsModal && (
        <NewsAlertsModal onClose={() => setShowAlertsModal(false)} />
      )}
    </div>
  );
}
