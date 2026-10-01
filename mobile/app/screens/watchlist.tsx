import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useWatchlistStore } from '@/store';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, EmptyState } from '@/components/ui';
import { useState } from 'react';

export default function WatchlistScreen() {
  const router = useRouter();
  const { symbols, add, remove } = useWatchlistStore();
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = () => {
    if (newSymbol.trim()) {
      add(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Watchlist</Text>
      </View>

      {/* Add Symbol */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          value={newSymbol}
          onChangeText={setNewSymbol}
          placeholder="Add symbol (e.g. GOOGL)"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={symbols}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <EmptyState
            icon="★"
            title="No symbols in watchlist"
            message="Add symbols above to track them here."
          />
        )}
        renderItem={({ item }) => (
          <GlassCard style={styles.symbolCard}>
            <TouchableOpacity
              style={styles.symbolRow}
              onPress={() => router.push(`/stock/${item}`)}
              activeOpacity={0.8}
            >
              <View style={styles.symbolIcon}>
                <Text style={styles.symbolIconText}>{item.slice(0, 2)}</Text>
              </View>
              <View style={styles.symbolInfo}>
                <Text style={styles.symbolText}>{item}</Text>
                <Text style={styles.symbolHint}>Tap to view analysis</Text>
              </View>
              <View style={styles.symbolActions}>
                <TouchableOpacity
                  onPress={() => router.push(`/stock/${item}`)}
                  style={styles.analyzeBtn}
                >
                  <Text style={styles.analyzeBtnText}>Analyze →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => remove(item)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </GlassCard>
        )}
      />
    </LinearGradient>
  );
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
  addRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  addInput: {
    flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, height: 46,
    color: Colors.textPrimary, fontSize: 14,
  },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.sm },
  symbolCard: { paddingVertical: Spacing.xs },
  symbolRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  symbolIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#06b6d420', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#06b6d430',
  },
  symbolIconText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  symbolInfo: { flex: 1 },
  symbolText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  symbolHint: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  symbolActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyzeBtn: {
    backgroundColor: '#06b6d420', borderRadius: BorderRadius.md,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#06b6d430',
  },
  analyzeBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  removeBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef444430',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { fontSize: 12, color: Colors.sell },
});
