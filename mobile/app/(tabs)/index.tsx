import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSignals, usePortfolio, useBreakingNews, useTopMovers } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  SignalBadge, RiskBadge, ConfidenceBar, GlassCard,
  SectionHeader, LoadingState, PnLText,
} from '@/components/ui';
import { useAuthStore, useWatchlistStore } from '@/store';
import type { Signal, ScannerResult } from '@/types/api';
import { isNetworkError } from '@/services/apiClient';

const MARKET_INDICES = [
  { label: 'S&P 500', symbol: 'SPY', price: '4,890.23', change: '+0.82%', up: true },
  { label: 'NASDAQ', symbol: 'QQQ', price: '16,441', change: '+1.14%', up: true },
  { label: 'NIFTY 50', symbol: 'NIFTY', price: '21,837', change: '-0.31%', up: false },
  { label: 'BTC/USD', symbol: 'BTC-USD', price: '$68,420', change: '+2.41%', up: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const watchlist = useWatchlistStore((s) => s.symbols);

  const signalsQuery = useSignals();
  const portfolioQuery = usePortfolio();
  const newsQuery = useBreakingNews(4);
  const moversQuery = useTopMovers();

  const isRefreshing = signalsQuery.isFetching || portfolioQuery.isFetching;

  const onRefresh = () => {
    signalsQuery.refetch();
    portfolioQuery.refetch();
    newsQuery.refetch();
    moversQuery.refetch();
  };

  const signals: Signal[] = Array.isArray(signalsQuery.data)
    ? signalsQuery.data.slice(0, 3)
    : [];

  const portfolio = portfolioQuery.data;
  const news = Array.isArray(newsQuery.data) ? newsQuery.data.slice(0, 3) : [];
  const movers: ScannerResult[] = Array.isArray(moversQuery.data)
    ? moversQuery.data.slice(0, 5)
    : [];

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        contentContainerStyle={styles.content}
      >
        {/* ─── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.username}>{user?.username || 'Trader'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(tabs)/more')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Market Sentiment Banner ─────────────────────────── */}
        <LinearGradient
          colors={['#06b6d415', '#3b82f610']}
          style={styles.sentimentBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.sentimentRow}>
            <View style={styles.sentimentDot} />
            <Text style={styles.sentimentLabel}>AI Market Sentiment</Text>
            <Text style={styles.sentimentBadge}>BULLISH</Text>
          </View>
          <Text style={styles.sentimentSub}>
            Technical indicators strong • News sentiment positive • Risk: Medium
          </Text>
        </LinearGradient>

        {/* ─── Market Indices ───────────────────────────────────── */}
        <SectionHeader title="Market Overview" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicesScroll}>
          {MARKET_INDICES.map((idx) => (
            <GlassCard key={idx.symbol} style={styles.indexCard}>
              <Text style={styles.indexLabel}>{idx.label}</Text>
              <Text style={styles.indexPrice}>{idx.price}</Text>
              <Text style={[styles.indexChange, { color: idx.up ? Colors.buy : Colors.sell }]}>
                {idx.change}
              </Text>
            </GlassCard>
          ))}
        </ScrollView>

        {/* ─── AI Signals ───────────────────────────────────────── */}
        <SectionHeader
          title="AI Signals"
          action="View All"
          onAction={() => router.push('/(tabs)/signals')}
        />
        {signalsQuery.isLoading ? (
          <LoadingState message="Loading signals..." />
        ) : signals.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyText}>No signals available. Tap "View All" to generate.</Text>
          </GlassCard>
        ) : (
          signals.map((sig, i) => (
            <TouchableOpacity
              key={sig.signal_code || i}
              onPress={() => router.push(`/stock/${sig.symbol}`)}
              activeOpacity={0.85}
            >
              <GlassCard style={styles.signalCard}>
                <View style={styles.signalTop}>
                  <View>
                    <Text style={styles.signalSymbol}>{sig.symbol}</Text>
                    <Text style={styles.signalSubtitle}>
                      {sig.entry_price ? `$${sig.entry_price.toFixed(2)}` : 'Market Price'}
                    </Text>
                  </View>
                  <View style={styles.signalRight}>
                    <SignalBadge signal={sig.signal_type} />
                    <RiskBadge risk={sig.risk_score} />
                  </View>
                </View>
                <View style={{ marginTop: Spacing.sm }}>
                  <ConfidenceBar value={sig.confidence * 100} />
                </View>
                {sig.blockchain?.tx_hash && (
                  <View style={styles.chainRow}>
                    <Text style={styles.chainIcon}>⛓</Text>
                    <Text style={styles.chainText} numberOfLines={1}>
                      {sig.blockchain.tx_hash.slice(0, 20)}...
                    </Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))
        )}

        {/* ─── Portfolio Summary ────────────────────────────────── */}
        {portfolio && (
          <>
            <SectionHeader
              title="Portfolio"
              action="Details"
              onAction={() => router.push('/(tabs)/portfolio')}
            />
            <GlassCard style={styles.portfolioCard}>
              <Text style={styles.portfolioLabel}>Total Value</Text>
              <Text style={styles.portfolioValue}>
                ${portfolio.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </Text>
              <View style={styles.portfolioRow}>
                <View>
                  <Text style={styles.portfolioMeta}>Cash Available</Text>
                  <Text style={styles.portfolioMeta2}>
                    ${portfolio.cash_balance?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={styles.pnlContainer}>
                  <Text style={styles.portfolioMeta}>Total P&L</Text>
                  <PnLText value={portfolio.total_pnl || 0} prefix="$" style={styles.pnl} />
                </View>
              </View>
              <View style={styles.exposureRow}>
                <Text style={styles.exposureLabel}>Portfolio Exposure</Text>
                <Text style={styles.exposureValue}>
                  {portfolio.portfolio_exposure_pct?.toFixed(1) || '0'}%
                </Text>
              </View>
            </GlassCard>
          </>
        )}

        {/* ─── Top Movers ───────────────────────────────────────── */}
        {movers.length > 0 && (
          <>
            <SectionHeader title="Top Movers" />
            {movers.map((m) => (
              <TouchableOpacity
                key={m.symbol}
                onPress={() => router.push(`/stock/${m.symbol}`)}
              >
                <GlassCard style={styles.moverCard}>
                  <View style={styles.moverRow}>
                    <Text style={styles.moverSymbol}>{m.symbol}</Text>
                    <View style={styles.moverRight}>
                      {m.price && <Text style={styles.moverPrice}>${m.price.toFixed(2)}</Text>}
                      <Text style={[
                        styles.moverChange,
                        { color: (m.change_pct || 0) >= 0 ? Colors.buy : Colors.sell }
                      ]}>
                        {(m.change_pct || 0) >= 0 ? '+' : ''}
                        {(m.change_pct || 0).toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ─── Breaking News ────────────────────────────────────── */}
        {news.length > 0 && (
          <>
            <SectionHeader
              title="Breaking News"
              action="All News"
              onAction={() => router.push('/(tabs)/more')}
            />
            {news.map((article, i) => (
              <GlassCard key={article.id || i} style={styles.newsCard}>
                <View style={styles.newsMeta}>
                  {article.is_breaking && (
                    <View style={styles.breakingBadge}>
                      <Text style={styles.breakingText}>BREAKING</Text>
                    </View>
                  )}
                  <Text style={styles.newsSource}>{article.source || 'Market News'}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                {article.sentiment && (
                  <Text style={[
                    styles.newsSentiment,
                    {
                      color: article.sentiment === 'POSITIVE' ? Colors.buy
                        : article.sentiment === 'NEGATIVE' ? Colors.sell
                          : Colors.textMuted
                    }
                  ]}>
                    {article.sentiment} sentiment
                    {article.impact_score ? ` • Impact: ${article.impact_score.toFixed(0)}` : ''}
                  </Text>
                )}
              </GlassCard>
            ))}
          </>
        )}

        {/* ─── Disclaimer ───────────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ AI-generated decision-support analysis only. Not financial advice.
            All signals are probabilistic.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 32, gap: Spacing.sm },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  greeting: { fontSize: 13, color: Colors.textSecondary },
  username: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  sentimentBanner: {
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: '#06b6d430',
    padding: Spacing.md, marginBottom: Spacing.sm, gap: 6,
  },
  sentimentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sentimentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.buy },
  sentimentLabel: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  sentimentBadge: {
    fontSize: 11, color: Colors.buy, fontWeight: '700',
    backgroundColor: '#10b98120', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  sentimentSub: { fontSize: 11, color: Colors.textMuted },
  indicesScroll: { marginHorizontal: -Spacing.lg, paddingLeft: Spacing.lg, marginBottom: Spacing.sm },
  indexCard: { width: 130, marginRight: Spacing.sm, padding: Spacing.md },
  indexLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  indexPrice: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  indexChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  signalCard: { marginBottom: Spacing.sm },
  signalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  signalSymbol: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  signalSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  signalRight: { gap: 6, alignItems: 'flex-end' },
  chainRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  chainIcon: { fontSize: 10, color: Colors.accent },
  chainText: { fontSize: 10, color: Colors.accent, flex: 1 },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  portfolioCard: { gap: Spacing.sm },
  portfolioLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  portfolioValue: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary },
  portfolioRow: { flexDirection: 'row', justifyContent: 'space-between' },
  portfolioMeta: { fontSize: 11, color: Colors.textMuted },
  portfolioMeta2: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  pnlContainer: { alignItems: 'flex-end' },
  pnl: { fontSize: 15 },
  exposureRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4,
  },
  exposureLabel: { fontSize: 12, color: Colors.textSecondary },
  exposureValue: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  moverCard: { paddingVertical: Spacing.sm, marginBottom: Spacing.xs },
  moverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moverSymbol: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  moverRight: { alignItems: 'flex-end' },
  moverPrice: { fontSize: 13, color: Colors.textSecondary },
  moverChange: { fontSize: 13, fontWeight: '700' },
  newsCard: { gap: 6, marginBottom: Spacing.xs },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakingBadge: {
    backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef444440',
    borderRadius: BorderRadius.full, paddingHorizontal: 6, paddingVertical: 1,
  },
  breakingText: { fontSize: 9, color: Colors.sell, fontWeight: '700', letterSpacing: 0.5 },
  newsSource: { fontSize: 11, color: Colors.textMuted },
  newsTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },
  newsSentiment: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  disclaimer: {
    borderTopWidth: 1, borderColor: Colors.border, paddingTop: Spacing.lg, marginTop: Spacing.md,
  },
  disclaimerText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
