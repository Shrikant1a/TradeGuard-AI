import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <View style={{ opacity: focused ? 1 : 0.5 }}>
        {/* Using text emoji as icons - replace with react-native-vector-icons in production */}
        <View />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0f1e',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string; size: number }) => (
            <View style={[styles.icon, focused && styles.iconActive]}>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{ title: 'Markets' }}
      />
      <Tabs.Screen
        name="signals"
        options={{ title: 'Signals' }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{ title: 'Portfolio' }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconFocused: {
    backgroundColor: '#06b6d420',
  },
  icon: {
    width: 24, height: 24, borderRadius: 4,
    backgroundColor: '#334155',
  },
  iconActive: { backgroundColor: '#06b6d430' },
});
