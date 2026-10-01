import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useBlockchainAudit } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, LoadingState, ErrorState, SignalBadge } from '@/components/ui';
import type { BlockchainRecord } from '@/types/api';

export default function BlockchainScreen() {
  const router = useRouter();
  const auditQuery = useBlockchainAudit();
  const [search, setSearch] = useState('');

  const records: BlockchainRecord[] = auditQuery.data?.records || [];
  const network = auditQuery.data?.network || 'TESTNET';
  const contractId = auditQuery.data?.contract_id || '';

  const filtered = search
    ? records.filter(r =>
      r.asset_symbol?.toUpperCase().includes(search.toUpperCase()) ||
      r.signal_code?.includes(search) ||
      r.tx_hash?.includes(search)
    )
    : records;

  const statusColor = (status?: string) => {
    if (!status) return Colors.textMuted;
    if (status === 'CONFIRMED' || status === 'SUCCESS') return Colors.buy;
    if (status === 'FAILED') return Colors.sell;
    return Colors.warning;
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Blockchain Audit</Text>
          <Text style={styles.network}>Stellar Soroban • {network}</Text>
        </View>
      </View>

      {/* Contract Info */}
      {contractId && (
        <GlassCard style={styles.contractCard}>
          <Text style={styles.contractLabel}>Smart Contract</Text>
          <Text style={styles.contractId} numberOfLines={1}>{contractId}</Text>
          <View style={styles.contractMeta}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Stellar Soroban Testnet • Immutable Audit Log</Text>
          </View>
        </GlassCard>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search symbol, signal code, tx hash..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={auditQuery.isFetching}
            onRefresh={() => auditQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{records.length}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.buy }]}>
              {records.filter(r => r.signal_type === 'BUY').length}
            </Text>
            <Text style={styles.statLabel}>BUY Signals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {records.filter(r => r.signal_type === 'HOLD').length}
            </Text>
            <Text style={styles.statLabel}>HOLD</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.sell }]}>
              {records.filter(r => r.signal_type === 'SELL').length}
            </Text>
            <Text style={styles.statLabel}>SELL</Text>
          </View>
        </View>

        {auditQuery.isLoading && <LoadingState message="Fetching blockchain records..." />}
        {auditQuery.isError && (
          <ErrorState
            message="Blockchain audit temporarily unavailable."
            onRetry={() => auditQuery.refetch()}
          />
        )}

        {/* Records */}
        {filtered.map((record, i) => (
          <GlassCard key={record.tx_hash || i} style={styles.recordCard}>
            {/* Header Row */}
            <View style={styles.recordHeader}>
              <Text style={styles.signalCode}>{record.signal_code || `TG-${1000 + i}`}</Text>
              {record.signal_type && (
                <SignalBadge signal={record.signal_type as any} size="sm" />
              )}
            </View>

            {/* Symbol & Risk */}
            <View style={styles.recordMeta}>
              <Text style={styles.assetSymbol}>{record.asset_symbol}</Text>
              {record.risk_level && (
                <View style={[
                  styles.riskBadge,
                  {
                    borderColor: record.risk_level === 'LOW' ? Colors.buy
                      : record.risk_level === 'HIGH' ? Colors.sell : Colors.warning
                  }
                ]}>
                  <Text style={[
                    styles.riskText,
                    {
                      color: record.risk_level === 'LOW' ? Colors.buy
                        : record.risk_level === 'HIGH' ? Colors.sell : Colors.warning
                    }
                  ]}>
                    {record.risk_level}
                  </Text>
                </View>
              )}
              <Text style={[styles.txStatus, { color: statusColor(record.status) }]}>
                {record.status || 'CONFIRMED'}
              </Text>
            </View>

            {/* TX Hash */}
            {record.tx_hash && (
              <View style={styles.txRow}>
                <Text style={styles.txLabel}>TX:</Text>
                <Text style={styles.txHash} numberOfLines={1}>{record.tx_hash}</Text>
              </View>
            )}

            {/* Ledger & Timestamp */}
            <View style={styles.recordFooter}>
              {record.ledger && (
                <Text style={styles.ledger}>Ledger #{record.ledger}</Text>
              )}
              {record.timestamp && (
                <Text style={styles.timestamp}>{formatDate(record.timestamp)}</Text>
              )}
            </View>

            {/* Verification Flow */}
            <View style={styles.flowRow}>
              <View style={styles.flowStep}>
                <View style={[styles.flowDot, { backgroundColor: Colors.buy }]} />
                <Text style={styles.flowLabel}>Signal</Text>
              </View>
              <View style={styles.flowLine} />
              <View style={styles.flowStep}>
                <View style={[styles.flowDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.flowLabel}>Hash</Text>
              </View>
              <View style={styles.flowLine} />
              <View style={styles.flowStep}>
                <View style={[styles.flowDot, { backgroundColor: Colors.accent }]} />
                <Text style={styles.flowLabel}>Stellar</Text>
              </View>
              <View style={styles.flowLine} />
              <View style={styles.flowStep}>
                <View style={[styles.flowDot, { backgroundColor: Colors.emerald }]} />
                <Text style={styles.flowLabel}>Confirmed</Text>
              </View>
            </View>
          </GlassCard>
        ))}

        {filtered.length === 0 && !auditQuery.isLoading && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⛓️</Text>
            <Text style={styles.emptyText}>No blockchain records found</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function formatDate(ts: string): string {
  try {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return ts; }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  network: { fontSize: 11, color: Colors.accent, fontWeight: '600' },
  contractCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, gap: 4,
  },
  contractLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  contractId: { fontSize: 11, color: Colors.primary, fontFamily: 'monospace' },
  contractMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.buy },
  statusText: { fontSize: 10, color: Colors.textMuted },
  searchContainer: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder, paddingHorizontal: Spacing.md,
  },
  searchInput: { height: 44, color: Colors.textPrimary, fontSize: 13 },
  content: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.sm },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.lg, marginBottom: Spacing.sm,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  recordCard: { gap: 8 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalCode: { fontSize: 12, color: Colors.textMuted, fontFamily: 'monospace' },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assetSymbol: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, flex: 1 },
  riskBadge: {
    borderWidth: 1, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  riskText: { fontSize: 10, fontWeight: '700' },
  txStatus: { fontSize: 11, fontWeight: '700' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  txHash: { fontSize: 10, color: Colors.textMuted, fontFamily: 'monospace', flex: 1 },
  recordFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  ledger: { fontSize: 11, color: Colors.accent },
  timestamp: { fontSize: 11, color: Colors.textMuted },
  flowRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  flowStep: { alignItems: 'center', flex: 1 },
  flowDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 3 },
  flowLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },
  flowLine: { height: 1, backgroundColor: Colors.border, flex: 1, marginBottom: 10 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
