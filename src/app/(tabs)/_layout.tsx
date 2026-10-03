import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '../../components/ui';
import { select, thud } from '../../lib/haptics';
import { colors, gradients } from '../../theme';

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap, string]> = {
  index: ['flame', 'flame-outline', 'Today'],
  discover: ['compass', 'compass-outline', 'Discover'],
  plan: ['calendar', 'calendar-outline', 'Plan'],
  progress: ['stats-chart', 'stats-chart-outline', 'Progress'],
};

function TabItem({ name, focused, onPress }: { name: string; focused: boolean; onPress: () => void }) {
  const s = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 220 });
  }, [focused, s]);
  const pill = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scale: 0.6 + s.value * 0.4 }] }));
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -s.value * 2 }, { scale: 1 + s.value * 0.08 }] }));
  const [on, off, label] = ICONS[name];
  return (
    <Pressable
      onPress={() => {
        select();
        onPress();
      }}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.pill, pill]} />
      <Animated.View style={icon}>
        <Ionicons name={focused ? on : off} size={22} color={focused ? colors.accent : colors.muted} />
      </Animated.View>
      <Text style={[styles.label, { color: focused ? colors.text : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => ICONS[r.name]);
  const go = (name: string, key: string) => {
    const ev = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
    if (!ev.defaultPrevented) navigation.navigate(name);
  };
  const half = Math.ceil(routes.length / 2);
  const item = (r: (typeof routes)[number]) => (
    <TabItem key={r.key} name={r.name} focused={state.routes[state.index].key === r.key} onPress={() => go(r.name, r.key)} />
  );
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {Platform.OS !== 'android' ? <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} /> : null}
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
        {routes.slice(0, half).map(item)}
        <View style={{ width: 64 }} />
        {routes.slice(half).map(item)}
      </View>
      <PressableScale
        onPress={() => {
          thud();
          router.push('/log');
        }}
        haptic={false}
        style={styles.fab}
        scaleTo={0.88}
      >
        <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
          <Ionicons name="add" size={30} color="#06210F" />
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(p) => <FloatingTabBar {...p} />}
      screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="progress" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 480,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tint: { backgroundColor: Platform.OS === 'android' ? 'rgba(14,19,17,0.96)' : 'rgba(14,19,17,0.55)' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  pill: { position: 'absolute', width: 56, height: 52, borderRadius: 18, backgroundColor: 'rgba(61,220,132,0.14)' },
  label: { fontSize: 10.5, fontWeight: '700', marginTop: 3 },
  fab: {
    position: 'absolute',
    top: -14,
    width: 64,
    height: 64,
    borderRadius: 32,
    boxShadow: '0px 8px 24px rgba(61,220,132,0.45)',
  },
  fabInner: { flex: 1, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.bg },
});
