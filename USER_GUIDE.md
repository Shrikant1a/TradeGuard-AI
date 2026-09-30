# 📖 TradeGuard AI: Complete Step-by-Step User Manual

Welcome to **TradeGuard AI** — an institutional-grade, full-stack trading intelligence platform, automated Pine Script bot, and simulated paper-trading terminal backed by **Stellar Soroban** blockchain verification.

This guide provides a comprehensive, step-by-step tutorial on how to use every feature of the website, configure the trading bot, execute risk-controlled paper trades, and interact with the AI Copilot.

---

## 📑 Table of Contents

1. [Architecture & Overview](#1-architecture--overview)
2. [Quickstart: Launching the Platform](#2-quickstart-launching-the-platform)
3. [How to Use the Website & Trading Terminal](#3-how-to-use-the-website--trading-terminal)
   - [3.1 Navigation & Workspace Layout](#31-navigation--workspace-layout)
   - [3.2 Live Market Ticker Tape](#32-live-market-ticker-tape)
   - [3.3 Searching & Analyzing Any Asset](#33-searching--analyzing-any-asset)
   - [3.4 Reading the AI Market Intelligence Banner](#34-reading-the-ai-market-intelligence-banner)
   - [3.5 Technical Indicator Suite & Charting](#35-technical-indicator-suite--charting)
   - [3.6 Market Scanner (Finding Opportunities)](#36-market-scanner-finding-opportunities)
   - [3.7 Placing a Paper Trade (Virtual Money)](#37-placing-a-paper-trade-virtual-money)
   - [3.8 Portfolio Management & Tracking](#38-portfolio-management--tracking)
   - [3.9 Running Quantitative Backtests](#39-running-quantitative-backtests)
   - [3.10 Strategy Lab (Tuning Parameters)](#310-strategy-lab-tuning-parameters)
   - [3.11 Financial News & Signal Fusion Intelligence](#311-financial-news--signal-fusion-intelligence)
   - [3.12 Stellar Soroban Blockchain Audit Trail](#312-stellar-soroban-blockchain-audit-trail)
   - [3.13 Emergency Circuit Breaker](#313-emergency-circuit-breaker)
4. [How to Use the TradingView Bot & Webhooks](#4-how-to-use-the-tradingview-bot--webhooks)
   - [4.1 Setting Up the Pine Script v5 Strategy](#41-setting-up-the-pine-script-v5-strategy)
   - [4.2 Configuring Strategy Inputs](#42-configuring-strategy-inputs)
   - [4.3 Configuring Automated Webhook Alerts](#43-configuring-automated-webhook-alerts)
5. [How to Use the AI Copilot](#5-how-to-use-the-ai-copilot)
6. [Institutional Risk Engine Rules](#6-institutional-risk-engine-rules)
7. [Troubleshooting & FAQ](#7-troubleshooting--faq)

---

## 1. Architecture & Overview

TradeGuard AI is built around a **"Trust Machine"** philosophy. Unlike black-box trading bots that make bold, unverified claims, TradeGuard AI enforces:
- **Calibrated Probabilistic AI**: Predicts directional probability (*Bullish / Neutral / Bearish*) with transparent F1 confidence scoring.
- **Explainable AI (XAI)**: Displays the exact technical, volume, and momentum factors driving each signal.
- **Hard Institutional Risk Controls**: Blocks high-risk orders before execution (mandatory stop-loss, max 1% capital risk per trade, 40% total portfolio exposure limit).
- **Stellar Soroban Blockchain Inscription**: Hashes every generated signal and strategy state with SHA-256 and records it on-chain to eliminate hindsight bias.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Market Data   │ ────► │  AI & Technical │ ────► │ Calibrated Buy/ │
│  (Real-Time)    │       │     Ensemble    │       │   Sell Signals  │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
                                                             ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Stellar Soroban │ ◄──── │   Paper Trade   │ ◄──── │ Pre-Trade Risk  │
│ Blockchain Hash │       │    Execution    │       │ Gatekeeper (1%) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 2. Quickstart: Launching the Platform

### Prerequisites
- **Node.js**: version 18+ ([nodejs.org](https://nodejs.org))
- **Python**: version 3.10 or 3.11 ([python.org](https://www.python.org))
- **Git**: Installed and configured

### Step 1: Open Terminal in the Project Root
```bash
cd "s:\TradeGuard AI"
```

### Step 2: Start the FastAPI Backend
Open a terminal window and run:
```bash
npm run backend
```
> Alternatively, using Python directly:
> ```bash
> .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
> ```
*The backend server will start on `http://127.0.0.1:8000` and automatically initialize the database schema.*
*Interactive API Swagger documentation is available at `http://127.0.0.1:8000/docs`.*

### Step 3: Start the Next.js Frontend
Open a second terminal window and run:
```bash
npm run dev
```
*The frontend terminal will launch at `http://localhost:3000`.*

### Step 4: Open TradeGuard in Your Browser
Navigate to **`http://localhost:3000`**. You are now in the TradeGuard AI command center.

---

## 3. How to Use the Website & Trading Terminal

### 3.1 Navigation & Workspace Layout
The trading terminal contains:
- **Left Sidebar**: Fast navigation between 16 dedicated tabs:
  - 📊 **Dashboard**: High-level portfolio, market pulse, and quick actions.
  - 🎯 **AI Signals**: Active buy/sell recommendations with risk brackets.
  - 🔍 **Market Scanner**: Watchlist filter sorting by AI confidence and trend.
  - 📈 **Stock Analyzer**: In-depth technical breakdown and indicator values.
  - 💼 **Portfolio**: Open positions, cash balance, and realized P&L.
  - 🧪 **Backtesting**: Multi-year historical strategy backtesting.
  - 🛡️ **Risk Center**: Safety rule configuration and portfolio exposure metrics.
  - 📰 **News Intelligence**: Multi-source financial news and macroeconomic calendar.
  - ⛓️ **Blockchain Audit**: Public cryptographic ledger verifying signal authenticity.
  - ⚙️ **Strategy Lab**: Tuning technical weights and risk parameters.
  - 🔔 **Alerts Hub**: TradingView webhooks and price volatility notifications.
- **Top Bar**: Search bar for instant asset switching, network health badge, and circuit breaker toggle.
- **Bottom/Floating Copilot**: Quick-access AI assistant ready to explain any market event.

---

### 3.2 Live Market Ticker Tape
At the top of the terminal, you will see a continuous, automatically moving market ticker tape powered by TradingView.
- Displays live prices, net price change, and percentage change for global assets (Apple, NVIDIA, Tesla, Microsoft, Alphabet, Amazon, Meta, Bitcoin, Ethereum, Reliance, TCS, Gold, S&P 500).
- **Interaction**: Clicking any symbol on the ticker tape or hovering lets you inspect the real-time quote.

---

### 3.3 Searching & Analyzing Any Asset
1. Locate the **Search Bar** in the top navigation bar.
2. Type any standard ticker symbol (e.g., `AAPL`, `NVDA`, `TSLA`, `MSFT`, `BTC-USD`, `ETH-USD`, `RELIANCE.NS`).
3. Press **Enter**.
4. The entire terminal instantly updates:
   - The **AI Market Intelligence Banner** recalculates directional probabilities.
   - The **Technical Indicator Suite** updates SMA, EMA, RSI, MACD, and Bollinger Bands.
   - The **Interactive Chart** loads the new symbol with price overlays.

---

### 3.4 Reading the AI Market Intelligence Banner
The focal card at the top of the dashboard displays the AI analysis for the selected asset:
1. **Signal Verdict**: `BULLISH (BUY)`, `BEARISH (SELL)`, or `NEUTRAL (HOLD)`.
2. **Directional Probabilities**: 
   - A calibrated probability split (e.g., 68% Bullish / 20% Neutral / 12% Bearish).
3. **Model Confidence**: F1-score derived from walk-forward testing.
4. **Target & Risk Brackets**:
   - **Entry Price**: Recommended entry point.
   - **Stop-Loss (SL)**: Dynamically calculated using 1.5x ATR below entry to minimize downside.
   - **Take-Profit (TP)**: Dynamically calculated using 2.5x ATR above entry (1:2+ risk/reward ratio).
5. **Why This Signal? (Explainable AI)**:
   - Expand the explainability section to see the exact factors (e.g., *"RSI below 40 indicating oversold recovery"*, *"Golden cross: EMA 20 crossed above EMA 50"*, *"Positive volume surge: 1.4x 20-day average"*).

---

### 3.5 Technical Indicator Suite & Charting
Under the **Stock Analyzer** tab:
- **Moving Averages**: SMA 20, SMA 50, SMA 200, EMA 20, EMA 50.
- **Momentum Oscillators**: RSI (14) with overbought (>70) and oversold (<30) thresholds; MACD Line, Signal Line, and Histogram.
- **Volatility & Bands**: Bollinger Bands Upper/Lower/Bandwidth, and Average True Range (ATR 14).
- **Market Regime**: Automatically detects whether the asset is in a *Trending Bullish*, *Trending Bearish*, *High Volatility Squeeze*, or *Range-Bound Mean Reverting* regime.
- **Advanced TradingView Chart**: Switch timeframes (1D, 1W, 1M, 1H) and add custom indicators directly on the chart.

---

### 3.6 Market Scanner (Finding Opportunities)
1. Click **Market Scanner** on the left menu.
2. Filter by sector or asset class (US Tech, Crypto, Indian Equities, Global Indices).
3. The scanner table displays:
   - Asset name and current price.
   - Trend direction (Up / Down / Sideways).
   - RSI (14) with colored heat badges.
   - AI Directional Signal with Confidence %.
   - Pre-evaluated Risk Rating (*Low, Medium, High*).
4. Click on any row to instantly focus that asset in the Analyzer.

---

### 3.7 Placing a Paper Trade (Virtual Money)
TradeGuard AI gives you **₹10,00,000 (INR)** in virtual capital to practice without risking real money.

1. Click the **"New Paper Trade"** button (or open the **Paper Trading Modal**).
2. **Select Asset**: Choose your target symbol (e.g., `AAPL`).
3. **Select Side**: `BUY` (Long) or `SELL` (Short).
4. **Enter Quantity**: Specify the number of shares or units.
5. **Set Stop-Loss & Take-Profit**:
   - *Tip*: TradeGuard will auto-fill institutional ATR brackets for you.
   - **Important**: The Risk Engine requires a stop-loss on every trade. Orders without a stop-loss will be rejected!
6. **Pre-Trade Risk Check**:
   - The modal calculates total capital risk: `Risk = Quantity × |Entry Price - Stop Loss|`.
   - If `Risk > 1.0% of Account Capital` (₹10,000), the risk gatekeeper will warn or block the trade.
7. Click **"Submit Order"**:
   - The virtual broker validates the order against current market quotes.
   - If approved, the order executes with zero slippage penalty, logs into your portfolio, and hashes a cryptographic audit trail onto the Stellar Soroban ledger.

---

### 3.8 Portfolio Management & Tracking
Navigate to the **Portfolio** tab to review your account:
- **Total Portfolio Equity**: Cash balance + Current market value of open positions.
- **Unrealized P&L**: Live gain/loss on currently active positions.
- **Realized P&L**: Profit/loss recorded from closed trades.
- **Asset Allocation**: Interactive pie/donut chart showing exposure across holdings.
- **Open Positions Table**:
  - Displays Symbol, Entry Price, Current Price, P&L (₹ and %), Stop-Loss, and Take-Profit.
  - **Closing a Position**: Click the **"Close Position"** button next to any holding to sell immediately at the market price and lock in your P&L.

---

### 3.9 Running Quantitative Backtests
Test how an AI strategy would have performed historically before trading it:
1. Click **Backtesting** in the sidebar.
2. Select your symbol (e.g., `AAPL`, `NVDA`, `BTC-USD`).
3. Set your simulation parameters:
   - **Date Range**: 1 Year, 3 Years, or 5 Years.
   - **Initial Capital**: Default ₹10,00,000.
   - **Slippage**: 0.05% (realistic market friction).
   - **Commission Fee**: 0.03% per trade.
4. Click **"Run Backtest Simulation"**.
5. The engine simulates every historical bar using walk-forward testing:
   - **Equity Curve**: Visual graph comparing the strategy's growth vs. Buy-and-Hold.
   - **Key Metrics**:
     - **Total Return (%)**
     - **Sharpe Ratio** (Risk-adjusted return; >1.5 is strong)
     - **Maximum Drawdown (MDD %)** (Peak-to-trough decline)
     - **Win Rate (%)** & **Profit Factor** (Gross profits / Gross losses)
     - **Monthly Return Heatmap**

---

### 3.10 Strategy Lab (Tuning Parameters)
Customize the rules that generate signals:
1. Open the **Strategy Lab** tab.
2. Adjust strategy hyperparameters:
   - **Fast EMA Span** (e.g., 9 or 20)
   - **Slow EMA Span** (e.g., 21 or 50)
   - **RSI Overbought / Oversold limits** (e.g., 70 / 30 vs. 75 / 25)
   - **ATR Stop Multiplier** (e.g., 1.5x)
   - **Risk per Trade** (0.5% to 1.5%)
3. Click **"Save & Hash Strategy"**:
   - Computes a new SHA-256 hash of your parameter combination.
   - Inscribes the strategy version (e.g., `v1.2-Custom`) to ensure full auditability.

---

### 3.11 Financial News & Signal Fusion Intelligence
Located under the **News Intelligence** tab:
1. **Curated Multi-Source Feed**: Aggregates verified financial headlines from Alpha Vantage, GNews, Google News RSS, and Yahoo Finance.
2. **Sentiment Analysis**: Each article is analyzed via NLP and scored as *Bullish*, *Bearish*, or *Neutral* with confidence percentages.
3. **Signal Fusion Card**: Combines pure technical indicators with macroeconomic news sentiment to calculate a combined multi-factor score.
4. **Economic Calendar**: Upcoming central bank meetings, CPI inflation reports, and earnings release dates.
5. **Daily Digest**: One-click modal summarizing market macro themes.

---

### 3.12 Stellar Soroban Blockchain Audit Trail
TradeGuard AI solves the "hindsight bias" problem common in trading bots.

1. Click **Blockchain Audit** in the navigation menu.
2. You will see a chronological log of all generated trade signals:
   - **Signal ID**: Unique UUID of the signal.
   - **Asset & Action**: e.g., `NVDA - BUY`.
   - **Timestamp**: Epoch millisecond timestamp when the AI made the decision.
   - **SHA-256 Signal Hash**: Cryptographic hash of the price, indicators, and model output.
   - **Soroban Ledger Status**: `VERIFIED ON STELLAR TESTNET`.
3. **Verify Any Signal**:
   - Click the **"Verify Proof"** button next to any signal.
   - A modal opens showing the exact JSON payload, the SHA-256 hash calculation, and the smart contract record verification.
   - Proves mathematically that the signal was generated *before* the subsequent price movement occurred.

---

### 3.13 Emergency Circuit Breaker
Located in the top header:
- **What it does**: A master safety switch designed for high volatility, unexpected flash crashes, or news black-swan events.
- **How to activate**: Toggle the **"Circuit Breaker"** button in the top bar to `ON`.
- **Effect**: All automated trade execution and new paper trade entries are immediately blocked. Active positions remain protected by their existing hard stop-losses.

---

## 4. How to Use the TradingView Bot & Webhooks

TradeGuard AI includes a production-grade Pine Script v5 strategy for automated alerts and algorithmic execution.

### 4.1 Setting Up the Pine Script v5 Strategy
1. Locate the file: [`pinescript/TradeGuard_AI_Strategy.pine`](file:///s:/TradeGuard%20AI/pinescript/TradeGuard_AI_Strategy.pine).
2. Open [TradingView](https://www.tradingview.com) and navigate to the **SuperCharts** view for any ticker (e.g., `AAPL` or `BTCUSDT`).
3. Click **Pine Editor** at the bottom of the TradingView screen.
4. Copy the entire content of `TradeGuard_AI_Strategy.pine` and paste it into the editor.
5. Click **"Save"** and then **"Add to chart"**.

---

### 4.2 Configuring Strategy Inputs
In TradingView, click the **Settings (gear icon)** on the TradeGuard AI strategy:
- **Fast EMA**: Default `20`
- **Slow EMA**: Default `50`
- **RSI Period**: Default `14`
- **ATR Multiplier for Stop-Loss**: Default `1.5`
- **ATR Multiplier for Take-Profit**: Default `2.5`
- **Enable Webhook Alerts**: Checked `true`

---

### 4.3 Configuring Automated Webhook Alerts
To send alerts from TradingView straight into your TradeGuard AI backend:

1. In TradingView, click the **Clock Icon (Alerts)** on the right toolbar and click **"Create Alert"**.
2. Under **Condition**, select: `TradeGuard AI Strategy`.
3. Under **Alert actions**, check **"Webhook URL"**.
4. Enter your TradeGuard backend webhook endpoint:
   - For local testing via tunnel (e.g. ngrok or cloudflare tunnel):
     ```
     https://your-domain.ngrok-free.app/api/webhooks/tradingview
     ```
   - For a deployed VPS:
     ```
     https://api.yourdomain.com/api/webhooks/tradingview
     ```
5. In the **Message** box, paste the JSON template:
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
6. Click **"Create"**.
7. When TradingView triggers an alert:
   - The alert POSTs to `/api/webhooks/tradingview`.
   - TradeGuard AI validates the signature, evaluates the pre-trade risk policy, logs the alert in the **Alerts Hub**, and writes the record to the Stellar Soroban smart contract.

---

## 5. How to Use the AI Copilot

TradeGuard includes an intelligent, context-aware Copilot ready to assist you.

1. **Opening the Copilot**:
   - Click the floating **AI Copilot** button at the bottom right corner of the terminal (or the Copilot icon in the header).
2. **What You Can Ask**:
   - *"Why did the AI issue a BUY signal for AAPL?"*
     *Copilot analyzes the latest technical indicators, RSI, moving averages, and news sentiment to explain the reasoning.*
   - *"Is my portfolio risk balanced right now?"*
     *Copilot reviews your open holdings, cash balance, and exposure percentage.*
   - *"Why was my order rejected?"*
     *Copilot checks the Risk Engine logs to explain if your stop-loss was too wide, exposure exceeded 40%, or circuit breaker was active.*
   - *"Explain the ATR stop-loss calculation for TSLA."*
3. The Copilot remembers current context (selected asset, portfolio balance, active signal) to provide tailored institutional advice.

---

## 6. Institutional Risk Engine Rules

TradeGuard AI strictly enforces **5 Cardinal Safety Rules** to protect your capital:

| Rule | Parameter | Description |
|---|---|---|
| **1. Max Risk Per Trade** | **1.0% of Capital** | Maximum allowable loss on a single trade cannot exceed ₹10,000 (on ₹10,00,000 capital). |
| **2. Mandatory Brackets** | **Stop-Loss & Take-Profit** | Orders without an explicit stop-loss are automatically rejected before submission. |
| **3. Portfolio Exposure Cap** | **40% of Equity** | Total value of all open positions combined cannot exceed 40% of current equity. |
| **4. Max Open Positions** | **5 Assets** | You cannot hold more than 5 concurrent asset positions simultaneously to prevent over-diversification. |
| **5. Emergency Circuit Breaker** | **Master Kill Switch** | When turned ON, all incoming order executions and webhook triggers are instantly frozen. |

---

## 7. Troubleshooting & FAQ

### Q: Why did the terminal show `Failed to fetch` errors?
**A:** The Next.js frontend runs on port 3000, while the FastAPI backend runs on port 8000. If the backend is not started, API requests will fail. Run `npm run backend` in a terminal window to start the backend.

### Q: Does the paper trading engine use real money?
**A:** No. TradeGuard AI is strictly configured for research and simulated paper trading using virtual capital (default ₹10,00,000 INR). Real broker execution is disabled by default for regulatory compliance.

### Q: Can I run both backend and frontend from the root folder?
**A:** Yes!
- To run the frontend: `npm run dev`
- To run the backend: `npm run backend`
- To test the frontend build: `npm run build`

### Q: How do I change the default virtual balance?
**A:** In [`backend/app/config.py`](file:///s:/TradeGuard%20AI/backend/app/config.py), modify `DEFAULT_PAPER_BALANCE = 1000000.0` to your desired virtual amount.

---

*TradeGuard AI — Probabilistic Intelligence. Verified Records. Risk-Controlled Trading.*
