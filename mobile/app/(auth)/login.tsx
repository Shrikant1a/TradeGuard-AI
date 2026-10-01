import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(username.trim(), password);
      const user = await authService.getUser();
      if (user) setAuth(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(
        'Login Failed',
        e?.response?.data?.detail || 'Incorrect username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    await authService.enterGuestMode();
    setAuth({ username: 'Guest' });
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a', '#111827']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#06b6d4', '#3b82f6', '#8b5cf6']}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIcon}>⚡</Text>
            </LinearGradient>
            <Text style={styles.brand}>
              TRADE<Text style={styles.brandAccent}>GUARD</Text>
              <Text style={styles.brandAI}> AI</Text>
            </Text>
            <Text style={styles.tagline}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            <TouchableOpacity onPress={handleGuestMode} style={styles.guestBtn}>
              <Text style={styles.guestText}>Continue as Guest →</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            ⚠️ TradeGuardd is for educational purposes only. Not financial advice.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  logo: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#06b6d4', shadowRadius: 16, shadowOpacity: 0.7, elevation: 8,
  },
  logoIcon: { fontSize: 32 },
  brand: { fontSize: 26, fontWeight: '900', color: '#f8fafc', letterSpacing: 3 },
  brandAccent: { color: '#06b6d4' },
  brandAI: { fontSize: 12, color: '#06b6d4' },
  tagline: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  form: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.xl, gap: Spacing.lg,
  },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    color: Colors.textPrimary, fontSize: 15,
  },
  loginBtn: { marginTop: 4 },
  guestBtn: { alignItems: 'center', paddingVertical: 4 },
  guestText: { color: Colors.textSecondary, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.textSecondary, fontSize: 13 },
  registerLink: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  disclaimer: {
    fontSize: 11, color: Colors.textMuted, textAlign: 'center',
    marginTop: Spacing.xl, lineHeight: 16,
  },
});
