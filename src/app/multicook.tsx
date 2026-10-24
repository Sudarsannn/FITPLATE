import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Celebrate } from '../components/Icon';
import { Bar, Chip, GradientButton, PressableScale } from '../components/ui';
import { k, Notice, ScreenTop, Section } from '../components/vendors/kit';
import { getDish } from '../data/research';
import { success } from '../lib/haptics';
import { useStore } from '../lib/store';
import type { CookCompletion } from '../models/prefs';
import type { Dish } from '../models/research';
import { headlineOrderPrice } from '../services/dishLibrary';
import { alongside, schedule, span, type Plan } from '../services/multicook';
import { showBeginnerTips } from '../services/kitchen';
import { dishCost } from '../services/vendors';
import { openExternal } from '../services/vendors/openApp';
import { colors, radius, type } from '../theme';
import { StepTimer } from './steps/[id]';

const PALETTE = [colors.accent, colors.warm, colors.blue, colors.violet, colors.warn, '#F472B6'];
const KIND_LABEL: Record<Plan['kind'], string> = { hands: 'Your hands', 'burner-hands': 'Burner + you', 'burner-passive': 'Burner, then free', wait: 'Just wait' };
const PLAYLISTS = [
  { label: 'Spotify cooking playlists', url: 'https://open.spotify.com/search/cooking%20playlist' },
  { label: 'YouTube Music', url: 'https://music.youtube.com/search?q=cooking%20playlist' },
];

/**
 * Several dishes at once. Asks how many burners you have, lays all the dishes'
 * researched steps on one timeline (services/multicook.ts), then walks you
 * through it one step at a time, with what else is on the stove, a ready-by
 * time, a shared ingredient checklist and music links. Finishing logs every dish.
 */
export default function MultiCook() {
  const { dishes: d, servings: sv, via } = useLocalSearchParams<{ dishes?: string; servings?: string; via?: string }>();
  const dishes = useMemo(() => (d ?? '').split(',').map((id) => getDish(id)).filter((x): x is Dish => !!x), [d]);
  const servings = (sv ?? '').split(',').map((n) => Math.min(8, Math.max(1, Number(n) || 2)));
  const { settings, updateSettings, profile, logResearchCook } = useStore();
  const [stage, setStage] = useState<'burners' | 'overview' | 'cook' | 'done'>('burners');
  const [burners, setBurners] = useState(settings.burners ?? 2);
  const [i, setI] = useState(0);
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [readAloud, setReadAloud] = useState(false);
  const tips = showBeginnerTips(profile.level, settings.featureToggles);
  const colorOf = (id: string) => PALETTE[Math.max(0, dishes.findIndex((x) => x.id === id)) % PALETTE.length];
  const { plan, totalSec, oneByOneSec } = useMemo(() => schedule(dishes, burners), [dishes, burners]);
  const [openedAt, setOpenedAt] = useState(0);
  const readyAt = new Date(openedAt + totalSec * 1000).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const step = plan[i];

  useEffect(() => {
    if (!readAloud || stage !== 'cook' || !step || Platform.OS !== 'web' || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${step.dishName}. ${step.text}`));
    return () => window.speechSynthesis.cancel();
  }, [readAloud, stage, step]);

  if (dishes.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Cook together" fallback="/cook" />
        <View style={{ padding: 20 }}>
          <Notice tone="warn">No dishes were chosen. Pick them again from the Cook tab.</Notice>
        </View>
      </SafeAreaView>
    );
  }

  const finish = () => {
    success();
    dishes.forEach((dish, n) => {
      const sv2 = servings[n] ?? 2;
      const cost = dishCost(dish, sv2);
      const order = headlineOrderPrice(dish);
      const nu = dish.nutritionPerServing;
      const boughtVia = (['instamart', 'zepto', 'blinkit', 'self'].includes(via ?? '') ? via : 'self') as CookCompletion['boughtVia'];
      logResearchCook({ id: dish.id, name: dish.name, kcal: nu.kcal, proteinG: nu.proteinG, fibreG: nu.fibreG }, sv2, cost?.inr ?? null, order ? order.avg * sv2 : null, boughtVia);
    });
    setStage('done');
  };

  if (stage === 'done') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 60 }}>
          <View style={{ marginTop: 10 }}>
            <Celebrate />
          </View>
          <Text style={[type.h1, { color: colors.text, textAlign: 'center', marginTop: 8 }]}>{dishes.length} dishes, one go!</Text>
          <Text style={[k.muted, { textAlign: 'center', marginTop: 6 }]}>{dishes.map((x) => x.name).join(' · ')} are in My Meals now.</Text>
          <GradientButton title="Back to Today" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 22 }} />
          <GradientButton title="See My Meals" variant="glass" onPress={() => router.replace({ pathname: '/track', params: { view: 'meals' } })} style={{ marginTop: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stage === 'burners') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Cook together" subtitle={dishes.map((x) => x.name).join(' · ')} fallback="/cook" />
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={[type.h1, { color: colors.text }]}>How many burners can you use?</Text>
          <Text style={[k.muted, { marginTop: 6 }]}>Gas burners or induction plates, counting the one a pressure cooker sits on. More burners means more things at once.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {[1, 2, 3, 4].map((n) => (
              <Chip key={n} label={`${n}`} active={burners === n} onPress={() => setBurners(n)} />
            ))}
          </View>
          <GradientButton
            title="Plan it"
            style={{ marginTop: 24 }}
            onPress={() => {
              updateSettings({ burners });
              setOpenedAt(Date.now());
              setStage('overview');
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stage === 'overview') {
    const ingredients = dishes.flatMap((dish, n) => dish.ingredients.map((g) => ({ key: `${dish.id}-${g.name}`, text: `${g.name}${g.quantity != null ? `  ${Math.round(g.quantity * (servings[n] ?? 2) * 10) / 10}${g.unit ? ` ${g.unit}` : ''}` : g.householdMeasure ? `  ${g.householdMeasure}` : ''}`, dish: dish.name })));
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Your cooking plan" subtitle={`${dishes.length} dishes · ${burners} ${burners === 1 ? 'burner' : 'burners'}`} fallback="/cook" />
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
          <View style={s.hero}>
            <Text style={s.big}>{span(totalSec)}</Text>
            <Text style={k.muted}>
              all together, against {span(oneByOneSec)} one after the other. Start now and it&apos;s ready around {readyAt}.
            </Text>
          </View>
          <Text style={[k.muted, { marginTop: 8, fontSize: 12 }]}>The plan reads each researched step&apos;s words to guess whether it needs you or a burner, so treat the timings as a guide.</Text>

          <Section title="Ingredients out first">
            <Text style={k.muted}>Tick off as you set each one on the counter.</Text>
            {ingredients.map((g) => (
              <Pressable key={g.key} onPress={() => setTicked((t) => ({ ...t, [g.key]: !t[g.key] }))} style={s.tick} accessibilityRole="checkbox" accessibilityState={{ checked: !!ticked[g.key] }}>
                <Ionicons name={ticked[g.key] ? 'checkbox' : 'square-outline'} size={22} color={ticked[g.key] ? colors.accent : colors.faint} />
                <Text style={[k.body, { flex: 1, textDecorationLine: ticked[g.key] ? 'line-through' : 'none' }]}>
                  {g.text} {dishes.length > 1 ? <Text style={k.muted}>· {g.dish}</Text> : null}
                </Text>
              </Pressable>
            ))}
          </Section>

          <Section title="The timeline">
            {plan.map((p, n) => (
              <View key={n} style={s.row}>
                <Text style={s.at}>{clock(p.startSec)}</Text>
                <View style={[s.dot, { backgroundColor: colorOf(p.dishId) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={k.strong} numberOfLines={2}>
                    {p.title || p.text}
                  </Text>
                  <Text style={k.muted}>
                    {p.dishName} · {KIND_LABEL[p.kind]}
                    {p.burner ? ` · burner ${p.burner}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </Section>

          <Section title="Something to listen to">
            {PLAYLISTS.map((pl) => (
              <GradientButton key={pl.url} title={pl.label} variant="glass" style={{ marginTop: 8 }} onPress={() => openExternal(pl.url)} />
            ))}
            <Text style={[k.muted, { marginTop: 8, fontSize: 12 }]}>Opens your music app. FitPlate plays no music itself.</Text>
          </Section>
        </ScrollView>
        <View style={s.footer}>
          <GradientButton
            style={{ flex: 1 }}
            title="Start cooking together"
            onPress={() => {
              setI(0);
              setStage('cook');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return <CookStage plan={plan} i={i} setI={setI} colorOf={colorOf} tips={tips} dishes={dishes} finish={finish} readAloud={readAloud} setReadAloud={setReadAloud} />;
}

const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;

function CookStage({ plan, i, setI, colorOf, tips, dishes, finish, readAloud, setReadAloud }: { plan: Plan[]; i: number; setI: (n: number) => void; colorOf: (id: string) => string; tips: boolean; dishes: Dish[]; finish: () => void; readAloud: boolean; setReadAloud: (v: boolean) => void }) {
  useKeepAwake();
  const p = plan[i];
  const full = dishes.find((x) => x.id === p.dishId)?.steps[p.stepIndex];
  const others = alongside(plan, p);
  const next = plan[i + 1];
  const canSpeak = Platform.OS === 'web';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Cook together" subtitle={`Step ${i + 1} of ${plan.length}`} fallback="/cook" />
      <View style={{ paddingHorizontal: 18 }}>
        <Bar progress={(i + 1) / plan.length} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }}>
        <View style={[s.chip, { borderColor: colorOf(p.dishId) }]}>
          <View style={[s.dot, { backgroundColor: colorOf(p.dishId) }]} />
          <Text style={{ color: colors.text, fontWeight: '900' }}>{p.dishName}</Text>
          <Text style={k.muted}>
            · {KIND_LABEL[p.kind]}
            {p.burner ? ` · burner ${p.burner}` : ''}
          </Text>
        </View>
        {p.title ? <Text style={[type.h1, { color: colors.text, marginTop: 12 }]}>{p.title}</Text> : null}
        <Text style={[k.body, { fontSize: 18, lineHeight: 27, marginTop: 10 }]}>{p.text}</Text>
        {p.timerSec ? <StepTimer key={`${p.dishId}-${p.stepIndex}`} seconds={p.timerSec} /> : null}
        {full?.visualCue ? <Notice tone="ok">Looks right when: {full.visualCue}</Notice> : null}
        {full?.tip && tips ? <Notice>Tip: {full.tip}</Notice> : null}

        {others.length ? (
          <Section title="On the stove meanwhile">
            {others.map((o, n) => (
              <View key={n} style={s.row}>
                <View style={[s.dot, { backgroundColor: colorOf(o.dishId) }]} />
                <Text style={[k.body, { flex: 1 }]}>
                  {o.dishName}: {o.title || o.text} <Text style={k.muted}>(burner {o.burner})</Text>
                </Text>
              </View>
            ))}
          </Section>
        ) : null}
        {next ? (
          <Text style={[k.muted, { marginTop: 14 }]}>
            Next up: {next.dishName}, {next.title || next.text}
          </Text>
        ) : null}
        {canSpeak ? (
          <Pressable onPress={() => setReadAloud(!readAloud)} style={{ marginTop: 14, minHeight: 44, justifyContent: 'center' }} accessibilityRole="switch" accessibilityState={{ checked: readAloud }}>
            <Text style={{ color: readAloud ? colors.accent : colors.muted, fontWeight: '800' }}>{readAloud ? 'Reading each step aloud' : 'Read steps aloud'}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <View style={s.footer}>
        {i > 0 ? (
          <PressableScale onPress={() => setI(i - 1)} style={s.back} accessibilityLabel="Previous step">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </PressableScale>
        ) : null}
        <GradientButton style={{ flex: 1 }} title={i < plan.length - 1 ? 'Next step' : 'Done'} onPress={() => (i < plan.length - 1 ? setI(i + 1) : finish())} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  big: { color: colors.text, fontWeight: '900', fontSize: 30 },
  tick: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  at: { color: colors.faint, fontWeight: '800', fontSize: 12.5, width: 38 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, minHeight: 36, borderRadius: radius.pill, borderWidth: 1.5, backgroundColor: colors.card },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
  back: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
});
