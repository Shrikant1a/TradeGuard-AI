import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ username, email, password });
      Alert.alert(
        'Account Created',
        'Registration successful! Please sign in.',
        [{ text: 'Sign In', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (e: any) {
      Alert.alert(
        'Registration Failed',
        e?.response?.data?.detail || 'Could not create account. Try a different username.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a', '#111827']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join TradeGuardd today</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: 'Username', value: username, setter: setUsername, placeholder: 'Choose a username', secure: false, keyboard: 'default' as const },
              { label: 'Email', value: email, setter: setEmail, placeholder: 'your@email.com', secure: false, keyboard: 'email-address' as const },
              { label: 'Password', value: password, setter: setPassword, placeholder: 'At least 6 characters', secure: true, keyboard: 'default' as const },
              { label: 'Confirm Password', value: confirm, setter: setConfirm, placeholder: 'Repeat password', secure: true, keyboard: 'default' as const },
            ].map(({ label, value, setter, placeholder, secure, keyboard }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={secure}
                  keyboardType={keyboard}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ))}

            <PrimaryButton title="Create Account" onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  form: {
    backgroundColor: Colors.card, borderRadius: BorderRadius['2xl'],
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.xl, gap: Spacing.lg,
  },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 14,
    color: Colors.textPrimary, fontSize: 15,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.textSecondary, fontSize: 13 },
  loginLink: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
});
