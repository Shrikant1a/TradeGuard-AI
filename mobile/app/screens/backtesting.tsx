import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useStrategies, useRunBacktest } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, PrimaryButton, LoadingState } from '@/components/ui';
import type { BacktestResult } from '@/types/api';

const SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'BTC-USD', 'RELIANCE.NS'];
const PERIODS = ['3mo', '6mo', '1y', '2y'];

export default function BacktestingScreen() {
  const router = useRouter();
  const [symbol, setSymbol] = useState('AAPL');
  const [strategy, setStrategy] = useState('');
  const [period, setPeriod] = useState('1y');
  const [capital, setCapital] = useState('10000');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<BacktestResult | null>(null);

  const strategiesQuery = useStrategies();
  const backtestMutation = useRunBacktest();

  const strategies: string[] = Array.isArray(strategiesQuery.data)
    ? strategiesQuery.data
    : ['RSI_MEAN_REVERSION', 'MACD_CROSSOVER', 'BOLLINGER_BREAKOUT', 'EMA_TREND'];

  if (!strategy && strategies.length > 0) {
    setStrategy(strategies[0]);
  }

  const runBacktest = async () => {
    if (!symbol || !strategy) {
      Alert.alert('Required', 'Select a symbol and strategy.');
      return;
    }
    setResult(null);
    setProgress(0);
    setStatus('QUEUED');

    try {
      const res = await backtestMutation.mutateAsync({
        params: {
          symbol: symbol.toUpperCase(),
          strategy,
          period,
          initial_capital: parseFloat(capital) || 10000,
        },
        onProgress: (pct, stat) => {
          setProgress(pct);
          setStatus(stat);
        },
      });
      setResult(res);
      setStatus('COMPLETED');
    } catch (e: any) {
      Alert.alert('Backtest Failed', e.message || 'An error occurred during backtesting.');
      setStatus('FAILED');
    }
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Backtesting</Text>
            <Text style={styles.subtitle}>Test strategies on historical data</Text>
          </View>
        </View>

        {/* Config Card */}
        <GlassCard style={styles.configCard}>
          <Text style={styles.sectionLabel}>Asset Symbol</Text>
          <View style={styles.chipRow}>
            {SYMBOLS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSymbol(s)}
                style={[styles.chip, symbol === s && styles.chipActive]}
              >
                <Text style={[styles.chipText, symbol === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Strategy</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {strategies.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStrategy(s)}
                  style={[styles.chip, strategy === s && styles.chipActive]}
                >
                  <Text style={[styles.chipText, strategy === s && styles.chipTextActive]}>
                    {s.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionLabel}>Period</Text>
          <View style={styles.chipRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[styles.chip, period === p && styles.chipActive]}
              >
                <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Initial Capital ($)</Text>
          <TextInput
            style={styles.input}
            value={capital}
            onChangeText={setCapital}
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.textMuted}
          />

          <PrimaryButton
            title={backtestMutation.isPending ? 'Running Backtest...' : `▶ Run Backtest: ${symbol}`}
            onPress={runBacktest}
            loading={backtestMutation.isPending}
          />
        </GlassCard>

        {/* Progress */}
        {(backtestMutation.isPending || status) && (
          <GlassCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Backtest Status</Text>
              <Text style={[
                styles.progressStatus,
                {
                  color: status === 'COMPLETED' ? Colors.buy
                    : status === 'FAILED' ? Colors.sell
                      : Colors.warning
                }
              ]}>
                {status || 'RUNNING'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPct}>{progress.toFixed(0)}%</Text>
            <Text style={styles.progressNote}>
              ⚠️ Backtest runs on the server. Do not close this screen.
            </Text>
          </GlassCard>
        )}

        {/* Results */}
        {result && status === 'COMPLETED' && (
          <GlassCard style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>📊 Backtest Results</Text>
            <Text style={styles.resultsSubtitle}>{result.symbol} • {result.strategy?.replace(/_/g, ' ')}</Text>

            <View style={styles.resultGrid}>
              {[
                { label: 'Total Return', value: `${(result.total_return_pct || 0).toFixed(2)}%`, color: (result.total_return_pct || 0) >= 0 ? Colors.buy : Colors.sell },
                { label: 'Sharpe Ratio', value: (result.sharpe_ratio || 0).toFixed(2), color: Colors.primary },
                { label: 'Max Drawdown', value: `${(result.max_drawdown_pct || 0).toFixed(2)}%`, color: Colors.sell },
                { label: 'Win Rate', value: `${(result.win_rate_pct || 0).toFixed(1)}%`, color: Colors.buy },
                { label: 'Total Trades', value: String(result.total_trades || 0), color: Colors.textSecondary },
                { label: 'Profit Factor', value: (result.profit_factor || 0).toFixed(2), color: Colors.emerald },
                { label: 'Final Capital', value: `$${(result.final_capital || 0).toFixed(0)}`, color: Colors.primary },
                { label: 'Initial Capital', value: `$${(result.initial_capital || 10000).toFixed(0)}`, color: Colors.textMuted },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.resultItem}>
                  <Text style={styles.resultLabel}>{label}</Text>
                  <Text style={[styles.resultValue, { color }]}>{value}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 32, gap: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary },
  configCard: { gap: Spacing.md },
  sectionLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d415' },
  chipText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.primary },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 15,
  },
  progressCard: { gap: Spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  progressStatus: { fontSize: 12, fontWeight: '700' },
  progressBar: {
    height: 6, backgroundColor: Colors.cardBorder,
    borderRadius: BorderRadius.full, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  progressPct: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },
  progressNote: { fontSize: 11, color: Colors.warning },
  resultsCard: { gap: Spacing.sm },
  resultsTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  resultsSubtitle: { fontSize: 12, color: Colors.textSecondary },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  resultItem: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  resultLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  resultValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
});
