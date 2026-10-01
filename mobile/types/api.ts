// ─── All TypeScript types for TradeGuardd mobile app ──────────────────────────
// Mirrors the backend API response shapes exactly

// ─── Signals & Analysis ───────────────────────────────────────────────────────

export type SignalType = 'BUY' | 'HOLD' | 'SELL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type SentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'BULLISH' | 'BEARISH';

export interface BlockchainReceipt {
  tx_hash?: string;
  ledger?: number;
  network?: string;
  status?: string;
  explorer_url?: string;
  contract_id?: string;
  timestamp?: string;
}

export interface Signal {
  signal_code: string;
  symbol: string;
  signal_type: SignalType;
  confidence: number;
  risk_score: RiskLevel;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  model_version?: string;
  strategy_hash?: string;
  signal_hash?: string;
  explanation?: string;
  blockchain?: BlockchainReceipt;
  status?: string;
  timestamp?: string;
}

export interface AnalysisResponse {
  symbol: string;
  ai_signal?: SignalType;
  confidence?: number;
  risk_level?: RiskLevel;
  summary?: string;
  indicators?: Record<string, number>;
  price_targets?: Record<string, number>;
  technical_levels?: Record<string, number>;
}

// ─── Market Data ──────────────────────────────────────────────────────────────

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  price?: number;
  change?: number;
  change_pct?: number;
  volume?: number;
  market_cap?: number;
  name?: string;
  symbol?: string;
}

export interface MarketDataResponse {
  symbol: string;
  timeframe: string;
  period: string;
  quote?: Quote;
  candles: Candle[];
  total_bars: number;
}

export interface Asset {
  symbol: string;
  name?: string;
  asset_type?: string;
  exchange?: string;
  currency?: string;
  price?: number;
  change_pct?: number;
}

export interface ScannerResult {
  symbol: string;
  signal?: string;
  score?: number;
  price?: number;
  change_pct?: number;
  name?: string;
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id?: number;
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  published_at?: string;
  sentiment?: SentimentType | string;
  sentiment_score?: number;
  category?: string;
  image_url?: string;
  symbols?: string[];
  impact_score?: number;
  importance?: string;
  is_breaking?: boolean;
  ai_summary?: string;
  ai_key_points?: string[];
  ai_reasoning?: string;
  affected_assets?: string[];
}

export interface NewsFeedResponse {
  articles: NewsArticle[];
  total?: number;
  total_count?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  is_stale?: boolean;
  last_updated?: string;
  source?: string;
}

// ─── Portfolio & Paper Trading ─────────────────────────────────────────────────

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  average_entry: number;
  current_price?: number;
  market_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
  stop_loss?: number;
  take_profit?: number;
  side?: string;
  ai_recommendation?: string;
}

export interface PortfolioSummary {
  total_value: number;
  cash_balance: number;
  initial_capital: number;
  total_pnl: number;
  total_pnl_pct: number;
  positions: PortfolioPosition[];
  open_positions_count: number;
  portfolio_exposure_pct: number;
  winning_positions: number;
  losing_positions: number;
}

export interface PaperTrade {
  id?: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  stop_loss?: number;
  take_profit?: number;
  status?: string;
  pnl?: number;
  timestamp?: string;
}

export interface PlaceOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stop_loss?: number;
  take_profit?: number;
}

// ─── Risk Management ──────────────────────────────────────────────────────────

export interface RiskPolicy {
  max_risk_per_trade_pct: number;
  max_daily_loss_pct: number;
  max_portfolio_exposure_pct: number;
  max_position_size_pct: number;
  max_open_positions: number;
  require_stop_loss: boolean;
  require_take_profit: boolean;
  circuit_breaker_active: boolean;
  current_exposure_pct?: number;
  open_positions_count?: number;
  capital_at_risk?: number;
}

export interface RiskCheckResult {
  approved: boolean;
  risk_level: RiskLevel;
  reasons: string[];
  position_size_recommended?: number;
  max_loss_estimated?: number;
}

// ─── Backtesting ──────────────────────────────────────────────────────────────

export interface BacktestRequest {
  symbol: string;
  strategy: string;
  period?: string;
  initial_capital?: number;
  start_date?: string;
  end_date?: string;
}

export interface BacktestResult {
  symbol?: string;
  strategy?: string;
  total_return_pct?: number;
  sharpe_ratio?: number;
  max_drawdown_pct?: number;
  win_rate_pct?: number;
  total_trades?: number;
  profit_factor?: number;
  final_capital?: number;
  initial_capital?: number;
  equity_curve?: number[];
  status?: string;
  job_id?: string;
  progress_pct?: number;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export interface Alert {
  id?: number;
  symbol: string;
  alert_type?: string;
  min_impact?: number;
  sentiment_filter?: string;
  threshold?: number;
  message?: string;
  is_active?: boolean;
  triggered_at?: string;
  created_at?: string;
}

// ─── Blockchain ────────────────────────────────────────────────────────────────

export interface BlockchainRecord {
  tx_hash?: string;
  ledger?: number;
  signal_code?: string;
  asset_symbol?: string;
  signal_type?: string;
  model_version?: string;
  strategy_hash?: string;
  signal_hash?: string;
  risk_level?: string;
  network?: string;
  explorer_url?: string;
  timestamp?: string;
  status?: string;
}

export interface BlockchainAuditResponse {
  network?: string;
  contract_id?: string;
  total_records?: number;
  records: BlockchainRecord[];
}

// ─── Copilot ──────────────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CopilotRequest {
  query: string;
  symbol_context?: string;
}

export interface CopilotResponse {
  response?: string;
  confidence?: number;
  sources?: string[];
}

// ─── Signal Fusion ────────────────────────────────────────────────────────────

export interface SignalFusion {
  symbol?: string;
  technical_signal?: SignalType;
  news_sentiment?: string;
  fused_action?: string;
  confidence?: number;
  confirmation_status?: string;
  explanation?: string;
}

// ─── Economic Calendar ────────────────────────────────────────────────────────

export interface EconomicEvent {
  event: string;
  date?: string;
  time?: string;
  impact?: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  currency?: string;
  affected_assets?: string[];
}

// ─── API Error ─────────────────────────────────────────────────────────────────

export interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  change_pct?: number;
  signal?: SignalType;
  confidence?: number;
  risk?: RiskLevel;
}
