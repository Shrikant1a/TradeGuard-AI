/**
 * Platform Fallback Data for TradeGuard AI
 * Provides verified alerts, webhook receipts, and audit records
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
    symbol: "AAPL",
    alert_type: "AI_BUY_SIGNAL",
    title: "AI Model BUY Confirmation: AAPL",
    message: "Ensemble model confirmed BUY signal with 72% confidence. Fast EMA crossed above Slow EMA with volume expansion.",
    severity: "SUCCESS",
    is_read: false,
    timestamp: "12m ago"
  },
  {
    id: 2,
    symbol: "NVDA",
    alert_type: "HIGH_VOLATILITY",
    title: "Elevated Volatility Warning: NVDA",
    message: "ATR Daily Volatility surged to 3.8%. Stop-loss bracket widened dynamically to mitigate whipsaws.",
    severity: "WARNING",
    is_read: false,
    timestamp: "45m ago"
  },
  {
    id: 3,
    symbol: "PORTFOLIO",
    alert_type: "RISK_ENGINE_POLICY",
    title: "Pre-Trade Risk Policy Check Passed",
    message: "Portfolio exposure is at 32%, well within your safe threshold of 40%.",
    severity: "INFO",
    is_read: true,
    timestamp: "2h ago"
  },
  {
    id: 4,
    symbol: "TSLA",
    alert_type: "TRADINGVIEW_WEBHOOK",
    title: "TradingView Webhook Received: TSLA",
    message: "Pine Script Strategy triggered Alert Condition with SHA-256 blockchain verification receipt.",
    severity: "INFO",
    is_read: true,
    timestamp: "4h ago"
  }
];

export const FALLBACK_WEBHOOKS: WebhookLog[] = [
  {
    id: 1,
    symbol: "AAPL",
    signal: "BUY",
    price: 224.23,
    volume: 42000000.0,
    source: "tradingview",
    received_at: new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
    blockchain_verified: true,
    stellar_tx_hash: "e8a93f1bc479d20c58e7b41f8021c97a45df62b109e4a3b7c85e291f038d4a92",
    status: "PROCESSED"
  },
  {
    id: 2,
    symbol: "NVDA",
    signal: "BUY",
    price: 128.50,
    volume: 68000000.0,
    source: "tradingview",
    received_at: new Date(Date.now() - 75 * 60 * 1000).toLocaleString(),
    blockchain_verified: true,
    stellar_tx_hash: "f47b2c91834e021a8c954e7d1b3294c73081e62a1b94e803c7d620581f4a9b1c",
    status: "PROCESSED"
  }
];

export const FALLBACK_SIGNALS = [
  {
    id: 1042,
    signal_code: "TG-1042",
    symbol: "AAPL",
    signal_type: "BUY",
    confidence: 76.5,
    risk_score: "LOW",
    current_price: 230.51,
    stop_loss: 222.10,
    take_profit: 247.30,
    risk_reward_ratio: 2.1,
    model_version: "Ensemble-v2.4",
    signal_hash: "sha256_82f1b4a9c017d45e",
    created_at: "10m ago"
  },
  {
    id: 1041,
    signal_code: "TG-1041",
    symbol: "NVDA",
    signal_type: "BUY",
    confidence: 82.0,
    risk_score: "LOW",
    current_price: 128.50,
    stop_loss: 121.20,
    take_profit: 143.80,
    risk_reward_ratio: 2.2,
    model_version: "Ensemble-v2.4",
    signal_hash: "sha256_71e42c98d023b12f",
    created_at: "35m ago"
  },
  {
    id: 1040,
    signal_code: "TG-1040",
    symbol: "TSLA",
    signal_type: "BUY",
    confidence: 68.0,
    risk_score: "MEDIUM",
    current_price: 254.10,
    stop_loss: 242.00,
    take_profit: 279.50,
    risk_reward_ratio: 2.1,
    model_version: "Ensemble-v2.4",
    signal_hash: "sha256_19a4b873c52e104d",
    created_at: "1h ago"
  },
  {
    id: 1039,
    signal_code: "TG-1039",
    symbol: "MSFT",
    signal_type: "HOLD",
    confidence: 64.0,
    risk_score: "LOW",
    current_price: 448.90,
    stop_loss: 438.00,
    take_profit: 471.00,
    risk_reward_ratio: 2.0,
    model_version: "Ensemble-v2.4",
    signal_hash: "sha256_94b7c2a1e085f33e",
    created_at: "2h ago"
  },
  {
    id: 1038,
    signal_code: "TG-1038",
    symbol: "BTC-USD",
    signal_type: "BUY",
    confidence: 79.0,
    risk_score: "MEDIUM",
    current_price: 94150.00,
    stop_loss: 90800.00,
    take_profit: 101200.00,
    risk_reward_ratio: 2.1,
    model_version: "Ensemble-v2.4",
    signal_hash: "sha256_5a3c9b78e124d67f",
    created_at: "3h ago"
  },
  {
    id: 1037,
    signal_code: "TG-1037",
    symbol: "RELIANCE.NS",
    signal_type: "BUY",
    confidence: 74.0,
    risk_score: "LOW",
    current_price: 2980.50,
    stop_loss: 2890.00,
    take_profit: 3170.00,
    risk_reward_ratio: 2.1,
    model_version: "Ensemble-v2.4",
    signal_hash: "sha256_3b8a1c94d072e55b",
    created_at: "4h ago"
  }
];

export const FALLBACK_SCANNER = [
  {
    symbol: "AAPL",
    price: 230.51,
    change_pct: 1.42,
    signal: "BUY",
    confidence: 76.5,
    volume: "48.2M",
    rsi: 58.4,
    sector: "Technology"
  },
  {
    symbol: "NVDA",
    price: 128.50,
    change_pct: 2.85,
    signal: "BUY",
    confidence: 82.0,
    volume: "74.1M",
    rsi: 63.1,
    sector: "Semiconductors"
  },
  {
    symbol: "TSLA",
    price: 254.10,
    change_pct: 3.10,
    signal: "BUY",
    confidence: 68.0,
    volume: "62.4M",
    rsi: 61.2,
    sector: "Automotive"
  },
  {
    symbol: "MSFT",
    price: 448.90,
    change_pct: 0.65,
    signal: "HOLD",
    confidence: 64.0,
    volume: "21.0M",
    rsi: 52.8,
    sector: "Technology"
  },
  {
    symbol: "BTC-USD",
    price: 94150.00,
    change_pct: 4.12,
    signal: "BUY",
    confidence: 79.0,
    volume: "34.5B",
    rsi: 66.8,
    sector: "Crypto"
  },
  {
    symbol: "RELIANCE.NS",
    price: 2980.50,
    change_pct: 1.15,
    signal: "BUY",
    confidence: 74.0,
    volume: "6.2M",
    rsi: 57.3,
    sector: "Energy"
  }
];

export const FALLBACK_PORTFOLIO = {
  total_equity: 1087450.0,
  virtual_cash: 680000.0,
  total_market_value: 320000.0,
  realized_pnl: 12450.0,
  unrealized_pnl: 7500.0,
  portfolio_exposure_pct: 32.0,
  positions: [
    {
      id: 1,
      symbol: "AAPL",
      side: "BUY",
      quantity: 50,
      entry_price: 220.15,
      current_price: 230.51,
      unrealized_pnl: 518.0,
      pnl_pct: 4.71,
      stop_loss: 215.0,
      take_profit: 245.0
    },
    {
      id: 2,
      symbol: "NVDA",
      side: "BUY",
      quantity: 80,
      entry_price: 122.40,
      current_price: 128.50,
      unrealized_pnl: 488.0,
      pnl_pct: 4.98,
      stop_loss: 118.0,
      take_profit: 140.0
    }
  ],
  allocations: [
    { name: "US Tech", value: 45, color: "#06b6d4" },
    { name: "Semiconductors", value: 30, color: "#8b5cf6" },
    { name: "Cash Reserve", value: 25, color: "#10b981" }
  ]
};

export const FALLBACK_RISK_POLICY = {
  max_portfolio_risk_pct: 40.0,
  max_single_trade_risk_pct: 2.0,
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
      asset: "AAPL",
      symbol: "AAPL",
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
      signal_code: "TG-NVDA-1043",
      asset: "NVDA",
      symbol: "NVDA",
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
    name: "Multi-Factor Ensemble Alpha",
    version: "v2.4",
    win_rate: 68.4,
    sharpe_ratio: 1.92,
    max_drawdown: 8.4,
    active: true
  },
  {
    id: 2,
    name: "Mean Reversion Volatility Bracket",
    version: "v1.8",
    win_rate: 62.1,
    sharpe_ratio: 1.65,
    max_drawdown: 10.2,
    active: true
  }
];
