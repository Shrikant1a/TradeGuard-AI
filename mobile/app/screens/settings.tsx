import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore, useSettingsStore } from '@/store';
import { authService } from '@/services/authService';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { currency, notificationsEnabled, setCurrency, setNotifications } = useSettingsStore();

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.username || 'G').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.username}>{user?.username || 'Guest'}</Text>
            <Text style={styles.email}>{user?.email || 'tradeguardd.netlify.app'}</Text>
          </View>
        </GlassCard>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <GlassCard>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Alerts for new signals & news</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>

        {/* Currency */}
        <GlassCard>
          <Text style={styles.settingLabel}>Display Currency</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCurrency(c)}
                style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
              >
                <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <GlassCard style={styles.aboutCard}>
          {[
            { label: 'App Version', value: '1.0.0' },
            { label: 'Platform', value: 'TradeGuardd AI' },
            { label: 'Backend', value: 'FastAPI + Python' },
            { label: 'Blockchain', value: 'Stellar Soroban Testnet' },
            { label: 'AI Engine', value: 'TradeGuard-v1.2' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{label}</Text>
              <Text style={styles.aboutValue}>{value}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Legal */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <GlassCard>
          {[
            'Privacy Policy',
            'Terms of Service',
            'Risk Disclosure',
            'Open Source Licenses',
          ].map((item) => (
            <TouchableOpacity key={item} style={styles.legalRow}>
              <Text style={styles.legalText}>{item}</Text>
              <Text style={styles.legalArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          TradeGuardd AI is for educational purposes only.{'\n'}
          Not financial advice. All signals are probabilistic.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 40, gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.textSecondary, marginTop: -4 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#06b6d430', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#06b6d460',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  username: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: 11, color: Colors.textMuted, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4,
  },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  settingDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  currencyRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  currencyChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  currencyChipActive: { borderColor: Colors.primary, backgroundColor: '#06b6d415' },
  currencyText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  currencyTextActive: { color: Colors.primary },
  aboutCard: { gap: 2 },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: Colors.border,
  },
  aboutLabel: { fontSize: 13, color: Colors.textSecondary },
  aboutValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  legalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 0,
  },
  legalText: { fontSize: 15, color: Colors.textPrimary },
  legalArrow: { fontSize: 22, color: Colors.textMuted },
  logoutBtn: {
    backgroundColor: '#ef444415', borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: '#ef444430', padding: Spacing.lg, alignItems: 'center',
  },
  logoutText: { fontSize: 15, color: Colors.sell, fontWeight: '700' },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
