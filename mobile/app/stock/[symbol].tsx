import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useMarketData, useAnalysis, useSignals, useStockNews,
  useSymbolSentiment, useSignalFusion,
} from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  SignalBadge, RiskBadge, ConfidenceBar,
  GlassCard, LoadingState, ErrorState, SectionHeader, StatCard,
} from '@/components/ui';
import { useWatchlistStore } from '@/store';

const TIMEFRAMES = ['1d', '1wk', '1mo'];
const PERIODS = ['1mo', '3mo', '6mo', '1y', '2y'];

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const sym = (symbol || 'AAPL').toUpperCase();

  const [timeframe, setTimeframe] = useState('1d');
  const [period, setPeriod] = useState('6mo');

  const marketQuery = useMarketData(sym, timeframe, period);
  const analysisQuery = useAnalysis(sym);
  const signalsQuery = useSignals();
  const newsQuery = useStockNews(sym);
  const sentimentQuery = useSymbolSentiment(sym);
  const fusionQuery = useSignalFusion(sym);

  const { has, add, remove } = useWatchlistStore();
  const inWatchlist = has(sym);

  const data = marketQuery.data;
  const quote = data?.quote;
  const analysis = analysisQuery.data;
  const news = Array.isArray(newsQuery.data) ? newsQuery.data.slice(0, 3) : [];
  const fusion = fusionQuery.data;

  // Find signal for this symbol
  const mySignal = Array.isArray(signalsQuery.data)
    ? signalsQuery.data.find(s => s.symbol === sym)
    : null;

  const isPositive = (quote?.change_pct || 0) >= 0;

  const onRefresh = () => {
    marketQuery.refetch();
    analysisQuery.refetch();
    newsQuery.refetch();
    sentimentQuery.refetch();
  };

  const isLoading = marketQuery.isLoading && analysisQuery.isLoading;

  if (isLoading) {
    return (
      <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
        <View style={styles.loadHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <LoadingState message={`Loading ${sym}...`} />
      </LinearGradient>
    );
  }

  if (marketQuery.isError) {
    return (
      <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
        <ErrorState
          message={`Unable to load data for ${sym}.`}
          onRetry={onRefresh}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={marketQuery.isFetching}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* ─── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.symbol}>{sym}</Text>
            {quote?.name && (
              <Text style={styles.companyName} numberOfLines={1}>{quote.name}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => inWatchlist ? remove(sym) : add(sym)}
            style={[styles.watchBtn, inWatchlist && styles.watchBtnActive]}
          >
            <Text style={styles.watchIcon}>{inWatchlist ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Price ─────────────────────────────────────────── */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            ${(quote?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <View style={[
            styles.changeBadge,
            { backgroundColor: isPositive ? '#10b98120' : '#ef444420' }
          ]}>
            <Text style={[styles.change, { color: isPositive ? Colors.buy : Colors.sell }]}>
              {isPositive ? '+' : ''}{(quote?.change || 0).toFixed(2)}
              {' '}({isPositive ? '+' : ''}{(quote?.change_pct || 0).toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* ─── Timeframe Selector ──────────────────────────────── */}
        <View style={styles.tfRow}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf}
              onPress={() => setTimeframe(tf)}
              style={[styles.tfChip, timeframe === tf && styles.tfChipActive]}
            >
              <Text style={[styles.tfText, timeframe === tf && styles.tfTextActive]}>{tf}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.tfDivider} />
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.tfChip, period === p && styles.tfChipActive]}
            >
              <Text style={[styles.tfText, period === p && styles.tfTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Mini Chart Placeholder ─────────────────────────── */}
        {data?.candles && data.candles.length > 0 && (
          <GlassCard style={styles.chartCard}>
            <Text style={styles.chartLabel}>Price History • {data.total_bars} bars</Text>
            <MiniSparkline candles={data.candles} isPositive={isPositive} />
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Low: ${Math.min(...data.candles.map(c => c.low)).toFixed(2)}
              </Text>
              <Text style={styles.chartFooterText}>
                High: ${Math.max(...data.candles.map(c => c.high)).toFixed(2)}
              </Text>
              <Text style={styles.chartFooterText}>
                Bars: {data.total_bars}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* ─── Stats Row ──────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            label="Volume"
            value={formatVolume(quote?.volume)}
          />
          <StatCard
            label="Market Cap"
            value={formatMarketCap(quote?.market_cap)}
          />
        </View>

        {/* ─── AI Signal Card ─────────────────────────────────── */}
        {(mySignal || analysis) && (
          <GlassCard style={styles.signalCard}>
            <Text style={styles.signalCardTitle}>🤖 AI Analysis</Text>
            <View style={styles.signalRow}>
              <SignalBadge
                signal={mySignal?.signal_type || analysis?.ai_signal || 'HOLD'}
                size="lg"
              />
              <RiskBadge risk={mySignal?.risk_score || analysis?.risk_level || 'MEDIUM'} />
            </View>
            <ConfidenceBar
              value={(mySignal?.confidence || analysis?.confidence || 0.72) * 100}
            />
            {mySignal?.explanation && (
              <Text style={styles.explanation}>{mySignal.explanation}</Text>
            )}
            {analysis?.summary && !mySignal?.explanation && (
              <Text style={styles.explanation}>{analysis.summary}</Text>
            )}

            {/* Price Targets */}
            {(mySignal?.entry_price || mySignal?.stop_loss || mySignal?.take_profit) && (
              <View style={styles.targets}>
                {mySignal.entry_price && (
                  <View style={styles.targetItem}>
                    <Text style={styles.targetLabel}>Entry</Text>
                    <Text style={styles.targetValue}>${mySignal.entry_price.toFixed(2)}</Text>
                  </View>
                )}
                {mySignal.stop_loss && (
                  <View style={styles.targetItem}>
                    <Text style={styles.targetLabel}>Stop Loss</Text>
                    <Text style={[styles.targetValue, { color: Colors.sell }]}>
                      ${mySignal.stop_loss.toFixed(2)}
                    </Text>
                  </View>
                )}
                {mySignal.take_profit && (
                  <View style={styles.targetItem}>
                    <Text style={styles.targetLabel}>Take Profit</Text>
                    <Text style={[styles.targetValue, { color: Colors.buy }]}>
                      ${mySignal.take_profit.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </GlassCard>
        )}

        {/* ─── Signal Fusion ───────────────────────────────────── */}
        {fusion && (
          <GlassCard style={styles.fusionCard}>
            <Text style={styles.fusionTitle}>⚡ Signal Fusion</Text>
            <View style={styles.fusionRow}>
              <View style={styles.fusionItem}>
                <Text style={styles.fusionLabel}>Technical</Text>
                <SignalBadge signal={fusion.technical_signal || 'HOLD'} size="sm" />
              </View>
              <Text style={styles.fusionPlus}>+</Text>
              <View style={styles.fusionItem}>
                <Text style={styles.fusionLabel}>News</Text>
                <Text style={[styles.fusionSentiment, {
                  color: fusion.news_sentiment === 'BULLISH' ? Colors.buy
                    : fusion.news_sentiment === 'BEARISH' ? Colors.sell : Colors.textMuted
                }]}>
                  {fusion.news_sentiment}
                </Text>
              </View>
              <Text style={styles.fusionPlus}>=</Text>
              <View style={styles.fusionItem}>
                <Text style={styles.fusionLabel}>Fused</Text>
                <Text style={styles.fusionAction}>{fusion.fused_action}</Text>
              </View>
            </View>
            {fusion.explanation && (
              <Text style={styles.fusionExplanation} numberOfLines={3}>
                {fusion.explanation}
              </Text>
            )}
          </GlassCard>
        )}

        {/* ─── Technical Indicators ─────────────────────────────── */}
        {analysis?.indicators && Object.keys(analysis.indicators).length > 0 && (
          <>
            <SectionHeader title="Technical Indicators" />
            <View style={styles.indicatorsGrid}>
              {Object.entries(analysis.indicators).slice(0, 8).map(([key, value]) => (
                <View key={key} style={styles.indicatorItem}>
                  <Text style={styles.indicatorKey}>{key}</Text>
                  <Text style={styles.indicatorValue}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ─── News Sentiment ─────────────────────────────────── */}
        {sentimentQuery.data && (
          <GlassCard style={styles.sentimentCard}>
            <Text style={styles.sentimentTitle}>📰 News Sentiment</Text>
            <View style={styles.sentimentRow}>
              <View>
                <Text style={[
                  styles.sentimentLabel,
                  {
                    color: sentimentQuery.data.sentiment === 'BULLISH' ? Colors.buy
                      : sentimentQuery.data.sentiment === 'BEARISH' ? Colors.sell : Colors.textMuted
                  }
                ]}>
                  {sentimentQuery.data.sentiment}
                </Text>
                <Text style={styles.sentimentSub}>
                  {sentimentQuery.data.article_count} articles analyzed
                </Text>
              </View>
              <View style={styles.sentimentBars}>
                {sentimentQuery.data.breakdown && (
                  <>
                    <View style={styles.sentimentBarRow}>
                      <Text style={styles.sentimentBarLabel}>Positive</Text>
                      <View style={styles.sentimentTrack}>
                        <View style={[styles.sentimentFill, { width: `${sentimentQuery.data.breakdown.positive || 0}%`, backgroundColor: Colors.buy }]} />
                      </View>
                      <Text style={styles.sentimentPct}>{sentimentQuery.data.breakdown.positive || 0}%</Text>
                    </View>
                    <View style={styles.sentimentBarRow}>
                      <Text style={styles.sentimentBarLabel}>Neutral</Text>
                      <View style={styles.sentimentTrack}>
                        <View style={[styles.sentimentFill, { width: `${sentimentQuery.data.breakdown.neutral || 0}%`, backgroundColor: Colors.warning }]} />
                      </View>
                      <Text style={styles.sentimentPct}>{sentimentQuery.data.breakdown.neutral || 0}%</Text>
                    </View>
                    <View style={styles.sentimentBarRow}>
                      <Text style={styles.sentimentBarLabel}>Negative</Text>
                      <View style={styles.sentimentTrack}>
                        <View style={[styles.sentimentFill, { width: `${sentimentQuery.data.breakdown.negative || 0}%`, backgroundColor: Colors.sell }]} />
                      </View>
                      <Text style={styles.sentimentPct}>{sentimentQuery.data.breakdown.negative || 0}%</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </GlassCard>
        )}

        {/* ─── Related News ────────────────────────────────────── */}
        {news.length > 0 && (
          <>
            <SectionHeader title={`${sym} News`} />
            {news.map((article, i) => (
              <GlassCard key={article.id || i} style={styles.newsCard}>
                <Text style={styles.newsSource}>{article.source}</Text>
                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                {article.ai_summary && (
                  <Text style={styles.newsSummary} numberOfLines={2}>{article.ai_summary}</Text>
                )}
              </GlassCard>
            ))}
          </>
        )}

        {/* ─── Blockchain ─────────────────────────────────────── */}
        {mySignal?.blockchain?.tx_hash && (
          <GlassCard style={styles.chainCard}>
            <Text style={styles.chainTitle}>⛓️ Stellar Soroban Verification</Text>
            <View style={styles.chainRow2}>
              <Text style={styles.chainLabel}>TX Hash</Text>
              <Text style={styles.chainHash} numberOfLines={1}>{mySignal.blockchain.tx_hash}</Text>
            </View>
            {mySignal.blockchain.network && (
              <View style={styles.chainRow2}>
                <Text style={styles.chainLabel}>Network</Text>
                <Text style={styles.chainValue}>{mySignal.blockchain.network}</Text>
              </View>
            )}
            <View style={styles.chainRow2}>
              <Text style={styles.chainLabel}>Status</Text>
              <Text style={[styles.chainValue, { color: Colors.buy }]}>
                {mySignal.blockchain.status || 'CONFIRMED'}
              </Text>
            </View>
          </GlassCard>
        )}

        <Text style={styles.disclaimer}>
          ⚠️ All AI signals are probabilistic. Not financial advice.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Mini Sparkline Component ─────────────────────────────────────────────────
function MiniSparkline({ candles, isPositive }: { candles: any[]; isPositive: boolean }) {
  if (!candles || candles.length === 0) return null;
  const prices = candles.map(c => c.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const color = isPositive ? Colors.buy : Colors.sell;

  return (
    <View style={sparkStyles.container}>
      {prices.slice(-50).map((p, i, arr) => {
        const height = ((p - min) / range) * 50 + 4;
        return (
          <View
            key={i}
            style={[
              sparkStyles.bar,
              {
                height,
                backgroundColor: color,
                opacity: 0.5 + (i / arr.length) * 0.5,
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-end', height: 60,
    gap: 1.5, overflow: 'hidden',
  },
  bar: { flex: 1, borderRadius: 1 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatVolume(v?: number | null): string {
  if (!v) return '—';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(v);
}

function formatMarketCap(v?: number | null): string {
  if (!v) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadHeader: { paddingHorizontal: Spacing.lg, paddingTop: 56 },
  content: { paddingBottom: 40, gap: Spacing.sm },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  headerCenter: { flex: 1 },
  symbol: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 1 },
  companyName: { fontSize: 12, color: Colors.textSecondary },
  watchBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  watchBtnActive: { borderColor: Colors.warning, backgroundColor: '#f59e0b20' },
  watchIcon: { fontSize: 20, color: Colors.warning },
  priceSection: {
    paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  price: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary },
  changeBadge: { borderRadius: BorderRadius.lg, paddingHorizontal: 10, paddingVertical: 4 },
  change: { fontSize: 13, fontWeight: '700' },
  tfRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.lg,
    alignItems: 'center', flexWrap: 'wrap',
  },
  tfChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  tfChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d415' },
  tfText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  tfTextActive: { color: Colors.primary },
  tfDivider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 2 },
  chartCard: { marginHorizontal: Spacing.lg, gap: 8 },
  chartLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  chartFooterText: { fontSize: 11, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  signalCard: { marginHorizontal: Spacing.lg, gap: Spacing.sm },
  signalCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  signalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  explanation: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, fontStyle: 'italic' },
  targets: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm,
  },
  targetItem: { alignItems: 'center' },
  targetLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  targetValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  fusionCard: { marginHorizontal: Spacing.lg, gap: Spacing.sm },
  fusionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  fusionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  fusionItem: { alignItems: 'center', gap: 4 },
  fusionLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  fusionSentiment: { fontSize: 12, fontWeight: '700' },
  fusionAction: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  fusionPlus: { fontSize: 20, color: Colors.textMuted },
  fusionExplanation: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  indicatorsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  indicatorItem: {
    width: '47%', backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.sm,
  },
  indicatorKey: { fontSize: 10, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  indicatorValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  sentimentCard: { marginHorizontal: Spacing.lg, gap: 10 },
  sentimentTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  sentimentRow: { flexDirection: 'row', gap: 16 },
  sentimentLabel: { fontSize: 18, fontWeight: '800' },
  sentimentSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sentimentBars: { flex: 1, gap: 6 },
  sentimentBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sentimentBarLabel: { width: 50, fontSize: 10, color: Colors.textMuted },
  sentimentTrack: { flex: 1, height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2, overflow: 'hidden' },
  sentimentFill: { height: '100%', borderRadius: 2 },
  sentimentPct: { width: 30, fontSize: 10, color: Colors.textMuted, textAlign: 'right' },
  newsCard: { marginHorizontal: Spacing.lg, gap: 4 },
  newsSource: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  newsTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },
  newsSummary: { fontSize: 11, color: Colors.textSecondary },
  chainCard: { marginHorizontal: Spacing.lg, gap: 8 },
  chainTitle: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  chainRow2: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chainLabel: { fontSize: 11, color: Colors.textMuted, width: 70 },
  chainHash: { fontSize: 11, color: Colors.accent, fontFamily: 'monospace', flex: 1 },
  chainValue: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
  disclaimer: {
    fontSize: 11, color: Colors.textMuted, textAlign: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
  },
});
