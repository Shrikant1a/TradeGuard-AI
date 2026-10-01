// ─── Core Design Tokens matching TradeGuardd website ──────────────────────────

export const Colors = {
  // Primary Brand
  primary: '#06b6d4',       // cyan-500 - main brand color
  primaryDark: '#0891b2',   // cyan-600
  primaryLight: '#22d3ee',  // cyan-400
  secondary: '#3b82f6',     // blue-500
  accent: '#8b5cf6',        // violet-500
  emerald: '#10b981',       // emerald-500

  // Signal Colors
  buy: '#10b981',           // Green for BUY
  sell: '#ef4444',          // Red for SELL
  hold: '#f59e0b',          // Amber for HOLD
  
  // Risk Colors
  riskLow: '#10b981',
  riskMedium: '#f59e0b',
  riskHigh: '#ef4444',
  
  // Sentiment
  bullish: '#10b981',
  bearish: '#ef4444',
  neutral: '#94a3b8',

  // Backgrounds
  background: '#0a0f1e',    // Deep navy - matches website
  surface: '#0f172a',       // Slightly lighter
  card: '#111827',          // Card backgrounds
  cardBorder: '#1e293b',    // Card borders
  elevated: '#1e293b',      // Elevated surfaces
  
  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textAccent: '#06b6d4',
  
  // Borders
  border: '#1e293b',
  borderLight: '#334155',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

  // Gradients (as string arrays for LinearGradient)
  gradientPrimary: ['#06b6d4', '#3b82f6', '#8b5cf6'] as string[],
  gradientBuy: ['#10b981', '#059669'] as string[],
  gradientSell: ['#ef4444', '#dc2626'] as string[],
  gradientCard: ['#111827', '#0f172a'] as string[],
  gradientBackground: ['#0a0f1e', '#0f172a', '#111827'] as string[],
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  mono: 'monospace',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMd: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  micro: { fontSize: 10, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  mono: { fontSize: 13, fontFamily: 'monospace' as const },
};
