import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { authService } from '@/services/authService';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui';

const MORE_SECTIONS = [
  {
    title: 'Trading',
    items: [
      { icon: '📰', label: 'Financial News', route: '/screens/news' },
      { icon: '📋', label: 'Watchlist', route: '/screens/watchlist' },
      { icon: '🎯', label: 'Paper Trading', route: '/screens/paper-trading' },
      { icon: '📊', label: 'Backtesting', route: '/screens/backtesting' },
      { icon: '🛡️', label: 'Risk Management', route: '/screens/risk' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { icon: '🔔', label: 'Alerts', route: '/screens/alerts' },
      { icon: '⛓️', label: 'Blockchain Audit', route: '/screens/blockchain' },
      { icon: '🤖', label: 'AI Copilot', route: '/screens/copilot' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: '⚙️', label: 'Settings', route: '/screens/settings' },
      { icon: '🌐', label: 'Open Website', route: null, url: 'https://tradeguardd.netlify.app' },
      { icon: '❓', label: 'Help & Docs', route: null, url: 'https://tradeguardd.netlify.app' },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authService.logout();
    clearAuth();
    router.replace('/(auth)/login');
  };

  const handleItem = (route: string | null, url?: string) => {
    if (url) {
      Linking.openURL(url);
    } else if (route) {
      router.push(route as any);
    }
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
        </View>

        {/* User Card */}
        <GlassCard style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.username || 'G').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username || 'Guest'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'TradeGuardd user'}</Text>
          </View>
        </GlassCard>

        {/* Sections */}
        {MORE_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleItem(item.route, (item as any).url)}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? 'Signing out...' : '→ Sign Out'}
          </Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>TradeGuardd AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0 • Stellar Soroban Verified</Text>
          <Text style={styles.disclaimer}>
            For educational purposes only. Not financial advice.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 40, gap: Spacing.md },
  header: { marginBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xs,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#06b6d430', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#06b6d460',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  userInfo: { flex: 1 },
  username: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 11, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 },
  sectionCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: 14, gap: Spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderColor: Colors.border },
  menuIcon: { fontSize: 20, width: 26, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  menuArrow: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },
  logoutBtn: {
    backgroundColor: '#ef444415', borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: '#ef444430',
    padding: Spacing.lg, alignItems: 'center',
  },
  logoutText: { fontSize: 15, color: Colors.sell, fontWeight: '700' },
  appInfo: { alignItems: 'center', gap: 4 },
  appName: { fontSize: 14, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 2 },
  appVersion: { fontSize: 11, color: Colors.textMuted },
  disclaimer: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
});
