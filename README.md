# TradeGuard AI

> **"AI-Powered Trading Intelligence with Blockchain-Verified Decisions"**

TradeGuard AI is an institutional-grade full-stack trading intelligence and paper trading platform. It analyzes financial assets using historical market data, multi-factor technical indicators, machine-learning ensembles, and a dedicated pre-trade risk engine—while publishing cryptographic proof of every trade signal onto the **Stellar Soroban** blockchain.

---

## ⚠️ Important Regulatory & Financial Notice

TradeGuard AI provides probabilistic market analysis, historical backtest estimates, research analytics, and simulated paper-trading tools. **It does not guarantee future performance or profits.** 

The system enforces strict probabilistic compliance:
- Never displays guarantees, "100% accuracy", or "risk-free" claims.
- Communicates in calibrated probabilistic language: *"Model estimates"*, *"Historical backtest result"*, *"Signal probability"*, *"Risk-adjusted signal"*.
- Built strictly for **Paper Trading and Research**. Real-money broker execution is disabled by default.

---

## The Trust Machine: Core Architecture

TradeGuard AI's core unique differentiator:
```
┌─────────────────┐
│   MARKET DATA   │ (Legitimate Provider Abstraction)
└────────┬────────┘
         ▼
┌─────────────────┐
│   AI ANALYSIS   │ (Logistic Regression, Random Forest, Gradient Boosting)
└────────┬────────┘
         ▼
┌─────────────────┐
│     SIGNAL      │ (BUY / HOLD / SELL with Probabilities & Calibrated Confidence)
└────────┬────────┘
         ▼
┌─────────────────┐
│   RISK ENGINE   │ (Mandatory Stop-Loss, Max 1% Risk, 40% Exposure, Circuit Breaker)
└────────┬────────┘
         ▼
┌─────────────────┐
│   PAPER TRADE   │ (Simulated Execution on Virtual ₹10,00,000 Capital)
└────────┬────────┘
         ▼
┌─────────────────┐
│ STELLAR SOROBAN │ (SHA-256 Hash Inscription into TradeGuardAudit Smart Contract)
└────────┬────────┘
         ▼
┌─────────────────┐
│ AUDITABLE PROOF │ (Immutable Public Ledger Verification Record)
└─────────────────┘
```

---

## Key Features

1. **Dashboard**: High-level terminal overview showing virtual portfolio value, today's P&L, risk exposure, open positions, top bullish/bearish assets, and recent blockchain verification events.
2. **AI Market Intelligence Banner**: Large focal component displaying asset price, directional probabilities, confidence, risk score, and transparent *"Why This Signal?"* explainable AI factors.
3. **Market Scanner**: Watchlist scanner evaluating trend, RSI, MACD, AI signal, confidence %, and risk profile across equities, crypto, and global indices.
4. **AI Stock Analyzer**: Deep technical indicator suite (SMA 20/50/200, EMA 20/50, RSI 14, MACD 12/26/9, Bollinger Bands 20/2, ATR 14, Support/Resistance, Market Regime).
5. **Asset Details**: Comprehensive fundamental and liquidity metrics.
6. **TradingView Chart**: Interactive advanced chart widget with embedded EMA, RSI, and MACD studies.
7. **AI Signals**: Real-time signal center with entry prices, dynamic ATR-based stop-loss and take-profit brackets, and instant Stellar proof inspection.
8. **Paper Trading Engine**: Virtual cash trading environment (default ₹10,00,000 INR) with pre-trade institutional risk validation.
9. **Portfolio Management**: Real-time unrealized/realized P&L, holdings, asset allocation donut chart, and risk exposure meter.
10. **Quantitative Backtesting**: Realistic simulation engine accounting for slippage (0.05%) and transaction commissions (0.03%). Computes Sharpe ratio, maximum drawdown, profit factor, win rate, equity curve, and monthly returns.
11. **Dedicated Risk Engine**: Intercepts and blocks orders violating safety policies (e.g. risk exceeding 1% / ₹10,000, missing stop-loss, max portfolio exposure > 40%, or active circuit breaker).
12. **Alerts Center**: Real-time notification hub for AI signals, volatility surges, risk triggers, and TradingView alert webhooks.
13. **Explainable AI (XAI)**: Visual breakdown of positive drivers, risk headwinds, and feature attribution weights.
14. **Stellar Soroban Blockchain Audit**: Immutable audit trail explorer displaying transaction hashes, ledger sequence numbers, and client-side SHA-256 verification.
15. **Strategy Lab**: Interactive parameter tuning (RSI bounds, EMA spans, ATR multipliers, risk %) with strategy versioning (v1.0, v1.1, v1.2) and cryptographic parameter hashing.
16. **TradeGuard Copilot**: Context-aware AI trading assistant answering natural language questions about active signals, portfolio risks, and reasons for blocked trades.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark Trading Terminal Theme with Glassmorphism)
- **Icons**: Lucide React
- **Charts**: Recharts & TradingView Advanced Chart Widget
- **API Client**: Modular typed Fetch service

### Backend
- **Framework**: Python 3.11 + FastAPI (Async REST API)
- **Validation**: Pydantic v2
- **Data & ML**: Pandas, NumPy, Scikit-learn (Logistic Regression, Random Forest, Gradient Boosting)
- **Database**: PostgreSQL (with automatic SQLite fallback via SQLAlchemy 2.0 Async + aiosqlite)
- **Caching**: In-Memory + Redis-ready architecture

### Blockchain Layer
- **Network**: Stellar Soroban (Smart Contracts)
- **Contract Language**: Rust (`contracts/trade_guard_audit`)
- **Verification**: SHA-256 cryptographic hashes of signals, strategies, and execution receipts.

---

## Project Structure

```
TradeGuard AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # Modular API endpoints
│   │   │       ├── assets.py
│   │   │       ├── market_data.py
│   │   │       ├── analysis.py
│   │   │       ├── signals.py
│   │   │       ├── backtest.py
│   │   │       ├── paper_trades.py
│   │   │       ├── portfolio.py
│   │   │       ├── risk.py
│   │   │       ├── webhooks.py
│   │   │       ├── blockchain.py
│   │   │       ├── strategies.py
│   │   │       ├── alerts.py
│   │   │       ├── copilot.py
│   │   │       └── scanner.py
│   │   ├── db/                  # Database models & async session factory
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── services/            # Core business logic engines
│   │   │   ├── market_data.py   # MarketDataProvider abstraction
│   │   │   ├── technical_analysis.py # Indicator calculations
│   │   │   ├── ai_engine.py     # Walk-forward ML pipeline
│   │   │   ├── explanation_engine.py # Explainable AI (XAI)
│   │   │   ├── risk_engine.py   # Institutional risk gatekeeper
│   │   │   ├── backtesting.py   # Historical simulation with costs
│   │   │   ├── paper_trading.py # Virtual portfolio & ledger
│   │   │   ├── stellar_service.py # Stellar Soroban blockchain client
│   │   │   └── copilot_service.py # Contextual AI assistant
│   │   ├── config.py            # Environment configuration
│   │   └── main.py              # FastAPI application entrypoint
│   ├── tests/
│   │   └── test_tradeguard.py   # Automated pytest unit & integration suite
│   └── requirements.txt
├── contracts/
│   └── trade_guard_audit/       # Stellar Soroban Rust smart contract
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs           # TradeGuardAudit smart contract implementation
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css      # Dark trading terminal theme styles
│   │   │   ├── layout.tsx       # Root layout & SEO meta tags
│   │   │   └── page.tsx         # Full 16-view single-page trading terminal
│   │   ├── components/          # Reusable UI components
│   │   │   ├── AIMarketIntelligenceBanner.tsx
│   │   │   ├── BlockchainFlowDiagram.tsx
│   │   │   ├── FinancialDisclaimer.tsx
│   │   │   ├── TradingViewWidget.tsx
│   │   │   ├── PaperTradeModal.tsx
│   │   │   ├── BlockchainVerifyModal.tsx
│   │   │   └── CopilotDrawer.tsx
│   │   └── lib/
│   │       └── api.ts           # Typed API service
│   ├── package.json
│   └── tsconfig.json
├── pinescript/
│   └── TradeGuard_AI_Strategy.pine # Production-ready Pine Script v5 strategy
├── .env.example
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- Rust & Cargo (optional, for compiling Soroban contracts)

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
pip install greenlet
```

Run tests to ensure everything is operating cleanly:
```bash
python -m pytest tests/test_tradeguard.py -v
```

Launch the FastAPI backend server:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run build
npm run dev
```
Open your browser at `http://localhost:3000` to access TradeGuard AI.

---

## Stellar Soroban Smart Contract

The `TradeGuardAudit` smart contract is written in Rust using `soroban-sdk` and records minimal verification metadata on-chain to maximize efficiency and privacy:

```rust
pub struct SignalRecord {
    pub signal_id: String,
    pub asset: String,
    pub signal_type: String,       // BUY / HOLD / SELL
    pub timestamp: u64,
    pub model_version: String,     // e.g. "TradeGuard-v1.2"
    pub strategy_hash: String,     // SHA-256 of strategy hyperparameters
    pub signal_hash: String,       // SHA-256 of signal payload
    pub risk_level: String,        // LOW / MEDIUM / HIGH
    pub user_reference_hash: String,
    pub is_verified: bool,
}
```

### Compiling and Testing Contract:
```bash
cargo check --manifest-path contracts/trade_guard_audit/Cargo.toml --jobs 1
```

---

## TradingView Webhook Integration

TradeGuard AI exposes an authenticated endpoint for TradingView strategy alerts:
- **Endpoint**: `POST /api/webhooks/tradingview`
- **Payload Format**:
```json
{
  "symbol": "{{ticker}}",
  "price": "{{close}}",
  "volume": "{{volume}}",
  "time": "{{time}}",
  "signal": "BUY",
  "source": "tradingview"
}
```
When an alert arrives, the system validates the payload, produces an immutable SHA-256 record, and logs the event in the **Alerts Center**.

An example production Pine Script v5 strategy is included in:
`pinescript/TradeGuard_AI_Strategy.pine`

---

## Risk Management Methodology

Before any paper order is executed, the **TradeGuard Risk Engine** evaluates:
1. **Max Risk per Trade**: Capped at 1.0% (₹10,000 on a default ₹10,00,000 account).
2. **Mandatory Stop-Loss & Take-Profit**: Orders without predefined risk brackets are blocked.
3. **Max Portfolio Exposure**: Total open market value cannot exceed 40% of equity.
4. **Max Open Positions**: Capped at 5 concurrent assets.
5. **Emergency Circuit Breaker**: One-click kill switch to halt all trading.

---

## Model Validation & AI Pipeline

- **Data Leakage Prevention**: Uses strictly chronological walk-forward splits (70% train / 15% validation / 15% test). Never randomly shuffles time series data.
- **Model Comparison**: Automatically trains and evaluates **Logistic Regression**, **Random Forest**, and **Gradient Boosting**, selecting the highest F1-score model.
- **Probabilistic Targets**: Classifies 5-day directional movement (`BULLISH`, `NEUTRAL`, `BEARISH`) rather than claiming exact future price prediction.

---

## License

MIT License. Designed and built for research and paper trading.
