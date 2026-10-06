/**
 * Platform Fallback Data for TradeGuard AI
 * Provides verified alerts, webhook receipts, and audit records
 * formatted for Indian Financial Markets (INR ₹, NSE/BSE)
 * when the backend API is unreachable or during client-side testing.
 */

export interface PlatformAlert {
  id: number;
  symbol: string;
  alert_type: string;
  title: string;
  message: string;
  severity: "SUCCESS" | "WARNING" | "INFO";
  is_read: boolean;
  timestamp: string;
}

export interface WebhookLog {
  id: number;
  symbol: string;
  signal: string;
  price: number;
  volume: number;
  source: string;
  received_at: string;
  blockchain_verified: boolean;
  stellar_tx_hash: string;
  status: string;
}

export const FALLBACK_ALERTS: PlatformAlert[] = [
  {
    id: 1,
    symbol: "RELIANCE",
    alert_type: "AI_BUY_SIGNAL",
    title: "AI Model BUY Confirmation: RELIANCE",
    message: "Ensemble model confirmed BUY signal on NSE with 76% confidence. Fast EMA crossed above Slow EMA with expanding institutional volume.",
    severity: "SUCCESS",
    is_read: false,
    timestamp: "12m ago"
  },
  {
    id: 2,
    symbol: "TCS",
    alert_type: "HIGH_VOLATILITY",
    title: "Elevated Volatility Warning: TCS",
    message: "ATR Daily Volatility surged to 2.4%. Dynamic stop-loss bracket widened to mitigation bracket to prevent whipsaw exits.",
    severity: "WARNING",
    is_read: false,
    timestamp: "45m ago"
  },
  {
    id: 3,
    symbol: "PORTFOLIO",
    alert_type: "RISK_ENGINE_POLICY",
    title: "Pre-Trade Risk Policy Check Passed",
    message: "Portfolio exposure is at 32%, well within your safe threshold of 40% (₹4,00,000 on ₹10,00,000 virtual equity).",
    severity: "INFO",
    is_read: true,
    timestamp: "2h ago"
  },
  {
    id: 4,
    symbol: "INFY",
    alert_type: "TRADINGVIEW_WEBHOOK",
    title: "TradingView Webhook Received: INFY",
    message: "Pine Script Strategy triggered Alert Condition with SHA-256 blockchain verification receipt.",
    severity: "INFO",
    is_read: true,
    timestamp: "4h ago"
  }
];

export const FALLBACK_WEBHOOKS: WebhookLog[] = [
  {
    id: 1,
    symbol: "RELIANCE",
    signal: "BUY",
    price: 2850.50,
    volume: 6800000.0,
    source: "tradingview",
    received_at: new Date(Date.now() - 15 * 60 * 1000).toLocaleString("en-IN"),
    blockchain_verified: true,
    stellar_tx_hash: "514e656dafa3493bc95dad5fe206a500bb72fdcef60abeaca0a72109051b63a4",
    status: "PROCESSED"
  },
  {
    id: 2,
    symbol: "TCS",
    signal: "BUY",
    price: 4210.00,
    volume: 2400000.0,
    source: "tradingview",
    received_at: new Date(Date.now() - 75 * 60 * 1000).toLocaleString("en-IN"),
    blockchain_verified: true,
    stellar_tx_hash: "e0ba1da640244728d286e7d6eda281b8f644806870a97cdc2aa304af45fb0257",
    status: "PROCESSED"
  }
];

export const FALLBACK_SIGNALS = [
  {
    id: 1042,
    signal_code: "TG-1042",
    symbol: "RELIANCE",
    signal_type: "BUY",
    confidence: 78.4,
    risk_score: "LOW",
    current_price: 1190.50,
    stop_loss: 1148.83,
    take_profit: 1279.79,
    risk_reward_ratio: 2.1,
    model_version: "TradeGuard-v1.2",
    signal_hash: "8a623b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d906",
    created_at: "10m ago"
  },
  {
    id: 1041,
    signal_code: "TG-1041",
    symbol: "TCS",
    signal_type: "BUY",
    confidence: 82.0,
    risk_score: "LOW",
    current_price: 2110.00,
    stop_loss: 2036.15,
    take_profit: 2268.25,
    risk_reward_ratio: 2.1,
    model_version: "TradeGuard-v1.2",
    signal_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    created_at: "35m ago"
  },
  {
    id: 1040,
    signal_code: "TG-1040",
    symbol: "INFY",
    signal_type: "BUY",
    confidence: 74.0,
    risk_score: "LOW",
    current_price: 1025.00,
    stop_loss: 989.13,
    take_profit: 1101.88,
    risk_reward_ratio: 2.1,
    model_version: "TradeGuard-v1.2",
    signal_hash: "sha256_19a4b873c52e104d",
    created_at: "1h ago"
  },
  {
    id: 1039,
    signal_code: "TG-1039",
    symbol: "HDFCBANK",
    signal_type: "HOLD",
    confidence: 68.0,
    risk_score: "LOW",
    current_price: 710.45,
    stop_loss: 685.58,
    take_profit: 749.52,
    risk_reward_ratio: 1.6,
    model_version: "TradeGuard-v1.2",
    signal_hash: "sha256_94b7c2a1e085f33e",
    created_at: "2h ago"
  },
  {
    id: 1038,
    signal_code: "TG-1038",
    symbol: "SBIN",
    signal_type: "BUY",
    confidence: 76.0,
    risk_score: "LOW",
    current_price: 958.00,
    stop_loss: 924.47,
    take_profit: 1029.85,
    risk_reward_ratio: 2.1,
    model_version: "TradeGuard-v1.2",
    signal_hash: "sha256_5a3c9b78e124d67f",
    created_at: "3h ago"
  }
];

export const FALLBACK_SCANNER = [
  {
    symbol: "RELIANCE",
    price: 1190.50,
    change_pct: 1.15,
    signal: "BUY",
    confidence: 78.4,
    volume: "6.8M",
    rsi: 58.4,
    sector: "Energy"
  },
  {
    symbol: "TCS",
    price: 2110.00,
    change_pct: 0.85,
    signal: "BUY",
    confidence: 82.0,
    volume: "2.4M",
    rsi: 61.2,
    sector: "Technology"
  },
  {
    symbol: "INFY",
    price: 1025.00,
    change_pct: 0.62,
    signal: "BUY",
    confidence: 74.0,
    volume: "4.8M",
    rsi: 56.1,
    sector: "Technology"
  },
  {
    symbol: "HDFCBANK",
    price: 710.45,
    change_pct: 0.80,
    signal: "HOLD",
    confidence: 68.0,
    volume: "8.1M",
    rsi: 51.3,
    sector: "Banking"
  },
  {
    symbol: "ICICIBANK",
    price: 1331.00,
    change_pct: 1.45,
    signal: "BUY",
    confidence: 77.0,
    volume: "5.5M",
    rsi: 59.8,
    sector: "Banking"
  },
  {
    symbol: "SBIN",
    price: 958.00,
    change_pct: 1.10,
    signal: "BUY",
    confidence: 76.0,
    volume: "12.0M",
    rsi: 62.4,
    sector: "Public Banking"
  }
];

export const FALLBACK_PORTFOLIO = {
  total_equity: 1087450.0,
  virtual_cash: 680000.0,
  total_market_value: 407450.0,
  realized_pnl: 12450.0,
  unrealized_pnl: 7500.0,
  portfolio_exposure_pct: 37.5,
  currency: "INR",
  currency_symbol: "₹",
  positions: [
    {
      id: 1,
      symbol: "RELIANCE",
      side: "BUY",
      quantity: 150,
      entry_price: 1175.00,
      current_price: 1190.50,
      unrealized_pnl: 2325.0,
      pnl_pct: 1.32,
      stop_loss: 1148.83,
      take_profit: 1279.79
    },
    {
      id: 2,
      symbol: "TCS",
      side: "BUY",
      quantity: 50,
      entry_price: 2080.00,
      current_price: 2110.00,
      unrealized_pnl: 1500.0,
      pnl_pct: 1.44,
      stop_loss: 2036.15,
      take_profit: 2268.25
    },
    {
      id: 3,
      symbol: "HDFCBANK",
      side: "BUY",
      quantity: 100,
      entry_price: 704.80,
      current_price: 710.45,
      unrealized_pnl: 565.0,
      pnl_pct: 0.80,
      stop_loss: 685.58,
      take_profit: 749.52
    }
  ],
  allocations: [
    { name: "Reliance (Energy)", value: 35, color: "#06b6d4" },
    { name: "IT Sector (TCS/INFY)", value: 27, color: "#8b5cf6" },
    { name: "Virtual Cash Reserve", value: 38, color: "#10b981" }
  ]
};

export const FALLBACK_RISK_POLICY = {
  max_portfolio_risk_pct: 40.0,
  max_single_trade_risk_pct: 1.0,
  max_drawdown_limit_pct: 10.0,
  default_stop_loss_pct: 3.5,
  default_take_profit_pct: 7.0,
  safe_mode_enabled: true,
  circuit_breaker_active: false
};

export const FALLBACK_BLOCKCHAIN_RECORDS = {
  total_records: 2,
  verified_count: 2,
  network: "Stellar Testnet",
  contract_id: "CAKWQF4XR6QHLSOWHSS7YOU5Z5VTEDUBPT3C37JVDOFWUPQKPWPU53SO",
  records: [
    {
      id: 1042,
      signal_code: "TG-1042",
      asset: "RELIANCE",
      symbol: "RELIANCE",
      signal_type: "BUY",
      confidence: 78.4,
      model_version: "TradeGuard-v1.2",
      signal_hash: "8a623b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d906",
      stellar_tx_hash: "514e656dafa3493bc95dad5fe206a500bb72fdcef60abeaca0a72109051b63a4",
      tx_hash: "514e656dafa3493bc95dad5fe206a500bb72fdcef60abeaca0a72109051b63a4",
      stellar_ledger_seq: 5031649,
      verification_status: "VERIFIED",
      network: "TESTNET",
      contract_id: "CAKWQF4XR6QHLSOWHSS7YOU5Z5VTEDUBPT3C37JVDOFWUPQKPWPU53SO",
      explorer_url: "https://stellar.expert/explorer/testnet/tx/514e656dafa3493bc95dad5fe206a500bb72fdcef60abeaca0a72109051b63a4",
      timestamp: "Confirmed On-Chain",
      verified: true
    },
    {
      id: 1043,
      signal_code: "TG-TCS-1043",
      asset: "TCS",
      symbol: "TCS",
      signal_type: "BUY",
      confidence: 82.5,
      model_version: "TradeGuard-v1.2",
      signal_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      stellar_tx_hash: "e0ba1da640244728d286e7d6eda281b8f644806870a97cdc2aa304af45fb0257",
      tx_hash: "e0ba1da640244728d286e7d6eda281b8f644806870a97cdc2aa304af45fb0257",
      stellar_ledger_seq: 5031676,
      verification_status: "VERIFIED",
      network: "TESTNET",
      contract_id: "CAKWQF4XR6QHLSOWHSS7YOU5Z5VTEDUBPT3C37JVDOFWUPQKPWPU53SO",
      explorer_url: "https://stellar.expert/explorer/testnet/tx/e0ba1da640244728d286e7d6eda281b8f644806870a97cdc2aa304af45fb0257",
      timestamp: "Confirmed On-Chain",
      verified: true
    }
  ]
};

export const FALLBACK_STRATEGIES = [
  {
    id: 1,
    name: "Indian Equities Alpha Momentum",
    version: "v2.4",
    win_rate: 68.4,
    sharpe_ratio: 1.92,
    max_drawdown: 8.4,
    active: true
  },
  {
    id: 2,
    name: "NIFTY/SENSEX Mean Reversion",
    version: "v1.8",
    win_rate: 62.1,
    sharpe_ratio: 1.65,
    max_drawdown: 10.2,
    active: true
  }
];
