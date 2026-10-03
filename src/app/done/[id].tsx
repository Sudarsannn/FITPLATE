import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountUp, DishArt, FadeIn, Glass, GradientButton, PressableScale } from '../../components/ui';
import { costToMake, costToOrder, getDish } from '../../data/dishes';
import { select } from '../../lib/haptics';
import { EXERCISES, useStore } from '../../lib/store';
import { colors, type } from '../../theme';

const { width: W, height: H } = Dimensions.get('window');
const BITS = ['🎉', '✨', '🥳', '🍽️', '💚', '⭐', '🔥', '🎊'];

function Particle({ i }: { i: number }) {
  const t = useSharedValue(0);
  const seed = (i * 9301 + 49297) % 233280;
  const r = (n: number) => ((seed * (n + 1)) % 1000) / 1000;
  const x0 = W / 2;
  const dx = (r(1) - 0.5) * W * 1.2;
  const up = 220 + r(2) * 260;
  const delay = r(3) * 200;
  const duration = 1800 + r(4) * 900;
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
  }, [t, delay, duration]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value * t.value,
    transform: [
      { translateX: x0 + dx * t.value },
      { translateY: H * 0.32 - up * t.value + 420 * t.value * t.value },
      { rotate: `${(r(5) - 0.5) * 720 * t.value}deg` },
      { scale: 0.6 + r(6) * 0.8 },
    ],
  }));
  return <Animated.Text style={[{ position: 'absolute', fontSize: 26, left: -13, top: 0 }, style]}>{BITS[i % BITS.length]}</Animated.Text>;
}

export default function DoneScreen() {
  const { id, servings: s } = useLocalSearchParams<{ id: string; servings?: string }>();
  const dish = getDish(id);
  const servings = Number(s) || dish?.baseServings || 2;
  const { logCooked } = useStore();
  const logged = useRef(false);
  const [stars, setStars] = useState(0);

  const saved = dish ? costToOrder(dish, servings) - costToMake(dish, servings) : 0;

  useEffect(() => {
    if (!dish || logged.current) return;
    logged.current = true;
    logCooked(dish, saved);
  }, [dish, saved, logCooked]);

  if (!dish) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Animated.View entering={ZoomIn.springify().damping(10)} style={{ alignItems: 'center', marginTop: 20 }}>
            <DishArt emoji={dish.emoji} palette={dish.palette} size={140} rounded={70} />
          </Animated.View>
          <FadeIn i={1}>
            <Text style={[type.hero, { color: colors.text, textAlign: 'center', marginTop: 16 }]}>Chef mode: on.</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6, fontSize: 16 }}>You made {dish.name} 👏</Text>
          </FadeIn>

          <FadeIn i={2}>
            <Glass style={{ marginTop: 22, flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <CountUp value={saved} prefix="₹" style={styles.big} />
                <Text style={styles.small}>saved vs ordering</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <CountUp value={dish.restaurantKcal - dish.kcal} style={[styles.big, { color: colors.accent }]} />
                <Text style={styles.small}>kcal saved per plate</Text>
              </View>
            </Glass>
          </FadeIn>

          <FadeIn i={3}>
            <Text style={styles.h}>Burn one plate off</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {EXERCISES.filter((e) => ['Run', 'Walk', 'Cycle', 'Yoga'].includes(e.type)).map((e) => (
                <View key={e.type} style={styles.burn}>
                  <Text style={{ fontSize: 22 }}>{e.emoji}</Text>
                  <Text style={{ color: colors.warm, fontWeight: '900', fontSize: 16 }}>{Math.round((dish.kcal / (e.met * 70)) * 60)}m</Text>
                </View>
              ))}
            </View>
          </FadeIn>

          <FadeIn i={4}>
            <Text style={styles.h}>How did it turn out?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <PressableScale
                  key={n}
                  haptic={false}
                  onPress={() => {
                    select();
                    setStars(n);
                  }}
                  scaleTo={0.8}
                >
                  <Animated.Text key={`${n}-${stars >= n}`} entering={stars >= n ? ZoomIn.springify().damping(8) : undefined} style={{ fontSize: 36, opacity: stars >= n ? 1 : 0.3 }}>
                    ⭐
                  </Animated.Text>
                </PressableScale>
              ))}
            </View>
            {stars ? <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8 }}>Thanks! Ratings help us recommend better dishes.</Text> : null}
          </FadeIn>

          <FadeIn i={5}>
            {[
              ['🍽️ Eating it', dish.finish.eat],
              ['🧊 Storing leftovers', dish.finish.store],
              ['🔁 Leftover remix', dish.finish.remix],
              ['🥗 Even healthier next time', dish.finish.healthier],
            ].map(([t, b]) => (
              <Glass key={t} style={{ marginTop: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 4 }}>{t}</Text>
                <Text style={{ color: colors.muted, lineHeight: 21 }}>{b}</Text>
              </Glass>
            ))}
          </FadeIn>

          <View style={{ marginTop: 24 }}>
            <GradientButton title="Back to today" onPress={() => router.dismissTo('/(tabs)')} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 28 }).map((_, i) => (
          <Particle key={i} i={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  big: { color: colors.warn, fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  small: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  h: { ...type.h2, color: colors.text, marginTop: 26, marginBottom: 12 },
  burn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
});
