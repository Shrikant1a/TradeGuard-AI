import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  marketApi, signalApi, newsApi, portfolioApi,
  riskApi, backtestApi, alertsApi, blockchainApi, copilotApi,
} from '@/services/api';
import type { BacktestRequest, PlaceOrderRequest } from '@/types/api';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QK = {
  signals: (type?: string, risk?: string) => ['signals', type, risk],
  marketData: (symbol: string, tf: string, period: string) => ['market-data', symbol, tf, period],
  analysis: (symbol: string) => ['analysis', symbol],
  topMovers: () => ['top-movers'],
  news: (params: any) => ['news', params],
  latestNews: (limit: number, category?: string) => ['news-latest', limit, category],
  breakingNews: (limit: number) => ['news-breaking', limit],
  stockNews: (symbol: string) => ['news-stock', symbol],
  sentiment: (symbol: string) => ['sentiment', symbol],
  portfolio: () => ['portfolio'],
  tradeHistory: () => ['trade-history'],
  riskPolicy: () => ['risk-policy'],
  alerts: () => ['alerts'],
  newsAlerts: () => ['news-alerts'],
  blockchain: () => ['blockchain'],
  strategies: () => ['strategies'],
  economicCalendar: () => ['economic-calendar'],
  digest: (type: string) => ['digest', type],
  fusion: (symbol: string) => ['fusion', symbol],
  health: () => ['health'],
  assets: (q: string) => ['assets', q],
};

// ─── Market Data Hooks ────────────────────────────────────────────────────────

export function useMarketData(symbol: string, timeframe = '1d', period = '6mo') {
  return useQuery({
    queryKey: QK.marketData(symbol, timeframe, period),
    queryFn: () => marketApi.getMarketData(symbol, timeframe, period),
    staleTime: 30_000,
    retry: 2,
    enabled: !!symbol,
  });
}

export function useTopMovers() {
  return useQuery({
    queryKey: QK.topMovers(),
    queryFn: () => marketApi.getTopMovers(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAnalysis(symbol: string) {
  return useQuery({
    queryKey: QK.analysis(symbol),
    queryFn: () => marketApi.analyzeAsset(symbol),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

export function useAssetSearch(q: string) {
  return useQuery({
    queryKey: QK.assets(q),
    queryFn: () => marketApi.searchAssets(q),
    staleTime: 60_000,
    enabled: q.length >= 1,
  });
}

// ─── Signal Hooks ─────────────────────────────────────────────────────────────

export function useSignals(type?: string, risk?: string) {
  return useQuery({
    queryKey: QK.signals(type, risk),
    queryFn: () => signalApi.listSignals(type, risk),
    staleTime: 20_000,
    retry: 2,
  });
}

export function useGenerateSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) => signalApi.generateSignal(symbol),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['signals'] }),
  });
}

export function useSignalFusion(symbol: string) {
  return useQuery({
    queryKey: QK.fusion(symbol),
    queryFn: () => signalApi.getSignalFusion(symbol),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

// ─── News Hooks ───────────────────────────────────────────────────────────────

export function useNewsFeed(params: {
  category?: string; symbol?: string; sentiment?: string;
  min_impact?: number; search?: string; page?: number; limit?: number;
} = {}) {
  return useQuery({
    queryKey: QK.news(params),
    queryFn: () => newsApi.getNewsFeed(params),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useLatestNews(limit = 10, category?: string) {
  return useQuery({
    queryKey: QK.latestNews(limit, category),
    queryFn: () => newsApi.getLatestNews(limit, category),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useBreakingNews(limit = 5) {
  return useQuery({
    queryKey: QK.breakingNews(limit),
    queryFn: () => newsApi.getBreakingNews(limit),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useStockNews(symbol: string) {
  return useQuery({
    queryKey: QK.stockNews(symbol),
    queryFn: () => newsApi.getStockNews(symbol),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

export function useSymbolSentiment(symbol: string) {
  return useQuery({
    queryKey: QK.sentiment(symbol),
    queryFn: () => newsApi.getSymbolSentiment(symbol),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

export function useEconomicCalendar() {
  return useQuery({
    queryKey: QK.economicCalendar(),
    queryFn: () => newsApi.getEconomicCalendar(),
    staleTime: 300_000,
  });
}

export function useTodayDigest(digestType = 'MORNING_BRIEF') {
  return useQuery({
    queryKey: QK.digest(digestType),
    queryFn: () => newsApi.getTodayDigest(digestType),
    staleTime: 300_000,
  });
}

// ─── Portfolio Hooks ──────────────────────────────────────────────────────────

export function usePortfolio() {
  return useQuery({
    queryKey: QK.portfolio(),
    queryFn: () => portfolioApi.getPortfolio(),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useTradeHistory() {
  return useQuery({
    queryKey: QK.tradeHistory(),
    queryFn: () => portfolioApi.getTradeHistory(),
    staleTime: 30_000,
  });
}

export function usePlaceTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: PlaceOrderRequest) => portfolioApi.placeTrade(order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.portfolio() });
      qc.invalidateQueries({ queryKey: QK.tradeHistory() });
    },
  });
}

export function useResetBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => portfolioApi.resetBalance(),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.portfolio() }),
  });
}

// ─── Risk Hooks ───────────────────────────────────────────────────────────────

export function useRiskPolicy() {
  return useQuery({
    queryKey: QK.riskPolicy(),
    queryFn: () => riskApi.getRiskPolicy(),
    staleTime: 60_000,
  });
}

export function useCheckRisk() {
  return useMutation({
    mutationFn: (params: {
      symbol: string; side: string; quantity: number;
      price: number; stop_loss?: number;
    }) => portfolioApi.checkRisk(params),
  });
}

// ─── Alerts Hooks ─────────────────────────────────────────────────────────────

export function useAlerts() {
  return useQuery({
    queryKey: QK.alerts(),
    queryFn: () => alertsApi.getAlerts(),
    staleTime: 30_000,
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.deleteAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.alerts() }),
  });
}

// ─── Backtesting Hooks ────────────────────────────────────────────────────────

export function useStrategies() {
  return useQuery({
    queryKey: QK.strategies(),
    queryFn: () => backtestApi.getStrategies(),
    staleTime: 300_000,
  });
}

export function useRunBacktest() {
  return useMutation({
    mutationFn: ({
      params,
      onProgress,
    }: {
      params: BacktestRequest;
      onProgress?: (pct: number, status: string) => void;
    }) => backtestApi.runBacktest(params, onProgress),
  });
}

// ─── Blockchain Hooks ─────────────────────────────────────────────────────────

export function useBlockchainAudit() {
  return useQuery({
    queryKey: QK.blockchain(),
    queryFn: () => blockchainApi.getAuditRecords(),
    staleTime: 60_000,
  });
}

// ─── Copilot Hook ─────────────────────────────────────────────────────────────

export function useCopilotChat() {
  return useMutation({
    mutationFn: ({ query, context }: { query: string; context?: string }) =>
      copilotApi.chat(query, context),
  });
}
