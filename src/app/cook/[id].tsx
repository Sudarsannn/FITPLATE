import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishArt, Glass, GradientButton, PressableScale, Ring, VideoBackground } from '../../components/ui';
import { getDish, scaleQty } from '../../data/dishes';
import { success, tap } from '../../lib/haptics';
import { useStore } from '../../lib/store';
import { colors, radius, type } from '../../theme';

function Timer({ minutes }: { minutes: number }) {
  const total = minutes * 60;
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => {
      if (left === 1) success();
      setLeft(left - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (left === null)
    return (
      <PressableScale onPress={() => setLeft(total)} style={styles.timerBtn}>
        <Ionicons name="timer-outline" size={20} color={colors.warn} />
        <Text style={{ color: colors.warn, fontWeight: '800' }}>Start {minutes}-min timer</Text>
      </PressableScale>
    );
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
      <Ring size={130} stroke={10} progress={1 - left / total} colorsFrom="#FFD27A" colorsTo="#FF7A1A">
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>{left > 0 ? `${mm}:${ss}` : '⏰'}</Text>
        <Text style={{ color: colors.muted, fontSize: 11 }}>{left > 0 ? 'remaining' : "time's up"}</Text>
      </Ring>
    </Animated.View>
  );
}

export default function CookScreen() {
  useKeepAwake();
  const { id, servings: s } = useLocalSearchParams<{ id: string; servings?: string }>();
  const dish = getDish(id);
  const servings = Number(s) || dish?.baseServings || 2;
  const { profile } = useStore();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  if (!dish) return null;

  const step = dish.steps[i];
  const last = i === dish.steps.length - 1;
  const beginner = profile.level === 'beginner';

  const go = (n: number) => {
    if (n < 0) return;
    if (n >= dish.steps.length) {
      success();
      router.replace({ pathname: '/done/[id]', params: { id: dish.id, servings: String(servings) } });
      return;
    }
    tap();
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <VideoBackground source={require('../../../assets/videos/ambient.mp4')} dim={0.45} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Story-style progress segments */}
        <View style={styles.segments}>
          {dish.steps.map((_, k) => (
            <View key={k} style={[styles.seg, { backgroundColor: k <= i ? colors.accent : 'rgba(255,255,255,0.18)' }]} />
          ))}
        </View>
        <View style={styles.head}>
          <DishArt emoji={dish.emoji} palette={dish.palette} size={36} rounded={10} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{dish.name}</Text>
            <Text style={[type.small, { color: colors.muted }]}>
              Step {i + 1} of {dish.steps.length} · for {servings}
            </Text>
          </View>
          <PressableScale onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={22} color={colors.text} />
          </PressableScale>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          {/* Tap left/right halves to move between steps, like stories. */}
          <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
            <Pressable style={{ flex: 1 }} onPress={() => go(i - 1)} />
            <Pressable style={{ flex: 2 }} onPress={() => go(i + 1)} />
          </View>
          <Animated.View
            key={i}
            entering={(dir === 1 ? SlideInRight : SlideInLeft).springify().damping(20)}
            exiting={(dir === 1 ? SlideOutLeft : SlideOutRight).duration(200)}
            pointerEvents="box-none"
          >
            <Text style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
            {step.amount ? (
              <View style={styles.amount}>
                <Ionicons name="scale-outline" size={18} color="#06210F" />
                <Text style={styles.amountText}>
                  {scaleQty(step.amount.qty, dish, servings)} {step.amount.unit} {step.amount.item}
                </Text>
              </View>
            ) : null}
            {step.equipment ? (
              <Text style={{ color: colors.muted, marginTop: 14, fontSize: 15 }}>🍳 Use the {step.equipment.toLowerCase()}</Text>
            ) : null}
            {beginner && step.tip ? (
              <Animated.View entering={RFadeIn.delay(250)}>
                <Glass style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
                  <Text style={{ fontSize: 20 }}>💡</Text>
                  <Text style={{ color: colors.text, flex: 1, lineHeight: 21 }}>{step.tip}</Text>
                </Glass>
              </Animated.View>
            ) : null}
            {step.minutes ? (
              <View style={{ marginTop: 22, alignItems: 'flex-start' }} pointerEvents="box-none">
                <Timer key={i} minutes={step.minutes} />
              </View>
            ) : null}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <PressableScale onPress={() => go(i - 1)} disabled={i === 0} style={styles.prev}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </PressableScale>
          <GradientButton title={last ? 'Finish 🎉' : 'Next step'} onPress={() => go(i + 1)} style={{ flex: 1 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: 4, paddingHorizontal: 14, paddingTop: 8 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 14 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: colors.accent, fontSize: 64, fontWeight: '900', letterSpacing: -3, opacity: 0.9 },
  stepText: { color: colors.text, fontSize: 30, fontWeight: '800', lineHeight: 38, letterSpacing: -0.5 },
  amount: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 18, backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill },
  amountText: { color: '#06210F', fontWeight: '900', fontSize: 17 },
  timerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, backgroundColor: 'rgba(255,181,71,0.15)', borderWidth: 1, borderColor: 'rgba(255,181,71,0.4)' },
  footer: { flexDirection: 'row', gap: 12, padding: 18 },
  prev: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
});
