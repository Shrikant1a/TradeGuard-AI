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

## 📖 Complete Step-by-Step User Guide

> For the in-depth manual covering all 16 views, mathematical formulas, and advanced workflows, see **[USER_GUIDE.md](./USER_GUIDE.md)**.

### Quick Start (How to Run Everything)

1. **Start the Backend API Server**:
   ```bash
   npm run backend
   ```
   *Runs the FastAPI server on `http://127.0.0.1:8000` and initializes the database.*
   *Interactive API Swagger documentation is available at `http://127.0.0.1:8000/docs`.*

2. **Start the Frontend Web Terminal**:
   ```bash
   npm run dev
   ```
   *Launches the Next.js trading terminal on `http://localhost:3000`.*

3. **Open the Terminal**:
   Navigate to **`http://localhost:3000`** in your browser.

---

### Step-by-Step: How to Use the Website

1. **Auto-Moving Ticker Tape**: View live streaming prices and percentage changes for global assets at the top of the terminal.
2. **Search Assets**: Type any ticker (e.g., `AAPL`, `NVDA`, `TSLA`, `BTC-USD`, `RELIANCE.NS`) in the top search bar and hit Enter to immediately load technical indicators, chart data, and AI signals.
3. **Inspect AI Signals & XAI**: Check the **AI Market Intelligence Banner** for directional probabilities (*Bullish / Neutral / Bearish*), walk-forward confidence %, dynamic ATR brackets, and explainable AI (*Why This Signal?*) factor breakdowns.
4. **Place a Paper Trade**:
   - Click **"New Paper Trade"** to open the order modal.
   - Enter your quantity and verify your Stop-Loss and Take-Profit brackets.
   - The **Pre-Trade Risk Engine** automatically verifies that your trade risk does not exceed 1% of account capital (₹10,000 on the ₹10,00,000 virtual balance).
   - Click **"Submit Order"** to execute simulated paper trade.
5. **Manage Portfolio**:
   - Switch to the **Portfolio** tab to track live unrealized/realized P&L and asset allocation.
   - Click **"Close Position"** on any open asset to immediately lock in profits/losses.
6. **Run Quantitative Backtests**:
   - In the **Backtesting** tab, select any asset, date range, and fee settings.
   - Click **"Run Backtest Simulation"** to view equity curves, Sharpe ratio, win rate, and max drawdown.
7. **Verify on Stellar Blockchain**:
   - Navigate to the **Blockchain Audit** tab.
   - Click **"Verify Proof"** on any signal to inspect its cryptographic SHA-256 hash and on-chain Stellar Soroban smart contract receipt.
8. **Consult the AI Copilot**:
   - Click the floating **AI Copilot** button at the bottom-right corner.
   - Ask natural language questions like *"Why is AAPL bullish?"*, *"Check my portfolio risk"*, or *"Why was my order rejected?"*.

---

### Step-by-Step: How to Use the TradingView Bot & Webhooks

1. Open [`pinescript/TradeGuard_AI_Strategy.pine`](./pinescript/TradeGuard_AI_Strategy.pine).
2. In TradingView, open the **Pine Editor** at the bottom, paste the code, and click **"Add to chart"**.
3. Create a TradingView Alert:
   - Condition: `TradeGuard AI Strategy`
   - Check **Webhook URL**: Enter `https://your-domain/api/webhooks/tradingview`
   - Paste the JSON message payload:
     ```json
     {
       "symbol": "{{ticker}}",
       "price": {{close}},
       "volume": {{volume}},
       "time": "{{time}}",
       "signal": "{{strategy.order.action}}",
       "source": "tradingview",
       "secret": "tradeguard-secure-token"
     }
     ```
4. TradingView will automatically send webhook signals to TradeGuard AI, triggering risk verification and logging directly into your Alerts Center and blockchain audit ledger.

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

## 🛠️ Architecture Guide: Where and What Can We Use?

This reference explains **where every part of the system lives**, **what technology is used**, and **how you can use and configure it**.

### 📊 Quick Component Matrix

| Layer | Directory / File | Tech Stack | Port / URL | How to Run / Use |
|---|---|---|---|---|
| **Frontend** | [`frontend/`](./frontend) | Next.js 16, TypeScript, Tailwind CSS, Recharts | `http://localhost:3000` | `npm run dev` |
| **Backend** | [`backend/`](./backend) | Python 3.11, FastAPI, Pydantic v2, Scikit-learn | `http://127.0.0.1:8000` | `npm run backend` |
| **Database (Default)** | [`tradeguard.db`](./tradeguard.db) | SQLite via `SQLAlchemy 2.0 Async` + `aiosqlite` | File on disk | Automatic (zero setup needed) |
| **Database (Production)** | `DATABASE_URL` | PostgreSQL via `asyncpg` | Port `5432` | Set `DATABASE_URL` in `.env` |
| **Speed Cache** | `REDIS_URL` | Redis / In-Memory Fallback | Port `6379` | Optional (falls back to memory) |
| **REST API & Swagger** | [`backend/app/api/`](./backend/app/api) | FastAPI Async Router | `http://127.0.0.1:8000/docs` | Interactive Swagger UI in browser |
| **Blockchain** | [`contracts/trade_guard_audit/`](./contracts/trade_guard_audit) | Stellar Soroban Smart Contract (Rust) | Stellar Testnet RPC | `cargo check` / On-chain hashing |
| **Trading Bot** | [`pinescript/`](./pinescript) | Pine Script v5 Strategy | TradingView SuperCharts | Add to TradingView + Webhook |

---

### 1. 🖥️ Frontend (Web Terminal)
- **Directory**: [`frontend/`](./frontend)
- **What it uses**:
  - **Framework**: Next.js 16 (App Router with Turbopack)
  - **Language**: TypeScript
  - **Styling**: Tailwind CSS v4 with custom dark trading terminal theme, cyberpunk glassmorphism, and neon glow accents
  - **Typography**: Google Fonts **Orbitron** (`font-logo`), **Rajdhani**, and **Space Grotesk**
  - **Charts**: Recharts (price trends, portfolio allocation) & TradingView advanced charting widget
  - **Icons**: Lucide React
  - **Animation**: Continuous floating shield emblem, radar beacon waves, metallic shimmer sweep, and cinematic intro splash screen
- **How to use**:
  ```bash
  # From project root:
  npm run dev
  # Then open http://localhost:3000
  ```
- **What you can use here**:
  - Live auto-moving ticker tape for real-time market quotes
  - Search or switch between 10+ global stocks & cryptos (`AAPL`, `NVDA`, `TSLA`, `BTC-USD`, `ETH-USD`, `RELIANCE.NS`, etc.)
  - Interactive **"How to Use"** guide with 8 chapters and FAQ
  - Simulated **Paper Trading** with virtual ₹10,00,000 capital
  - Historical backtesting simulations and on-chain blockchain proof inspection

---

### 2. ⚙️ Backend (AI Engine & Risk Gatekeeper)
- **Directory**: [`backend/`](./backend)
- **What it uses**:
  - **Framework**: Python 3.11 + FastAPI (Asynchronous REST API)
  - **Machine Learning**: Scikit-learn (Walk-forward Logistic Regression, Random Forest, and Gradient Boosting ensembles)
  - **Data Processing**: Pandas, NumPy, yfinance (live market candles)
  - **Pre-Trade Risk Engine**: Mandatory Stop-Loss validator, 1% capital risk gatekeeper, 40% exposure cap, and Emergency Circuit Breaker
  - **Explainable AI (XAI)**: Feature attribution scores explaining why signals are generated
  - **News Intelligence**: Alpha Vantage, GNews, Google News RSS, and NLP sentiment scoring
- **How to use**:
  ```bash
  # From project root:
  npm run backend
  # Server starts on http://127.0.0.1:8000
  ```

---

### 3. 🗄️ Database Architecture
- **Configuration File**: [`backend/app/config.py`](./backend/app/config.py)
- **Database Engine**: [`backend/app/db/database.py`](./backend/app/db/database.py)
- **Data Models**: [`backend/app/db/models.py`](./backend/app/db/models.py)
- **What databases you can use**:
  1. **SQLite (`aiosqlite`) — Default for Local Development**:
     - Connection: `sqlite+aiosqlite:///./tradeguard.db`
     - Created automatically on startup as [`tradeguard.db`](./tradeguard.db) in the project root.
     - Zero configuration required.
  2. **PostgreSQL (`asyncpg`) — Recommended for Production**:
     - Connection: `postgresql+asyncpg://user:password@localhost:5432/tradeguard_db`
     - Simply set the `DATABASE_URL` environment variable in `.env`.
     - Supports high-concurrency connection pooling.
  3. **Redis — Speed Cache**:
     - Connection: `REDIS_URL=redis://localhost:6379/0`
     - Used for caching news sentiment and streaming quotes. If Redis is not available, automatically falls back to in-memory caching.
- **What tables are stored**:
  - `users`: User profiles, credentials, risk parameters.
  - `assets`: Tradable assets, exchanges, sectors.
  - `market_data`: Historical and cached OHLCV candle records.
  - `signals`: Generated AI signals, directional probabilities, and ATR brackets.
  - `portfolios` & `positions`: Virtual cash balances, holdings, and P&L.
  - `paper_trades`: Virtual order execution logs and fills.
  - `risk_policies`: Configured risk rules (max risk %, max exposure %, circuit breaker).
  - `alerts` & `webhook_logs`: TradingView alert webhooks and risk trigger logs.

---

### 4. 🌐 REST API & Webhooks
- **Interactive Documentation**: Available at **`http://127.0.0.1:8000/docs`** (Swagger UI) and `http://127.0.0.1:8000/redoc`.
- **Key API Routes**:
  - `GET /api/assets` — Lists supported equities, cryptos, and indices.
  - `GET /api/market-data/{symbol}` — OHLCV historical candle bars.
  - `GET /api/analysis/{symbol}` — Technical indicators, regime, AI signal & XAI factors.
  - `GET /api/signals` — Active AI trade signals with ATR stop-loss and take-profit.
  - `POST /api/paper-trades` — Validates order via Risk Engine and executes virtual trade.
  - `GET /api/portfolio` — Realized/unrealized P&L, holdings, equity balance.
  - `POST /api/backtest` — Runs walk-forward historical simulation with slippage/fees.
  - `GET /api/blockchain/records` — Fetches verified on-chain trade records.
  - `POST /api/webhooks/tradingview` — Authenticated listener for external TradingView alerts.

---

### 5. ⛓️ Blockchain Layer (Stellar Soroban)
- **Directory**: [`contracts/trade_guard_audit/`](./contracts/trade_guard_audit)
- **What it uses**:
  - **Smart Contract Language**: Rust with `soroban-sdk = "21.0.0"`
  - **Target Network**: Stellar Testnet (`https://soroban-testnet.stellar.org`)
- **What it does**:
  - Solves the "hindsight bias" problem common in trading bots.
  - The moment an AI signal is generated, a **SHA-256 cryptographic hash** of the signal, model version, and strategy parameters is inscribed into the `TradeGuardAudit` smart contract.
  - Anyone can audit a signal on the public ledger to verify that the prediction was made *before* the subsequent price movement occurred.
- **Testing Contract**:
  ```bash
  cargo check --manifest-path contracts/trade_guard_audit/Cargo.toml --jobs 1
  ```

---

### 6. 🤖 Trading Bot (TradingView Pine Script)
- **Script Location**: [`pinescript/TradeGuard_AI_Strategy.pine`](./pinescript/TradeGuard_AI_Strategy.pine)
- **What it does**:
  - A Pine Script v5 strategy implementing EMA trend detection, RSI momentum filters, and ATR volatility brackets.
  - Can be added directly to any TradingView chart.
  - Configurable to send automated webhook alert POST requests directly to your TradeGuard AI backend (`/api/webhooks/tradingview`).

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

## 🐳 Docker Setup & Production Architecture

TradeGuard AI is fully containerized with a production-grade multi-container architecture separating the user-facing HTTP API, autonomous background workers, and caching engine.

### System Architecture

```
                    TradeGuard AI
                         │
              ┌──────────┴──────────┐
              │                     │
         Next.js Frontend       FastAPI Backend
              │                     │
            Vercel                Docker
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                       Redis                Worker
                    Upstash/Redis          Docker
                                               │
                                  ┌────────────┼────────────┐
                                  │            │            │
                                 AI          News       Backtesting
                              Analysis     Processing     Jobs
```

```
User
  │
  ▼
Next.js / Vercel
  │
  ▼
FastAPI / Docker  ────────►  Stellar / Soroban  ────────►  Blockchain Audit
  │
  ▼
Redis / Upstash
  │
  ▼
Background Workers / Docker
  │
  ▼
AI + News + Backtesting
  │
  ▼
Supabase PostgreSQL
```

---

### Managed Production Services

| Component | Technology | Recommended Host | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (React 19) | **Vercel** | Responsive web trading terminal & SSR |
| **Backend API** | FastAPI / Python 3.11 | **Docker** (Fly.io / AWS ECS / Render) | REST API, inference endpoints, webhooks |
| **Worker** | Python 3.11 Worker | **Docker** (Fly.io / AWS ECS / Render) | Autonomous news ingestion & batch jobs |
| **Database** | PostgreSQL 16 | **Supabase** | Persistent storage with connection pooling |
| **Cache** | Redis 7 / TLS | **Upstash** | Low-latency response caching & rate limits |
| **Audit Ledger** | Soroban Smart Contracts | **Stellar Testnet / Mainnet** | Cryptographic proof of AI trade decisions |
| **Charts** | TradingView Advanced | **TradingView CDN** | Interactive charts & technical indicators |
| **Telemetry** | Sentry SDK | **Sentry** | Distributed error tracking & tracing |

---

### 1. Requirements

- **Docker**: Engine version `24.0+` or **Docker Desktop**
- **Docker Compose**: Version `v2.20+`
- **RAM**: Minimum 2 GB (4 GB recommended for concurrent AI inference)
- **Node.js** (Optional for local frontend): `v18.0+`

---

### 2. Environment Configuration

Copy the example configuration file:
```bash
cp .env.example .env
```

Key environment variables to configure:
```env
# Database (Supabase PostgreSQL in production, or SQLite volume in local Docker)
DATABASE_URL="postgresql+asyncpg://postgres:[PASS]@[HOST]:5432/postgres"

# Redis Cache (Upstash Redis in production, or local Docker service)
REDIS_URL="rediss://default:[TOKEN]@[HOST].upstash.io:6379"

# Security & CORS
SECRET_KEY="generate-a-secure-random-64-character-jwt-key"
CORS_ORIGINS="http://localhost:3000,https://tradeguard-ai.vercel.app"
RUN_EMBEDDED_WORKER=false

# Optional Monitoring
SENTRY_DSN=""
```

---

### 3. Docker Commands Reference

#### Build Images
Build the backend API and worker image from source:
```bash
docker compose build
```

Or build the API image standalone:
```bash
docker build -t tradeguard-api backend/
```

#### Start Services
Start the full local container stack in the foreground:
```bash
docker compose up
```

Start the stack detached in the background:
```bash
docker compose up -d
```

Start with local PostgreSQL enabled (instead of Supabase or SQLite):
```bash
docker compose --profile postgres up -d
```

#### Rebuild and Restart
Rebuild images and recreate containers:
```bash
docker compose up --build -d
```

#### Stop Services
Gracefully stop containers while preserving database and cache volumes:
```bash
docker compose down
```

Stop and purge persistent storage volumes:
```bash
docker compose down -v
```

---

### 4. Viewing Logs

Stream unified logs across all containers:
```bash
docker compose logs -f
```

Stream API server logs only:
```bash
docker compose logs -f api
```

Stream background worker logs only:
```bash
docker compose logs -f worker
```

Stream Redis cache logs:
```bash
docker compose logs -f redis
```

---

### 5. Health Checks & Monitoring

The containerized FastAPI backend provides dual health check endpoints:

1. **Liveness Probe** (`GET /health`):
   - Fast, non-blocking check used by Docker and Kubernetes orchestrators.
   - Response: `{"status": "ok", "app": "TradeGuard AI", "version": "1.2.0"}`

2. **Readiness Probe** (`GET /health/ready` or `GET /api/health`):
   - Deep inspection checking Database connectivity, Redis cache latency, Circuit Breaker status, and worker heartbeats.
   - Response includes comprehensive component health metrics:
   ```json
   {
     "status": "healthy",
     "app": "TradeGuard AI",
     "components": {
       "database": { "status": "UP", "latency_ms": 7.52 },
       "cache": { "status": "UP", "backend": "redis", "hit_ratio_pct": 82.5 },
       "circuit_breakers": { "market_data": { "state": "CLOSED" }, ... },
       "job_queue": { "active_jobs": 0, "completed_jobs": 14 }
     }
   }
   ```

---

### 6. Autonomous Worker Architecture

When deployed in Docker:
- **`api` Container**: Sets `RUN_EMBEDDED_WORKER=false` and dedicates all CPU and memory resources to serving incoming HTTP/REST requests, market scanner queries, and real-time inference at sub-10ms response latencies.
- **`worker` Container**: Runs `backend.app.worker` as an independent daemon. It autonomously pulls financial news from external providers, performs NLP sentiment analysis, refreshes the Daily Market Digest, and records heartbeats in Redis (`worker:heartbeat`).
- **Resilience**: If the background worker encounters external provider rate limits, its built-in circuit breaker temporarily halts external polling and serves cached news without impacting the API server.

---

### 7. Frontend Connection (Vercel to Docker Backend)

The Next.js frontend is configured to connect to your Dockerized FastAPI backend dynamically:
- Set `NEXT_PUBLIC_API_URL` in your Vercel project environment settings:
  ```env
  NEXT_PUBLIC_API_URL=https://api.your-tradeguard-domain.com
  BACKEND_INTERNAL_URL=https://api.your-tradeguard-domain.com
  ```
- All client-side fetch calls in `frontend/src/lib/api.ts` and Next.js server-side rewrites in `frontend/next.config.ts` will route traffic seamlessly to the Docker API.

---

### 8. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 8000 already in use** | A local Python server or previous container is running | Stop the local server or change port mapping in `docker-compose.yml` (`- "8001:8000"`) |
| **Redis connection refused** | Redis container not healthy or incorrect URL | Ensure `redis` service is up: `docker compose ps`. In Docker Compose, use `redis://redis:6379/0` |
| **Supabase SSL / dialect error** | Using standard `postgres://` or `postgresql://` | Handled automatically in `backend/app/db/database.py`, which normalizes URLs to `postgresql+asyncpg://` |
| **Worker reports no news** | News provider API key unconfigured | Set `NEWS_PROVIDER=demo` in `.env` for deterministic mock news data, or provide a valid `ALPHAVANTAGE_API_KEY` |

---

## License

MIT License. Designed and built for research and paper trading.

