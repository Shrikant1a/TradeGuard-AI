import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRiskPolicy } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, LoadingState, ErrorState } from '@/components/ui';

export default function RiskScreen() {
  const router = useRouter();
  const riskQuery = useRiskPolicy();
  const policy = riskQuery.data;

  const riskItems = policy ? [
    { label: 'Max Risk Per Trade', value: `${policy.max_risk_per_trade_pct?.toFixed(1)}%`, desc: 'Maximum % of capital at risk per trade', color: Colors.warning },
    { label: 'Max Daily Loss', value: `${policy.max_daily_loss_pct?.toFixed(1)}%`, desc: 'Daily loss circuit breaker', color: Colors.sell },
    { label: 'Portfolio Exposure', value: `${policy.max_portfolio_exposure_pct?.toFixed(0)}%`, desc: 'Max % of portfolio in positions', color: Colors.primary },
    { label: 'Max Position Size', value: `${policy.max_position_size_pct?.toFixed(0)}%`, desc: 'Largest single position allowed', color: Colors.accent },
    { label: 'Max Open Positions', value: String(policy.max_open_positions), desc: 'Concurrent positions limit', color: Colors.textSecondary },
    { label: 'Capital at Risk', value: `$${(policy.capital_at_risk || 0).toFixed(2)}`, desc: 'Currently at risk across all positions', color: Colors.sell },
    { label: 'Current Exposure', value: `${(policy.current_exposure_pct || 0).toFixed(1)}%`, desc: 'Active portfolio exposure', color: Colors.warning },
  ] : [];

  const getExposureLevel = () => {
    const exp = policy?.current_exposure_pct || 0;
    if (exp >= 80) return { label: 'HIGH RISK', color: Colors.sell };
    if (exp >= 50) return { label: 'MEDIUM RISK', color: Colors.warning };
    return { label: 'LOW RISK', color: Colors.buy };
  };

  const exposureLevel = getExposureLevel();

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={riskQuery.isFetching}
            onRefresh={() => riskQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Risk Management</Text>
        </View>

        {/* Risk Level Banner */}
        {policy && (
          <GlassCard style={StyleSheet.flatten([styles.riskBanner, { borderColor: exposureLevel.color + '40' }])}>
            <View style={styles.riskBannerRow}>
              <View style={[styles.riskDot, { backgroundColor: exposureLevel.color }]} />
              <Text style={[styles.riskLevel, { color: exposureLevel.color }]}>
                {exposureLevel.label}
              </Text>
            </View>
            <Text style={styles.riskSub}>
              Current portfolio exposure: {(policy.current_exposure_pct || 0).toFixed(1)}%
              {' '}• Open positions: {policy.open_positions_count || 0}
            </Text>
            <View style={styles.exposureBar}>
              <View style={[
                styles.exposureFill,
                {
                  width: `${Math.min(policy.current_exposure_pct || 0, 100)}%`,
                  backgroundColor: exposureLevel.color,
                }
              ]} />
            </View>
          </GlassCard>
        )}

        {riskQuery.isLoading && <LoadingState message="Loading risk policy..." />}
        {riskQuery.isError && (
          <ErrorState
            message="Risk data unavailable."
            onRetry={() => riskQuery.refetch()}
          />
        )}

        {/* Policy Items */}
        {riskItems.map((item, i) => (
          <GlassCard key={item.label} style={styles.riskCard}>
            <View style={styles.riskRow}>
              <View style={[styles.riskAccent, { backgroundColor: item.color }]} />
              <View style={styles.riskContent}>
                <Text style={styles.riskLabel}>{item.label}</Text>
                <Text style={styles.riskDesc}>{item.desc}</Text>
              </View>
              <Text style={[styles.riskValue, { color: item.color }]}>{item.value}</Text>
            </View>
          </GlassCard>
        ))}

        {/* Safeguards */}
        {policy && (
          <GlassCard style={styles.safeguards}>
            <Text style={styles.safeguardsTitle}>Active Safeguards</Text>
            {[
              { label: 'Stop Loss Required', active: policy.require_stop_loss },
              { label: 'Circuit Breaker', active: policy.circuit_breaker_active },
              { label: 'Take Profit Required', active: policy.require_take_profit },
            ].map((guard) => (
              <View key={guard.label} style={styles.guardRow}>
                <Text style={[styles.guardDot, { color: guard.active ? Colors.buy : Colors.sell }]}>
                  {guard.active ? '✓' : '✗'}
                </Text>
                <Text style={styles.guardLabel}>{guard.label}</Text>
                <Text style={[styles.guardStatus, { color: guard.active ? Colors.buy : Colors.sell }]}>
                  {guard.active ? 'ACTIVE' : 'DISABLED'}
                </Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Disclaimer */}
        <GlassCard style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Risk management is for paper trading simulation only. These limits prevent excessive
            simulated losses but do not reflect real brokerage constraints. Never risk more than
            you can afford to lose in real markets.
          </Text>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 32, gap: Spacing.sm },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  riskBanner: { gap: 8 },
  riskBannerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskDot: { width: 10, height: 10, borderRadius: 5 },
  riskLevel: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  riskSub: { fontSize: 12, color: Colors.textSecondary },
  exposureBar: {
    height: 6, backgroundColor: Colors.cardBorder,
    borderRadius: BorderRadius.full, overflow: 'hidden',
  },
  exposureFill: { height: '100%', borderRadius: BorderRadius.full },
  riskCard: { paddingVertical: Spacing.sm },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  riskAccent: { width: 4, height: 40, borderRadius: 2 },
  riskContent: { flex: 1 },
  riskLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  riskDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  riskValue: { fontSize: 18, fontWeight: '800' },
  safeguards: { gap: Spacing.sm },
  safeguardsTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  guardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guardDot: { fontSize: 16, fontWeight: '800', width: 20 },
  guardLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  guardStatus: { fontSize: 11, fontWeight: '700' },
  disclaimer: { backgroundColor: '#f59e0b10', borderColor: '#f59e0b30' },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
