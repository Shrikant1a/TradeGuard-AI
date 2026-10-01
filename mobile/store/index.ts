import { create } from 'zustand';
import { authService, UserData } from '@/services/authService';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  setAuth: (user: UserData) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  setAuth: (user) => set({ isAuthenticated: true, user }),

  clearAuth: () => set({ isAuthenticated: false, user: null }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const [authenticated, user] = await Promise.all([
        authService.isAuthenticated(),
        authService.getUser(),
      ]);
      set({ isAuthenticated: authenticated, user, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));

// ─── Watchlist Store ───────────────────────────────────────────────────────────

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  symbols: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'BTC-USD', 'RELIANCE.NS'],

  add: (symbol) =>
    set((state) => ({
      symbols: state.symbols.includes(symbol)
        ? state.symbols
        : [...state.symbols, symbol],
    })),

  remove: (symbol) =>
    set((state) => ({
      symbols: state.symbols.filter((s) => s !== symbol),
    })),

  has: (symbol) => get().symbols.includes(symbol),
}));

// ─── App Settings Store ────────────────────────────────────────────────────────

interface SettingsState {
  currency: string;
  notificationsEnabled: boolean;
  selectedSymbol: string;
  setCurrency: (c: string) => void;
  setNotifications: (v: boolean) => void;
  setSelectedSymbol: (s: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: 'USD',
  notificationsEnabled: true,
  selectedSymbol: 'AAPL',
  setCurrency: (c) => set({ currency: c }),
  setNotifications: (v) => set({ notificationsEnabled: v }),
  setSelectedSymbol: (s) => set({ selectedSymbol: s }),
}));
