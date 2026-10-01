import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTopMovers, useAssetSearch } from '@/hooks/useApi';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, LoadingState, ErrorState, SectionHeader } from '@/components/ui';
import type { ScannerResult, Asset } from '@/types/api';

const POPULAR = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy' },
];

export default function MarketsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const moversQuery = useTopMovers();
  const searchQuery = useAssetSearch(debouncedQuery);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    // Debounce 500ms
    const timer = setTimeout(() => setDebouncedQuery(text), 500);
    return () => clearTimeout(timer);
  }, []);

  const navigate = (symbol: string) => router.push(`/stock/${symbol}`);

  const movers: ScannerResult[] = Array.isArray(moversQuery.data) ? moversQuery.data : [];
  const searchResults: Asset[] = Array.isArray(searchQuery.data) ? searchQuery.data : [];

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search AAPL, Apple, TSLA..."
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={debouncedQuery.length > 0 ? searchResults : (movers.length > 0 ? movers : [])}
        keyExtractor={(item, i) => item.symbol || String(i)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={moversQuery.isFetching}
            onRefresh={() => moversQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Search Results */}
            {debouncedQuery.length > 0 && (
              <SectionHeader
                title={searchQuery.isLoading ? 'Searching...' : `Results (${searchResults.length})`}
              />
            )}

            {/* Popular Stocks (when not searching) */}
            {debouncedQuery.length === 0 && (
              <>
                <SectionHeader title="Popular Stocks" />
                <View style={styles.popularGrid}>
                  {POPULAR.map((item) => (
                    <TouchableOpacity
                      key={item.symbol}
                      style={styles.popularChip}
                      onPress={() => navigate(item.symbol)}
                    >
                      <Text style={styles.popularSymbol}>{item.symbol}</Text>
                      <Text style={styles.popularName} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <SectionHeader
                  title="Top Movers"
                  subtitle="AI-scanned opportunities"
                />
              </>
            )}

            {/* Loading / Error States */}
            {debouncedQuery.length === 0 && moversQuery.isLoading && (
              <LoadingState message="Scanning market..." />
            )}
            {debouncedQuery.length === 0 && moversQuery.isError && (
              <ErrorState
                message="Market data temporarily unavailable."
                onRetry={() => moversQuery.refetch()}
              />
            )}
          </>
        )}
        renderItem={({ item }) => {
          const changePct = (item as any).change_pct || 0;
          const isUp = changePct >= 0;
          return (
            <TouchableOpacity onPress={() => navigate(item.symbol)} activeOpacity={0.8}>
              <GlassCard style={styles.moverCard}>
                <View style={styles.moverRow}>
                  <View style={styles.moverLeft}>
                    <View style={styles.symbolBadge}>
                      <Text style={styles.symbolBadgeText}>
                        {item.symbol.slice(0, 2)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.moverSymbol}>{item.symbol}</Text>
                      <Text style={styles.moverName} numberOfLines={1}>
                        {(item as any).name || 'Asset'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.moverRight}>
                    {(item as any).price && (
                      <Text style={styles.moverPrice}>
                        ${(item as any).price.toFixed(2)}
                      </Text>
                    )}
                    <View style={[
                      styles.changeBadge,
                      { backgroundColor: isUp ? '#10b98115' : '#ef444415' }
                    ]}>
                      <Text style={[styles.changeText, { color: isUp ? Colors.buy : Colors.sell }]}>
                        {isUp ? '+' : ''}{changePct.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() =>
          debouncedQuery.length > 0 && !searchQuery.isLoading
            ? <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results for "{debouncedQuery}"</Text>
            </View>
            : null
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm, height: 48,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  clearBtn: { color: Colors.textMuted, fontSize: 14, paddingHorizontal: 4 },
  list: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.xs },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  popularChip: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    minWidth: '28%',
  },
  popularSymbol: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  popularName: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  moverCard: { paddingVertical: Spacing.sm },
  moverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moverLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  symbolBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#06b6d420', alignItems: 'center', justifyContent: 'center',
  },
  symbolBadgeText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  moverSymbol: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  moverName: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  moverRight: { alignItems: 'flex-end', gap: 4 },
  moverPrice: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  changeBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  changeText: { fontSize: 12, fontWeight: '700' },
  noResults: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  noResultsText: { color: Colors.textSecondary, fontSize: 14 },
});
