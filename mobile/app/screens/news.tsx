import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNewsFeed, useBreakingNews } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, LoadingState, ErrorState } from '@/components/ui';
import type { NewsArticle } from '@/types/api';

const CATEGORIES = ['ALL', 'BREAKING', 'STOCK', 'EARNINGS', 'ECONOMY', 'CRYPTO', 'TECHNOLOGY', 'FED'];

export default function NewsScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const newsFeedQuery = useNewsFeed({
    category: category !== 'ALL' ? category : undefined,
    search: search || undefined,
    limit: 30,
  });

  const articles: NewsArticle[] = newsFeedQuery.data?.articles || [];

  const sentimentColor = (s?: string) => {
    if (!s) return Colors.textMuted;
    if (s.toUpperCase() === 'POSITIVE' || s.toUpperCase() === 'BULLISH') return Colors.buy;
    if (s.toUpperCase() === 'NEGATIVE' || s.toUpperCase() === 'BEARISH') return Colors.sell;
    return Colors.textMuted;
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Financial News</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search news..."
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
        />
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.catChip, category === cat && styles.catChipActive]}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={newsFeedQuery.isFetching}
            onRefresh={() => newsFeedQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        {newsFeedQuery.isLoading && <LoadingState message="Loading news..." />}
        {newsFeedQuery.isError && (
          <ErrorState
            message="News feed temporarily unavailable."
            onRetry={() => newsFeedQuery.refetch()}
          />
        )}

        {articles.map((article, i) => (
          <GlassCard key={article.id || i} style={styles.articleCard}>
            {/* Breaking Badge */}
            {article.is_breaking && (
              <View style={styles.breakingBadge}>
                <Text style={styles.breakingText}>🔴 BREAKING</Text>
              </View>
            )}

            {/* Meta */}
            <View style={styles.meta}>
              <Text style={styles.source}>{article.source || 'Market News'}</Text>
              <Text style={styles.time}>{formatTime(article.published_at)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.articleTitle}>{article.title}</Text>

            {/* Summary */}
            {article.summary && (
              <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
            )}

            {/* AI Summary */}
            {article.ai_summary && (
              <View style={styles.aiBox}>
                <Text style={styles.aiLabel}>🤖 AI Summary</Text>
                <Text style={styles.aiText} numberOfLines={2}>{article.ai_summary}</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              {article.sentiment && (
                <Text style={[styles.sentiment, { color: sentimentColor(article.sentiment) }]}>
                  {article.sentiment}
                </Text>
              )}
              {article.impact_score !== undefined && (
                <Text style={styles.impact}>Impact: {article.impact_score.toFixed(0)}/100</Text>
              )}
              {article.symbols && article.symbols.length > 0 && (
                <View style={styles.symbols}>
                  {article.symbols.slice(0, 3).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => router.push(`/stock/${s}`)}
                      style={styles.symbolChip}
                    >
                      <Text style={styles.symbolText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </GlassCard>
        ))}

        {articles.length === 0 && !newsFeedQuery.isLoading && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No articles found</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function formatTime(ts?: string): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  categoryScroll: { marginVertical: 10 },
  categories: { paddingHorizontal: Spacing.lg, gap: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  catChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d415' },
  catText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  catTextActive: { color: Colors.primary },
  content: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.sm },
  articleCard: { gap: 8 },
  breakingBadge: {
    backgroundColor: '#ef444420', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start',
  },
  breakingText: { fontSize: 10, color: Colors.sell, fontWeight: '700' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  source: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  time: { fontSize: 11, color: Colors.textMuted },
  articleTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },
  summary: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  aiBox: {
    backgroundColor: '#06b6d410', borderRadius: BorderRadius.md,
    borderLeftWidth: 3, borderColor: Colors.primary, padding: Spacing.sm,
  },
  aiLabel: { fontSize: 10, color: Colors.primary, fontWeight: '700', marginBottom: 2 },
  aiText: { fontSize: 12, color: Colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  sentiment: { fontSize: 11, fontWeight: '700' },
  impact: { fontSize: 11, color: Colors.textMuted },
  symbols: { flexDirection: 'row', gap: 4, marginLeft: 'auto' },
  symbolChip: {
    backgroundColor: '#06b6d415', borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#06b6d430',
  },
  symbolText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
