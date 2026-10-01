import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import type { SignalType, RiskLevel } from '@/types/api';

// ─── Signal Badge ─────────────────────────────────────────────────────────────

export function SignalBadge({ signal, size = 'md' }: { signal: SignalType; size?: 'sm' | 'md' | 'lg' }) {
  const colors: Record<SignalType, string[]> = {
    BUY: ['#10b981', '#059669'],
    HOLD: ['#f59e0b', '#d97706'],
    SELL: ['#ef4444', '#dc2626'],
  };

  const sizes = {
    sm: { px: 6, py: 2, fontSize: 10 },
    md: { px: 10, py: 4, fontSize: 12 },
    lg: { px: 14, py: 6, fontSize: 14 },
  };

  const s = sizes[size];

  return (
    <LinearGradient
      colors={colors[signal] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.signalBadge, { paddingHorizontal: s.px, paddingVertical: s.py }]}
    >
      <Text style={[styles.signalBadgeText, { fontSize: s.fontSize }]}>{signal}</Text>
    </LinearGradient>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const color: Record<RiskLevel, string> = {
    LOW: Colors.riskLow,
    MEDIUM: Colors.riskMedium,
    HIGH: Colors.riskHigh,
  };
  return (
    <View style={[styles.riskBadge, { borderColor: color[risk] }]}>
      <View style={[styles.riskDot, { backgroundColor: color[risk] }]} />
      <Text style={[styles.riskText, { color: color[risk] }]}>{risk}</Text>
    </View>
  );
}

// ─── Confidence Bar ───────────────────────────────────────────────────────────

export function ConfidenceBar({ value, label = true }: { value: number; label?: boolean }) {
  const color = value >= 80 ? Colors.emerald : value >= 60 ? Colors.riskMedium : Colors.riskHigh;
  return (
    <View>
      {label && (
        <View style={styles.confLabelRow}>
          <Text style={styles.confLabel}>Confidence</Text>
          <Text style={[styles.confValue, { color }]}>{value.toFixed(0)}%</Text>
        </View>
      )}
      <View style={styles.confTrack}>
        <View style={[styles.confFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ─── PnL Text ─────────────────────────────────────────────────────────────────

export function PnLText({
  value, prefix = '', suffix = '', style = {}
}: { value: number; prefix?: string; suffix?: string; style?: any }) {
  const isPositive = value >= 0;
  const color = isPositive ? Colors.buy : Colors.sell;
  const sign = isPositive ? '+' : '';
  return (
    <Text style={[{ color, fontWeight: '600' }, style]}>
      {sign}{prefix}{value.toFixed(2)}{suffix}
    </Text>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────

export function GlassCard({
  children, style, onPress
}: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const content = (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity>;
  }
  return content;
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({
  title, subtitle, action, onAction
}: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon = '📭', title = 'No data', message }: {
  icon?: string; title?: string; message?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
    </View>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={Colors.primary} size="large" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

export function ErrorState({
  message = 'Something went wrong.', onRetry
}: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────

export function PrimaryButton({
  title, onPress, loading = false, disabled = false, style
}: {
  title: string; onPress: () => void; loading?: boolean;
  disabled?: boolean; style?: ViewStyle;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.primaryBtn, (disabled || loading) && styles.primaryBtnDisabled, style]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.primaryBtnText}>{title}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

// ─── Offline Banner ───────────────────────────────────────────────────────────

export function OfflineBanner() {
  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>📡 No internet connection — showing cached data</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  signalBadge: { borderRadius: BorderRadius.md, alignSelf: 'flex-start' },
  signalBadgeText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },

  riskBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskText: { fontSize: 11, fontWeight: '600' },

  confLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  confLabel: { fontSize: 12, color: Colors.textSecondary },
  confValue: { fontSize: 12, fontWeight: '700' },
  confTrack: {
    height: 4, backgroundColor: Colors.cardBorder,
    borderRadius: BorderRadius.full, overflow: 'hidden',
  },
  confFill: { height: '100%', borderRadius: BorderRadius.full },

  glassCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionAction: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  emptyState: { alignItems: 'center', padding: Spacing['3xl'] },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h4, color: Colors.textSecondary, marginBottom: 4 },
  emptyMessage: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: 14, color: Colors.textSecondary },

  errorState: { alignItems: 'center', padding: Spacing['3xl'] },
  errorIcon: { fontSize: 36, marginBottom: Spacing.md },
  errorText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  retryButton: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.primary,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  retryText: { color: Colors.primary, fontWeight: '600' },

  primaryBtn: {
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.md,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  statCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.md, flex: 1,
  },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  statSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  offlineBanner: {
    backgroundColor: '#7c3aed20', borderBottomWidth: 1, borderColor: '#7c3aed40',
    paddingVertical: 6, alignItems: 'center',
  },
  offlineText: { fontSize: 12, color: '#a78bfa' },
});
