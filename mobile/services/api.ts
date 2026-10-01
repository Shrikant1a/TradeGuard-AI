import { apiClient } from './apiClient';
import type {
  Signal, MarketDataResponse, AnalysisResponse, Asset, ScannerResult,
  NewsFeedResponse, NewsArticle, PortfolioSummary, PaperTrade, PlaceOrderRequest,
  RiskPolicy, RiskCheckResult, BacktestRequest, BacktestResult,
  Alert, BlockchainAuditResponse, BlockchainRecord, CopilotRequest,
  CopilotResponse, SignalFusion, EconomicEvent,
} from '@/types/api';

// ─── Market Data ──────────────────────────────────────────────────────────────

export const marketApi = {
  getMarketData: (symbol: string, timeframe = '1d', period = '6mo') =>
    apiClient.get<MarketDataResponse>(`/api/market-data/${symbol}`, {
      params: { timeframe, period },
    }).then(r => r.data),

  searchAssets: (q: string) =>
    apiClient.get<Asset[]>('/api/assets', { params: { q } }).then(r => r.data),

  getTopMovers: () =>
    apiClient.get<ScannerResult[]>('/api/scanner').then(r => r.data),

  analyzeAsset: (symbol: string) =>
    apiClient.get<AnalysisResponse>(`/api/analysis/${symbol}`).then(r => r.data),
};

// ─── Signals ──────────────────────────────────────────────────────────────────

export const signalApi = {
  listSignals: (signal_type?: string, risk_score?: string) =>
    apiClient.get<Signal[]>('/api/signals', {
      params: { signal_type, risk_score },
    }).then(r => r.data),

  generateSignal: (symbol: string) =>
    apiClient.post<Signal>('/api/signals/generate', { symbol }).then(r => r.data),

  getSignalFusion: (symbol: string) =>
    apiClient.get<SignalFusion>(`/api/news/fusion/${symbol}`).then(r => r.data),
};

// ─── News ─────────────────────────────────────────────────────────────────────

export const newsApi = {
  getNewsFeed: (params: {
    category?: string; symbol?: string; sentiment?: string;
    min_impact?: number; search?: string; page?: number; limit?: number;
  } = {}) =>
    apiClient.get<NewsFeedResponse>('/api/news', { params }).then(r => r.data),

  getLatestNews: (limit = 10, category?: string) =>
    apiClient.get<NewsArticle[]>('/api/news/latest', { params: { limit, category } }).then(r => r.data),

  getBreakingNews: (limit = 5) =>
    apiClient.get<NewsArticle[]>('/api/news/breaking', { params: { limit } }).then(r => r.data),

  getStockNews: (symbol: string, limit = 10) =>
    apiClient.get<NewsArticle[]>(`/api/news/stock/${symbol}`, { params: { limit } }).then(r => r.data),

  searchNews: (q: string, limit = 20) =>
    apiClient.get<NewsArticle[]>('/api/news/search', { params: { q, limit } }).then(r => r.data),

  getArticleDetail: (id: number) =>
    apiClient.get<NewsArticle>(`/api/news/${id}`).then(r => r.data),

  getSymbolSentiment: (symbol: string) =>
    apiClient.get<any>(`/api/news/sentiment/${symbol}`).then(r => r.data),

  getEconomicCalendar: () =>
    apiClient.get<EconomicEvent[]>('/api/news/economic-calendar').then(r => r.data),

  getTodayDigest: (digest_type = 'MORNING_BRIEF') =>
    apiClient.get<any>('/api/news/digest/today', { params: { digest_type } }).then(r => r.data),

  getPortfolioNews: () =>
    apiClient.get<any>('/api/news/portfolio').then(r => r.data),

  getNewsAlerts: () =>
    apiClient.get<Alert[]>('/api/news/alerts').then(r => r.data),

  createNewsAlert: (alert: { symbol: string; min_impact: number; sentiment_filter?: string }) =>
    apiClient.post<Alert>('/api/news/alerts', alert).then(r => r.data),

  deleteNewsAlert: (id: number) =>
    apiClient.delete<any>(`/api/news/alerts/${id}`).then(r => r.data),
};

// ─── Portfolio & Paper Trading ─────────────────────────────────────────────────

export const portfolioApi = {
  getPortfolio: () =>
    apiClient.get<PortfolioSummary>('/api/portfolio').then(r => r.data),

  getTradeHistory: () =>
    apiClient.get<PaperTrade[]>('/api/paper-trades/history').then(r => r.data),

  placeTrade: (order: PlaceOrderRequest) =>
    apiClient.post<PaperTrade>('/api/paper-trades', order).then(r => r.data),

  resetBalance: () =>
    apiClient.post<any>('/api/paper-trades/reset').then(r => r.data),

  checkRisk: (params: {
    symbol: string; side: string; quantity: number;
    price: number; stop_loss?: number;
  }) =>
    apiClient.post<RiskCheckResult>('/api/risk/check', params).then(r => r.data),
};

// ─── Risk Management ──────────────────────────────────────────────────────────

export const riskApi = {
  getRiskPolicy: () =>
    apiClient.get<RiskPolicy>('/api/risk/policy').then(r => r.data),

  updateRiskPolicy: (policy: Partial<RiskPolicy>) =>
    apiClient.post<any>('/api/risk/policy', policy).then(r => r.data),
};

// ─── Backtesting ──────────────────────────────────────────────────────────────

export const backtestApi = {
  runBacktest: async (
    params: BacktestRequest,
    onProgress?: (pct: number, status: string) => void
  ): Promise<BacktestResult> => {
    const initRes = await apiClient.post<BacktestResult>('/api/backtest', params).then(r => r.data);

    if (initRes.status === 'COMPLETED' && initRes.total_return_pct !== undefined) {
      return initRes;
    }

    const jobId = initRes.job_id;
    if (!jobId) return initRes;

    // Poll until complete (max 40 × 600ms = 24s)
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 600));
      const poll = await apiClient.get<BacktestResult>(`/api/backtest/${jobId}`).then(r => r.data);
      if (onProgress && poll.progress_pct !== undefined) {
        onProgress(poll.progress_pct, poll.status || '');
      }
      if (poll.status === 'COMPLETED') return poll;
      if (poll.status === 'FAILED') throw new Error('Backtest failed');
    }
    throw new Error('Backtest timed out');
  },

  getStrategies: () =>
    apiClient.get<string[]>('/api/strategies').then(r => r.data),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const alertsApi = {
  getAlerts: () =>
    apiClient.get<Alert[]>('/api/alerts').then(r => r.data),

  createAlert: (alert: { symbol: string; alert_type: string; threshold?: number }) =>
    apiClient.post<Alert>('/api/alerts', alert).then(r => r.data),

  deleteAlert: (id: number) =>
    apiClient.delete<any>(`/api/alerts/${id}`).then(r => r.data),

  markAllRead: () =>
    apiClient.post<any>('/api/alerts/read-all').then(r => r.data),
};

// ─── Blockchain Audit ─────────────────────────────────────────────────────────

export const blockchainApi = {
  getAuditRecords: () =>
    apiClient.get<BlockchainAuditResponse>('/api/blockchain/records').then(r => r.data),

  verifySignal: (signalCode: string, signalHash: string) =>
    apiClient.get<any>(`/api/blockchain/verify/${signalCode}`, {
      params: { signal_hash: signalHash },
    }).then(r => r.data),
};

// ─── AI Copilot ───────────────────────────────────────────────────────────────

export const copilotApi = {
  chat: (query: string, symbol_context = 'AAPL') =>
    apiClient.post<CopilotResponse>('/api/copilot/chat', {
      query,
      symbol_context,
    }).then(r => r.data),
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () =>
    apiClient.get<any>('/api/health').then(r => r.data),
};
