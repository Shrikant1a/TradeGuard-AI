const DEFAULT_BACKEND = "http://127.0.0.1:8000";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== "undefined"
      ? ""
      : DEFAULT_BACKEND;

// In-flight promise deduplication map to prevent parallel identical requests
const inFlightRequests = new Map<string, Promise<any>>();

// Client-side lightweight query cache (stale-while-revalidate support)
const clientCache = new Map<string, { data: any; expiresAt: number }>();

export interface FetchOptions extends RequestInit {
  cacheTtlMs?: number; // Cache duration in milliseconds (0 = no cache)
  skipDedup?: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: FetchOptions,
  retryCount: number = 0
): Promise<T> {
  const method = (options?.method || "GET").toUpperCase();
  const cacheKey = `${method}:${endpoint}`;

  // Only GET requests are cached and deduplicated
  if (method === "GET") {
    const cached = clientCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }

    // Request Deduplication: If already in-flight, return the existing promise
    if (!options?.skipDedup && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)! as Promise<T>;
    }
  }

  const primaryUrl = `${API_BASE}${endpoint}`;

  const fetchPromise = (async (): Promise<T> => {
    try {
      const res = await fetch(primaryUrl, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });

      if (res.status === 429) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail ||
            "Rate limit reached. Please wait a few seconds before trying again."
        );
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || err.error || `API error ${res.status}`);
      }

      const data = await res.json();

      // Store in client cache if cacheTtlMs was specified or default for GET
      if (method === "GET") {
        const ttl = options?.cacheTtlMs ?? (endpoint.includes("/news") ? 60000 : 15000);
        if (ttl > 0) {
          clientCache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
        }
      }

      return data;
    } catch (error: any) {
      const isNetworkError =
        error instanceof TypeError ||
        (typeof error?.message === "string" &&
          error.message.includes("Failed to fetch"));

      // Fallback: If relative URL failed in browser, try direct backend URL
      if (isNetworkError && retryCount === 0 && API_BASE === "") {
        try {
          const directUrl = `${DEFAULT_BACKEND}${endpoint}`;
          const res = await fetch(directUrl, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...(options?.headers || {}),
            },
          });
          if (res.ok) {
            return await res.json();
          }
        } catch {
          // Fall through to retry
        }
      }

      // Single retry for transient connection while backend starts up
      if (isNetworkError && retryCount < 1) {
        await new Promise((r) => setTimeout(r, 600));
        return fetchApi<T>(endpoint, options, retryCount + 1);
      }

      console.warn(`API call failed for ${endpoint}:`, error.message);
      throw error;
    } finally {
      if (method === "GET") {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET" && !options?.skipDedup) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export const api = {
  // Cache invalidation utility
  invalidateCache: (pattern?: string) => {
    if (!pattern) {
      clientCache.clear();
    } else {
      for (const k of clientCache.keys()) {
        if (k.includes(pattern)) clientCache.delete(k);
      }
    }
  },

  // Health
  getHealth: () => fetchApi<any>("/api/health", { cacheTtlMs: 5000 }),

  // Assets & Market Data
  searchAssets: (q: string = "") =>
    fetchApi<any[]>(`/api/assets?q=${encodeURIComponent(q)}`, { cacheTtlMs: 60000 }),
  getMarketData: (symbol: string, timeframe: string = "1d", period: string = "6mo") =>
    fetchApi<any>(`/api/market-data/${symbol}?timeframe=${timeframe}&period=${period}`, {
      cacheTtlMs: 30000,
    }),

  // AI Analysis & Signals
  analyzeAsset: (symbol: string) =>
    fetchApi<any>(`/api/analysis/${symbol}`, { cacheTtlMs: 60000 }),
  generateSignal: (symbol: string) =>
    fetchApi<any>("/api/signals/generate", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    }),
  listSignals: (type?: string, risk?: string) => {
    let q = "";
    if (type) q += `signal_type=${type}&`;
    if (risk) q += `risk_score=${risk}`;
    return fetchApi<any[]>(`/api/signals?${q}`, { cacheTtlMs: 20000 });
  },

  // Market Scanner
  scanMarket: () => fetchApi<any[]>("/api/scanner", { cacheTtlMs: 30000 }),

  // Backtesting with Asynchronous Job Polling
  runBacktest: async (params: any, onProgress?: (pct: number, status: string) => void) => {
    const initRes = await fetchApi<any>("/api/backtest", {
      method: "POST",
      body: JSON.stringify(params),
    });

    // If result was served immediately from completed cache
    if (initRes.status === "COMPLETED" && (initRes.result || initRes.total_return_pct !== undefined)) {
      return initRes.result || initRes;
    }

    const jobId = initRes.job_id || initRes.id;
    if (!jobId) return initRes;

    // Poll background job queue until completed (max 40 polls * 600ms = 24s)
    let attempts = 0;
    while (attempts < 40) {
      await new Promise((r) => setTimeout(r, 600));
      attempts++;
      try {
        const poll = await fetchApi<any>(`/api/backtest/${jobId}`, { skipDedup: true, cacheTtlMs: 0 });
        if (onProgress && poll.progress_pct !== undefined) {
          onProgress(poll.progress_pct, poll.status);
        }
        if (poll.status === "COMPLETED") {
          return poll.result || poll;
        }
        if (poll.status === "FAILED") {
          throw new Error(poll.error || "Backtest execution failed");
        }
      } catch (err: any) {
        if (attempts >= 40) throw err;
      }
    }
    throw new Error("Backtest simulation timed out. Please try again.");
  },
  getBacktestById: (id: string) => fetchApi<any>(`/api/backtest/${id}`),

  // Paper Trading & Portfolio
  getPortfolio: () => fetchApi<any>("/api/portfolio"),
  createPaperTrade: (trade: {
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    stop_loss?: number;
    take_profit?: number;
  }) =>
    fetchApi<any>("/api/paper-trades", {
      method: "POST",
      body: JSON.stringify(trade),
    }),
  getTradeHistory: () => fetchApi<any[]>("/api/paper-trades/history"),
  resetPaperBalance: () =>
    fetchApi<any>("/api/paper-trades/reset", {
      method: "POST",
    }),

  // Risk Engine
  checkRisk: (params: any) =>
    fetchApi<any>("/api/risk/check", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  getRiskPolicy: () => fetchApi<any>("/api/risk/policy"),
  updateRiskPolicy: (policy: any) =>
    fetchApi<any>("/api/risk/policy", {
      method: "POST",
      body: JSON.stringify(policy),
    }),

  // Blockchain Audit (Stellar Soroban)
  listBlockchainRecords: () => fetchApi<any>("/api/blockchain/records"),
  verifySignalOnChain: (signalCode: string, signalHash: string) =>
    fetchApi<any>(`/api/blockchain/verify/${signalCode}?signal_hash=${signalHash}`),

  // Strategy Lab
  listStrategies: () => fetchApi<any[]>("/api/strategies"),
  saveStrategy: (strategy: any) =>
    fetchApi<any>("/api/strategies", {
      method: "POST",
      body: JSON.stringify(strategy),
    }),

  // Alerts
  getAlerts: () => fetchApi<any[]>("/api/alerts"),
  markAllAlertsRead: () => fetchApi<any>("/api/alerts/read-all", { method: "POST" }),

  // Webhooks
  getWebhookLogs: () => fetchApi<any[]>("/api/webhooks/tradingview/logs"),
  simulateTradingViewWebhook: (payload: any) =>
    fetchApi<any>("/api/webhooks/tradingview", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI Copilot
  chatWithCopilot: (query: string, symbolContext: string = "AAPL") =>
    fetchApi<any>("/api/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ query, symbol_context: symbolContext }),
    }),

  // Financial News Intelligence
  getNewsFeed: (params: {
    category?: string;
    symbol?: string;
    sentiment?: string;
    min_impact?: number;
    source?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.category && params.category !== "ALL") q.append("category", params.category);
    if (params.symbol) q.append("symbol", params.symbol);
    if (params.sentiment && params.sentiment !== "ALL") q.append("sentiment", params.sentiment);
    if (params.min_impact !== undefined) q.append("min_impact", params.min_impact.toString());
    if (params.source) q.append("source", params.source);
    if (params.search) q.append("search", params.search);
    if (params.page) q.append("page", params.page.toString());
    if (params.limit) q.append("limit", params.limit.toString());
    return fetchApi<any>(`/api/news?${q.toString()}`);
  },
  getLatestNews: (limit: number = 10, category?: string) => {
    let q = `limit=${limit}`;
    if (category && category !== "ALL") q += `&category=${category}`;
    return fetchApi<any[]>(`/api/news/latest?${q}`);
  },
  getBreakingNews: (limit: number = 5) => fetchApi<any[]>(`/api/news/breaking?limit=${limit}`),
  getMarketNews: (limit: number = 15) => fetchApi<any[]>(`/api/news/market?limit=${limit}`),
  getStockNews: (symbol: string, limit: number = 10) => fetchApi<any[]>(`/api/news/stock/${symbol}?limit=${limit}`),
  searchNews: (q: string, limit: number = 20) => fetchApi<any[]>(`/api/news/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  getArticleDetail: (id: number) => fetchApi<any>(`/api/news/${id}`),
  getArticleAnalysis: (id: number) => fetchApi<any>(`/api/news/${id}/analysis`),
  getTodayDigest: (digestType: string = "MORNING_BRIEF") => fetchApi<any>(`/api/news/digest/today?digest_type=${digestType}`),
  generateDailyDigest: (digestType: string = "MORNING_BRIEF") =>
    fetchApi<any>("/api/news/digest/generate", {
      method: "POST",
      body: JSON.stringify({ digest_type: digestType }),
    }),
  getSymbolSentiment: (symbol: string) => fetchApi<any>(`/api/news/sentiment/${symbol}`),
  getSymbolImpact: (symbol: string) => fetchApi<any>(`/api/news/impact/${symbol}`),
  getSignalFusion: (symbol: string) => fetchApi<any>(`/api/news/fusion/${symbol}`),
  getEconomicCalendar: () => fetchApi<any[]>("/api/news/economic-calendar"),
  getPortfolioNews: () => fetchApi<any>("/api/news/portfolio"),
  getWatchlistNews: () => fetchApi<any>("/api/news/watchlist"),
  getNewsAlerts: () => fetchApi<any[]>("/api/news/alerts"),
  createNewsAlert: (alert: { symbol: string; min_impact: number; sentiment_filter?: string }) =>
    fetchApi<any>("/api/news/alerts", {
      method: "POST",
      body: JSON.stringify(alert),
    }),
  deleteNewsAlert: (id: number) => fetchApi<any>(`/api/news/alerts/${id}`, { method: "DELETE" }),
  getNewsPreferences: () => fetchApi<any>("/api/news/preferences"),
  updateNewsPreferences: (prefs: any) =>
    fetchApi<any>("/api/news/preferences", {
      method: "POST",
      body: JSON.stringify(prefs),
    }),
  getDailyReport: () => fetchApi<any>("/api/news/report/daily"),
};

