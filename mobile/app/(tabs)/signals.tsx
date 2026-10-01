import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSignals, useGenerateSignal } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  SignalBadge, RiskBadge, ConfidenceBar,
  GlassCard, LoadingState, ErrorState, SectionHeader, PrimaryButton,
} from '@/components/ui';
import type { Signal, SignalType, RiskLevel } from '@/types/api';
import { getErrorMessage } from '@/services/apiClient';

const FILTER_TYPES: (SignalType | 'ALL')[] = ['ALL', 'BUY', 'HOLD', 'SELL'];
const FILTER_RISKS: (RiskLevel | 'ALL')[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

export default function SignalsScreen() {
  const router = useRouter();
  const [signalFilter, setSignalFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [genSymbol, setGenSymbol] = useState('AAPL');

  const signalsQuery = useSignals(
    signalFilter !== 'ALL' ? signalFilter : undefined,
    riskFilter !== 'ALL' ? riskFilter : undefined
  );

  const generateMutation = useGenerateSignal();

  const signals: Signal[] = Array.isArray(signalsQuery.data) ? signalsQuery.data : [];

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync(genSymbol.toUpperCase());
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <FlatList
        data={signals}
        keyExtractor={(item, i) => item.signal_code || String(i)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={signalsQuery.isFetching}
            onRefresh={() => signalsQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>AI Signals</Text>
              <Text style={styles.subtitle}>Blockchain-verified trading signals</Text>
            </View>

            {/* Signal Type Filter */}
            <View style={styles.filterRow}>
              {FILTER_TYPES.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setSignalFilter(f)}
                  style={[styles.filterChip, signalFilter === f && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, signalFilter === f && styles.filterTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Risk Filter */}
            <View style={styles.filterRow}>
              {FILTER_RISKS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRiskFilter(r)}
                  style={[styles.filterChip, riskFilter === r && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, riskFilter === r && styles.filterTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Generate Signal */}
            <GlassCard style={styles.generateCard}>
              <Text style={styles.generateTitle}>🤖 Generate AI Signal</Text>
              <Text style={styles.generateSub}>Get fresh analysis with blockchain verification</Text>
              <View style={styles.generateRow}>
                <View style={styles.generateSymbols}>
                  {['AAPL', 'NVDA', 'TSLA', 'BTC-USD', 'MSFT'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setGenSymbol(s)}
                      style={[styles.symChip, genSymbol === s && styles.symChipActive]}
                    >
                      <Text style={[styles.symText, genSymbol === s && styles.symTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <PrimaryButton
                  title={generateMutation.isPending ? 'Generating...' : `Generate ${genSymbol}`}
                  onPress={handleGenerate}
                  loading={generateMutation.isPending}
                  style={styles.generateBtn}
                />
              </View>
            </GlassCard>

            <SectionHeader
              title={`Active Signals (${signals.length})`}
              subtitle="AI-generated • Stellar verified"
            />

            {signalsQuery.isLoading && <LoadingState message="Fetching signals..." />}
            {signalsQuery.isError && (
              <ErrorState
                message="Unable to load signals. Check your connection."
                onRetry={() => signalsQuery.refetch()}
              />
            )}
          </>
        )}
        renderItem={({ item: sig }) => (
          <TouchableOpacity
            onPress={() => router.push(`/stock/${sig.symbol}`)}
            activeOpacity={0.85}
          >
            <GlassCard style={styles.signalCard}>
              {/* Top Row */}
              <View style={styles.signalHeader}>
                <View>
                  <Text style={styles.symbol}>{sig.symbol}</Text>
                  <Text style={styles.signalCode}>{sig.signal_code}</Text>
                </View>
                <View style={styles.badges}>
                  <SignalBadge signal={sig.signal_type} size="lg" />
                  <RiskBadge risk={sig.risk_score} />
                </View>
              </View>

              {/* Price Levels */}
              {(sig.entry_price || sig.stop_loss || sig.take_profit) && (
                <View style={styles.priceLevels}>
                  {sig.entry_price && (
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Entry</Text>
                      <Text style={styles.priceValue}>${sig.entry_price.toFixed(2)}</Text>
                    </View>
                  )}
                  {sig.stop_loss && (
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Stop Loss</Text>
                      <Text style={[styles.priceValue, { color: Colors.sell }]}>
                        ${sig.stop_loss.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {sig.take_profit && (
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Take Profit</Text>
                      <Text style={[styles.priceValue, { color: Colors.buy }]}>
                        ${sig.take_profit.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Confidence */}
              <ConfidenceBar value={sig.confidence * 100} />

              {/* Explanation */}
              {sig.explanation && (
                <Text style={styles.explanation} numberOfLines={2}>
                  {sig.explanation}
                </Text>
              )}

              {/* Blockchain */}
              {sig.blockchain?.tx_hash && (
                <View style={styles.chainRow}>
                  <View style={styles.chainDot} />
                  <Text style={styles.chainLabel}>Stellar verified</Text>
                  <Text style={styles.chainHash} numberOfLines={1}>
                    {sig.blockchain.tx_hash.slice(0, 24)}...
                  </Text>
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() =>
          !signalsQuery.isLoading && !signalsQuery.isError && (
            <GlassCard>
              <Text style={styles.emptyText}>
                No signals match the current filters. Generate a new signal above.
              </Text>
            </GlassCard>
          )
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 32, gap: Spacing.sm },
  header: { marginBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d415' },
  filterText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.primary },
  generateCard: { gap: Spacing.sm, marginBottom: Spacing.sm },
  generateTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  generateSub: { fontSize: 12, color: Colors.textSecondary },
  generateRow: { gap: Spacing.sm },
  generateSymbols: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  symChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d420' },
  symText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  symTextActive: { color: Colors.primary },
  generateBtn: {},
  signalCard: { gap: Spacing.sm, marginBottom: Spacing.xs },
  signalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  symbol: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  signalCode: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontFamily: 'monospace' },
  badges: { gap: 6, alignItems: 'flex-end' },
  priceLevels: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  priceItem: { alignItems: 'center' },
  priceLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  priceValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  explanation: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, fontStyle: 'italic' },
  chainRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chainDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  chainLabel: { fontSize: 11, color: Colors.accent, fontWeight: '600' },
  chainHash: { fontSize: 10, color: Colors.textMuted, flex: 1, fontFamily: 'monospace' },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
