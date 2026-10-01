# TradeGuardd Mobile App
## React Native + Expo + TypeScript

AI signals. Risk-controlled decisions. Blockchain-verified records.

---

## Architecture Overview

```
mobile/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout (QueryClient + StatusBar)
│   ├── index.tsx                 # Splash screen with auth check
│   ├── (auth)/
│   │   ├── login.tsx             # Login screen
│   │   └── register.tsx          # Register screen
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigation
│   │   ├── index.tsx             # Home dashboard
│   │   ├── markets.tsx           # Markets + Search
│   │   ├── signals.tsx           # AI Signals list
│   │   ├── portfolio.tsx         # Portfolio + Paper Trading
│   │   └── more.tsx              # More menu
│   ├── screens/
│   │   ├── news.tsx              # Financial news feed
│   │   ├── watchlist.tsx         # Symbol watchlist
│   │   ├── alerts.tsx            # Price/signal alerts
│   │   ├── backtesting.tsx       # Strategy backtesting
│   │   ├── risk.tsx              # Risk management
│   │   ├── blockchain.tsx        # Stellar audit log
│   │   ├── copilot.tsx           # AI Copilot chat
│   │   ├── settings.tsx          # App settings
│   │   └── paper-trading.tsx     # Redirects to portfolio
│   ├── stock/
│   │   └── [symbol].tsx          # Dynamic stock detail page
│   └── article/
│       └── [id].tsx              # Article detail (TODO)
├── components/
│   └── ui.tsx                    # Reusable UI components
├── constants/
│   ├── config.ts                 # API URL config (dev/prod)
│   └── theme.ts                  # Design tokens (colors, fonts, spacing)
├── hooks/
│   └── useApi.ts                 # TanStack Query hooks for all endpoints
├── services/
│   ├── apiClient.ts              # Axios client with auth interceptor
│   ├── authService.ts            # Auth with SecureStore
│   └── api.ts                   # All API service functions
├── store/
│   └── index.ts                  # Zustand stores (auth, watchlist, settings)
└── types/
    └── api.ts                    # TypeScript types matching backend models
```

---

## Prerequisites

- Node.js 18+
- Expo Go app on your phone (for physical device testing)
- Android Emulator OR Expo Go

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

Then:
- Press `a` for Android Emulator
- Scan QR code with Expo Go for physical device

## Environment Configuration

Edit `constants/config.ts` to configure your API URL:

```typescript
// For Android Emulator
API_BASE_URL: 'http://10.0.2.2:8000'

// For Physical Device on same WiFi (replace with your machine's IP)
API_BASE_URL: 'http://192.168.1.X:8000'

// For Production
API_BASE_URL: 'https://your-tradeguardd-api.com'
```

## Running the Backend

The mobile app connects to the existing TradeGuardd FastAPI backend:

```bash
# From the TradeGuard AI root directory
cd backend
venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

## Build for Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK preview (install on device)
eas build --platform android --profile preview

# Build production AAB (for Play Store)
eas build --platform android
```

---

## Key Features

| Feature | Screen | API Endpoint |
|---------|--------|-------------|
| AI Signals | `/signals` | `GET /api/signals` |
| Signal Generation | `/signals` | `POST /api/signals/generate` |
| Market Data | `/stock/[symbol]` | `GET /api/market-data/{symbol}` |
| Portfolio | `/portfolio` | `GET /api/portfolio` |
| Paper Trading | `/portfolio` | `POST /api/paper-trades` |
| Risk Check | `/portfolio` | `POST /api/risk/check` |
| Financial News | `/news` | `GET /api/news` |
| Blockchain Audit | `/blockchain` | `GET /api/blockchain/records` |
| AI Copilot | `/copilot` | `POST /api/copilot/chat` |
| Backtesting | `/backtesting` | `POST /api/backtest` |
| Risk Policy | `/risk` | `GET /api/risk/policy` |

## Security

- Auth tokens stored in **Expo SecureStore** (encrypted keychain)
- No API keys, passwords, or secrets in the app code
- All business logic remains on the backend
- CORS and authentication enforced server-side

---

⚠️ **Disclaimer**: TradeGuardd is for educational purposes only. Not financial advice.
