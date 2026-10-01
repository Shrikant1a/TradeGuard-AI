import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAlerts, useDeleteAlert } from '@/hooks/useApi';
import { alertsApi } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard, EmptyState, LoadingState, ErrorState, PrimaryButton } from '@/components/ui';
import type { Alert as AlertType } from '@/types/api';
import { getErrorMessage } from '@/services/apiClient';

export default function AlertsScreen() {
  const router = useRouter();
  const alertsQuery = useAlerts();
  const deleteMutation = useDeleteAlert();
  const [showModal, setShowModal] = useState(false);
  const [symbol, setSymbol] = useState('AAPL');
  const [alertType, setAlertType] = useState('PRICE_SIGNAL');
  const [creating, setCreating] = useState(false);

  const alerts: AlertType[] = Array.isArray(alertsQuery.data) ? alertsQuery.data : [];

  const handleCreate = async () => {
    if (!symbol.trim()) return;
    setCreating(true);
    try {
      await alertsApi.createAlert({
        symbol: symbol.toUpperCase(),
        alert_type: alertType,
      });
      await alertsQuery.refetch();
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Alert', 'Remove this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(id);
          } catch (e) {
            Alert.alert('Error', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alerts</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item, i) => String(item.id || i)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={alertsQuery.isFetching}
            onRefresh={() => alertsQuery.refetch()}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={() => (
          <>
            {alertsQuery.isLoading && <LoadingState message="Loading alerts..." />}
            {alertsQuery.isError && (
              <ErrorState
                message="Alerts unavailable."
                onRetry={() => alertsQuery.refetch()}
              />
            )}
          </>
        )}
        ListEmptyComponent={() =>
          !alertsQuery.isLoading && (
            <EmptyState
              icon="🔔"
              title="No alerts set"
              message="Tap '+ New' to create a price or signal alert."
            />
          )
        }
        renderItem={({ item: alert }) => (
          <GlassCard style={styles.alertCard}>
            <View style={styles.alertRow}>
              <View style={[
                styles.alertIcon,
                { backgroundColor: alert.is_active ? '#06b6d420' : '#33415520' }
              ]}>
                <Text style={styles.alertIconText}>
                  {alert.is_active ? '🔔' : '🔕'}
                </Text>
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                <Text style={styles.alertType}>{alert.alert_type || 'Price Alert'}</Text>
                {alert.message && (
                  <Text style={styles.alertMessage} numberOfLines={1}>{alert.message}</Text>
                )}
              </View>
              <View style={styles.alertActions}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: alert.is_active ? Colors.buy : Colors.textMuted }
                ]} />
                {alert.id && (
                  <TouchableOpacity
                    onPress={() => handleDelete(alert.id!)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </GlassCard>
        )}
      />

      {/* Create Alert Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Alert</Text>

            <Text style={styles.inputLabel}>Symbol</Text>
            <TextInput
              style={styles.input}
              value={symbol}
              onChangeText={setSymbol}
              placeholder="AAPL"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Alert Type</Text>
            {['PRICE_SIGNAL', 'VOLUME_SPIKE', 'NEWS_BREAKING', 'RISK_BREACH'].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setAlertType(t)}
                style={[styles.typeChip, alertType === t && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, alertType === t && styles.typeChipTextActive]}>
                  {t.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                title="Create"
                onPress={handleCreate}
                loading={creating}
                style={styles.createBtn}
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
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.sm },
  alertCard: {},
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  alertIconText: { fontSize: 20 },
  alertInfo: { flex: 1 },
  alertSymbol: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  alertType: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  alertMessage: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  alertActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: '#ef444420', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 12, color: Colors.sell },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: {
    backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, gap: Spacing.md, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  inputLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 15,
  },
  typeChip: {
    paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d415' },
  typeChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  typeChipTextActive: { color: Colors.primary },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  createBtn: { flex: 1 },
});
