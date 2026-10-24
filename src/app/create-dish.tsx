import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { alpha, IconBadge } from '../components/Icon';
import { Chip, GradientButton, PressableScale, TopGlow } from '../components/ui';
import { Notice, ScreenTop } from '../components/vendors/kit';
import { useStore } from '../lib/store';
import { AiRequestError, createDishWithAi, PHASES, type AiPhase } from '../services/ai/client';
import { colors, radius, type } from '../theme';

const EXAMPLES = [
  { name: 'Paneer lababdar', description: 'Rich tomato and cashew gravy with soft paneer, like at a dhaba' },
  { name: 'Jain pav bhaji', description: 'Pav bhaji without onion, garlic or potato' },
  { name: 'High-protein oats upma', description: 'Savoury oats with vegetables and sprouts for breakfast' },
];

const TIPS = [
  'Checking which of our researched dishes this can be built from first.',
  'Reading several recipes and keeping what most of them agree on.',
  'Every quantity is for one serving, like the rest of FitPlate.',
  'Calories are checked against the protein, carbs and fat.',
  'Allergens are worked out from the ingredients, not guessed.',
];

/** "Create your own dish with AI": describe a dish, FitPlate researches and writes it, then it works like any other dish (cook only, no ordering). */
export default function CreateDish() {
  const params = useLocalSearchParams<{ name?: string; description?: string; returnTo?: string }>();
  const { profile } = useStore();
  const [name, setName] = useState(params.name ?? '');
  const [description, setDescription] = useState(params.description ?? '');
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<AiPhase>('matching');
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const start = async () => {
    setError(null);
    setRunning(true);
    setPhase('matching');
    abort.current = new AbortController();
    try {
      const r = await createDishWithAi({ name, description, diet: profile.diet }, { onPhase: setPhase, signal: abort.current.signal });
      router.replace({ pathname: '/recipe/[id]', params: { id: r.dish.id } });
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      setError(e instanceof AiRequestError ? e.message : 'Something went wrong while creating the dish. Try again.');
      setRunning(false);
    }
  };

  const cancel = () => {
    abort.current?.abort();
    setRunning(false);
  };

  if (running) return <Researching phase={phase} name={name || 'your dish'} onCancel={cancel} />;

  const ready = name.trim().length >= 2 || description.trim().length >= 6;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopGlow color={colors.violet} />
      <ScreenTop title="Create your own dish" subtitle="AI built on FitPlate's research" fallback="/(tabs)/cook" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(350)}>
            <View style={styles.card}>
              <Text style={styles.label}>Dish name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="For example, Paneer lababdar" placeholderTextColor={colors.faint} style={styles.input} maxLength={80} accessibilityLabel="Dish name" />
              <Text style={[styles.label, { marginTop: 16 }]}>Describe it</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Taste, region, main ingredients, what to change in a dish you know…"
                placeholderTextColor={colors.faint}
                style={[styles.input, { minHeight: 96, textAlignVertical: 'top' }]}
                multiline
                maxLength={500}
                accessibilityLabel="Describe the dish"
              />
              <Text style={styles.count}>{description.length}/500</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(350)} style={{ marginTop: 14 }}>
            <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]}>Try one</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
              {EXAMPLES.map((e) => (
                <Chip
                  key={e.name}
                  label={e.name}
                  icon="sparkles-outline"
                  onPress={() => {
                    setName(e.name);
                    setDescription(e.description);
                  }}
                />
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(350)} style={{ marginTop: 18, gap: 12 }}>
            <How icon="library-outline" title="Starts from our research" body="First it checks every dish we have researched and modifies the closest one if it can." />
            <How icon="globe-outline" title="Then goes online" body="It reads recipes and nutrition sources to check the changes, or builds the dish from scratch the way our daily research does." />
            <How icon="restaurant-outline" title="Cook only" body="You get ingredients, shopping, step-by-step cooking and the full nutrition. There is no ordering for these dishes." />
          </Animated.View>

          {error ? (
            <View style={{ marginTop: 16 }}>
              <Notice tone="warn">{error}</Notice>
            </View>
          ) : null}
          <GradientButton title={error ? 'Try again' : 'Create dish'} onPress={start} disabled={!ready} style={{ marginTop: 18 }} />
          <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 12 }]}>
            AI dishes are a first draft. FitPlate&apos;s daily research checks every dish created here. It usually takes under a minute.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function How({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <IconBadge name={icon} color={colors.accent} size={38} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '800' }}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2 }}>{body}</Text>
      </View>
    </View>
  );
}

/** The wait screen: a slowly turning ring around a spark, the four steps ticking off, a timer and a rotating note. */
function Researching({ phase, name, onCancel }: { phase: AiPhase; name: string; onCancel: () => void }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [spin, pulse]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const core = useAnimatedStyle(() => ({ transform: [{ scale: 0.94 + pulse.value * 0.1 }] }));
  const at = PHASES.findIndex((p) => p.id === phase);
  const progress = Math.min(0.95, (at + 1 - Math.exp(-secs / 14)) / PHASES.length);
  const mm = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const SIZE = 150;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopGlow color={colors.violet} />
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
          <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[{ position: 'absolute' }, ring]}>
              <Svg width={SIZE} height={SIZE}>
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 4} stroke={colors.violet} strokeWidth={3} strokeLinecap="round" strokeDasharray="60 40" fill="none" opacity={0.9} />
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 14} stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeDasharray="14 30" fill="none" opacity={0.6} />
              </Svg>
            </Animated.View>
            <Animated.View style={[{ width: 84, height: 84, borderRadius: 42, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, core]}>
              <LinearGradient colors={[alpha(colors.violet, 0.55), alpha(colors.accent, 0.35)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Ionicons name="sparkles" size={36} color="#fff" />
            </Animated.View>
          </View>
          <Text style={[type.h1, { color: colors.text, textAlign: 'center', marginTop: 22 }]} numberOfLines={2}>
            Researching {name}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4, fontVariant: ['tabular-nums'] }}>{mm}</Text>
        </Animated.View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]}>
            <LinearGradient colors={[colors.violet, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </View>
        </View>

        <View style={{ gap: 14, marginTop: 24 }}>
          {PHASES.map((p, n) => {
            const done = n < at;
            const active = n === at;
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: done || active ? 1 : 0.4 }}>
                <IconBadge name={done ? 'checkmark' : active ? 'ellipsis-horizontal' : 'ellipse-outline'} color={done ? colors.accent : active ? colors.violet : colors.faint} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>{p.label}</Text>
                  {active ? <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 1 }}>{p.detail}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 26, minHeight: 36 }]}>{TIPS[Math.floor(secs / 5) % TIPS.length]}</Text>
        <PressableScale onPress={onCancel} style={{ alignSelf: 'center', marginTop: 8, padding: 12 }} accessibilityLabel="Cancel">
          <Text style={{ color: colors.muted, fontWeight: '700' }}>Cancel</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  input: { color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, backgroundColor: 'rgba(255,255,255,0.03)' },
  count: { color: colors.faint, fontSize: 11, textAlign: 'right', marginTop: 6 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 28, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
});
