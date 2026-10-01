import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store';
import { Colors } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <LinearGradient
      colors={['#0a0f1e', '#0f172a', '#111827']}
      style={styles.container}
    >
      {/* Shield Icon */}
      <Animated.View style={[styles.logoContainer, { opacity, transform: [{ scale }] }]}>
        <LinearGradient
          colors={['#06b6d4', '#3b82f6', '#8b5cf6']}
          style={styles.iconWrapper}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconText}>⚡</Text>
        </LinearGradient>

        <Text style={styles.brandName}>
          TRADE<Text style={styles.brandAccent}>GUARD</Text>
          <Text style={styles.aiBadge}> AI</Text>
        </Text>

        <View style={styles.taglineRow}>
          <View style={styles.taglineDot} />
          <Text style={styles.tagline}>Stellar Soroban Verified</Text>
        </View>

        <Text style={styles.subtitle}>
          AI signals. Risk-controlled decisions.{'\n'}Blockchain-verified records.
        </Text>
      </Animated.View>

      {/* Bottom loader */}
      <View style={styles.footer}>
        <View style={styles.loaderDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={[styles.dot, { opacity }]} />
          ))}
        </View>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoContainer: { alignItems: 'center', gap: 16 },
  iconWrapper: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 10,
  },
  iconText: { fontSize: 40 },
  brandName: {
    fontSize: 32, fontWeight: '900', color: '#f8fafc',
    letterSpacing: 4, marginTop: 8,
  },
  brandAccent: { color: '#06b6d4' },
  aiBadge: {
    fontSize: 14, color: '#06b6d4', fontWeight: '700',
    backgroundColor: '#0f172a',
  },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taglineDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981',
  },
  tagline: { fontSize: 11, color: '#94a3b8', letterSpacing: 1 },
  subtitle: {
    fontSize: 13, color: '#64748b', textAlign: 'center',
    lineHeight: 20, marginTop: 4,
  },
  footer: {
    position: 'absolute', bottom: 48,
    alignItems: 'center', gap: 8,
  },
  loaderDots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#06b6d4',
  },
  footerText: { fontSize: 11, color: '#334155' },
});
