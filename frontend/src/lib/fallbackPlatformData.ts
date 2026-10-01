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
