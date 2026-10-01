import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePortfolio, useTradeHistory, usePlaceTrade, useResetBalance, useCheckRisk } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, PnLText, LoadingState, ErrorState, PrimaryButton, StatCard } from '@/components/ui';
import type { PlaceOrderRequest } from '@/types/api';
import { getErrorMessage } from '@/services/apiClient';

export default function PortfolioScreen() {
  const [tradeModal, setTradeModal] = useState(false);
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('10');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const portfolioQuery = usePortfolio();
  const historyQuery = useTradeHistory();
  const placeTrade = usePlaceTrade();
  const resetBalance = useResetBalance();
  const checkRisk = useCheckRisk();

  const portfolio = portfolioQuery.data;
  const history = Array.isArray(historyQuery.data) ? historyQuery.data.slice(0, 10) : [];

  const handleTrade = async () => {
    const qty = parseFloat(quantity);
    const pr = parseFloat(price);
    if (!symbol || isNaN(qty) || qty <= 0 || isNaN(pr) || pr <= 0) {
      Alert.alert('Invalid', 'Please enter valid symbol, quantity, and price.');
      return;
    }

    // Pre-trade risk check
    try {
      const risk = await checkRisk.mutateAsync({
        symbol: symbol.toUpperCase(),
        side,
        quantity: qty,
        price: pr,
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
      });

      if (!risk.approved) {
        Alert.alert(
          '⚠️ Risk Check Failed',
          risk.reasons?.join('\n') || 'Trade blocked by risk engine.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch {
      // Risk check failed - allow trade with warning
    }

    Alert.alert(
      'Confirm Paper Trade',
      `${side} ${qty} shares of ${symbol.toUpperCase()} at $${pr.toFixed(2)}\n\nEstimated Value: $${(qty * pr).toFixed(2)}\n\n⚠️ This is paper trading simulation only.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Trade',
          onPress: async () => {
            try {
              await placeTrade.mutateAsync({
                symbol: symbol.toUpperCase(),
                side,
                quantity: qty,
                price: pr,
                stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
                take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
              });
              setTradeModal(false);
              Alert.alert('✅ Trade Placed', `${side} ${qty}x ${symbol.toUpperCase()} executed successfully.`);
            } catch (e) {
              Alert.alert('Trade Failed', getErrorMessage(e));
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Portfolio',
      'This will reset your paper trading balance to the initial capital. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetBalance.mutateAsync();
              Alert.alert('Portfolio Reset', 'Your balance has been reset.');
            } catch (e) {
              Alert.alert('Error', getErrorMessage(e));
            }
          },
        },
      ]
    );
  };

  if (portfolioQuery.isLoading) return <LoadingState message="Loading portfolio..." />;
  if (portfolioQuery.isError) return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ErrorState
        message="Portfolio data unavailable."
        onRetry={() => portfolioQuery.refetch()}
      />
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={portfolioQuery.isFetching}
            onRefresh={() => { portfolioQuery.refetch(); historyQuery.refetch(); }}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTradeModal(true)} style={styles.tradeBtn}>
              <LinearGradient colors={['#06b6d4', '#3b82f6']} style={styles.tradeBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.tradeBtnText}>+ Trade</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Value Card */}
        {portfolio && (
          <LinearGradient
            colors={['#06b6d420', '#3b82f610']}
            style={styles.valueCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.valueLabel}>Total Portfolio Value</Text>
            <Text style={styles.totalValue}>
              ${portfolio.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </Text>
            <PnLText
              value={portfolio.total_pnl || 0}
              prefix="$"
              suffix={` (${(portfolio.total_pnl_pct || 0).toFixed(2)}%)`}
              style={styles.pnlText}
            />
            <View style={styles.statsRow}>
              <StatCard label="Cash" value={`$${(portfolio.cash_balance || 0).toFixed(0)}`} />
              <StatCard label="Positions" value={String(portfolio.open_positions_count || 0)} />
              <StatCard
                label="Exposure"
                value={`${(portfolio.portfolio_exposure_pct || 0).toFixed(1)}%`}
              />
            </View>
          </LinearGradient>
        )}

        {/* Positions */}
        <Text style={styles.sectionTitle}>Holdings</Text>
        {portfolio?.positions && portfolio.positions.length > 0 ? (
          portfolio.positions.map((pos, i) => (
            <GlassCard key={pos.symbol + i} style={styles.positionCard}>
              <View style={styles.posRow}>
                <View>
                  <Text style={styles.posSymbol}>{pos.symbol}</Text>
                  <Text style={styles.posQty}>{pos.quantity} shares</Text>
                </View>
                <View style={styles.posRight}>
                  <Text style={styles.posValue}>
                    ${(pos.market_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                  <PnLText value={pos.unrealized_pnl || 0} prefix="$" />
                </View>
              </View>
              <View style={styles.posDetails}>
                <Text style={styles.posDetail}>Avg: ${(pos.average_entry || 0).toFixed(2)}</Text>
                {pos.current_price && (
                  <Text style={styles.posDetail}>Current: ${pos.current_price.toFixed(2)}</Text>
                )}
                {pos.unrealized_pnl_pct !== undefined && (
                  <PnLText value={pos.unrealized_pnl_pct} suffix="%" style={{ fontSize: 12 }} />
                )}
              </View>
            </GlassCard>
          ))
        ) : (
          <GlassCard>
            <Text style={styles.emptyText}>No open positions. Place a paper trade to get started.</Text>
          </GlassCard>
        )}

        {/* Trade History */}
        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Recent Trades</Text>
            {history.map((trade, i) => (
              <GlassCard key={trade.id || i} style={styles.tradeCard}>
                <View style={styles.tradeRow}>
                  <View style={[
                    styles.tradeSideBadge,
                    { backgroundColor: trade.side === 'BUY' ? '#10b98120' : '#ef444420' }
                  ]}>
                    <Text style={[
                      styles.tradeSideText,
                      { color: trade.side === 'BUY' ? Colors.buy : Colors.sell }
                    ]}>
                      {trade.side}
                    </Text>
                  </View>
                  <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                  <Text style={styles.tradeQty}>{trade.quantity}x</Text>
                  <Text style={styles.tradePrice}>${trade.price?.toFixed(2)}</Text>
                  {trade.pnl !== undefined && trade.pnl !== null && (
                    <PnLText value={trade.pnl} prefix="$" style={{ fontSize: 12 }} />
                  )}
                </View>
              </GlassCard>
            ))}
          </>
        )}
      </ScrollView>

      {/* ─── Paper Trade Modal ─────────────────────────────────── */}
      <Modal visible={tradeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📊 Paper Trade</Text>
            <Text style={styles.modalSub}>⚠️ Simulation only — no real money</Text>

            {/* Side Toggle */}
            <View style={styles.sideToggle}>
              {(['BUY', 'SELL'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSide(s)}
                  style={[styles.sideBtn, side === s && (s === 'BUY' ? styles.sideBtnBuy : styles.sideBtnSell)]}
                >
                  <Text style={[styles.sideBtnText, side === s && styles.sideBtnTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            {[
              { label: 'Symbol', value: symbol, setter: setSymbol, placeholder: 'AAPL', upper: true },
              { label: 'Quantity', value: quantity, setter: setQuantity, placeholder: '10', upper: false },
              { label: 'Price ($)', value: price, setter: setPrice, placeholder: '182.50', upper: false },
              { label: 'Stop Loss ($) Optional', value: stopLoss, setter: setStopLoss, placeholder: 'e.g. 175.00', upper: false },
              { label: 'Take Profit ($) Optional', value: takeProfit, setter: setTakeProfit, placeholder: 'e.g. 195.00', upper: false },
            ].map(({ label, value, setter, placeholder, upper }) => (
              <View key={label}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize={upper ? 'characters' : 'none'}
                  keyboardType={upper ? 'default' : 'decimal-pad'}
                />
              </View>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setTradeModal(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                title="Confirm Trade"
                onPress={handleTrade}
                loading={placeTrade.isPending}
                style={styles.confirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 32, gap: Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  headerButtons: { flexDirection: 'row', gap: 8 },
  resetBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  resetText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  tradeBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  tradeBtnGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  tradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  valueCard: { borderRadius: BorderRadius['2xl'], padding: Spacing.xl, borderWidth: 1, borderColor: '#06b6d430', gap: 6, marginBottom: Spacing.sm },
  valueLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  totalValue: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary },
  pnlText: { fontSize: 16, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  positionCard: { gap: Spacing.xs },
  posRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  posSymbol: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  posQty: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  posRight: { alignItems: 'flex-end' },
  posValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  posDetails: {
    flexDirection: 'row', gap: 12, flexWrap: 'wrap',
    borderTopWidth: 1, borderColor: Colors.border, paddingTop: Spacing.xs,
  },
  posDetail: { fontSize: 11, color: Colors.textMuted },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  tradeCard: { paddingVertical: Spacing.sm },
  tradeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  tradeSideBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tradeSideText: { fontSize: 11, fontWeight: '700' },
  tradeSymbol: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  tradeQty: { fontSize: 12, color: Colors.textSecondary },
  tradePrice: { fontSize: 12, color: Colors.textSecondary },
  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, gap: Spacing.md, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: 12, color: Colors.warning, marginTop: -8 },
  sideToggle: { flexDirection: 'row', gap: 8 },
  sideBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  sideBtnBuy: { backgroundColor: '#10b98120', borderColor: Colors.buy },
  sideBtnSell: { backgroundColor: '#ef444420', borderColor: Colors.sell },
  sideBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  sideBtnTextActive: { color: Colors.textPrimary },
  inputLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 15,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 1 },
});
