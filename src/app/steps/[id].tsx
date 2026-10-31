import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { k, Notice, ScreenTop, Section } from '../../components/vendors/kit';
import { alpha, Celebrate, IconBadge } from '../../components/Icon';
import { GuideCard } from '../../components/Guide';
import { MusicPanel } from '../../components/Music';
import { Bar, GradientButton, PressableScale, Ring } from '../../components/ui';
import { getDish } from '../../data/research';
import { featureFlags } from '../../config/featureFlags';
import { ringAlarm } from '../../lib/alarm';
import { select, success } from '../../lib/haptics';
import { speakStep, stepSpeech, stopSpeaking } from '../../lib/speak';
import { useStore } from '../../lib/store';
import { stepIcon, whyItWorks } from '../../services/cookGuide';
import { clearCookProgress, loadCookProgress, saveCookProgress, usableProgress, type CookProgress } from '../../services/cookProgress';
import { showBeginnerTips } from '../../services/kitchen';
import { addLeftover, fridgeDays } from '../../services/leftovers';
import type { CookCompletion } from '../../models/prefs';
import type { Dish } from '../../models/research';
import { BALANCE_LABEL } from '../../services/dishDetail';
import { headlineOrderPrice } from '../../services/dishLibrary';
import { dishCost } from '../../services/vendors';
import { colors, radius, type } from '../../theme';

/**
 * Guided micro-steps for a research dish, reached from "Continue" after
 * shopping (priority plan P3a/P3c). One step at a time, with its timer, tip
 * and what it should look like. Finishing logs the meal, the money saved
 * against ordering (confirmed prices only) and the cook itself.
 */
export default function StepsScreen() {
  const { id, servings: sv, via } = useLocalSearchParams<{ id: string; servings?: string; via?: string }>();
  const dish = id ? getDish(id) : undefined;
  const servings = Math.max(1, Number(sv) || 2);
  const { logResearchCook, profile, settings, updateSettings } = useStore();
  const tips = showBeginnerTips(profile.level, settings.featureToggles);
  const [i, setI] = useState(-1); // -1 = ingredients overview
  const [done, setDone] = useState(false);
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [track, setTrack] = useState<'yes' | 'unsure' | null>(null);
  const [saved, setSaved] = useState<CookProgress | null>(null);
  const dishId = dish?.id;
  const stepCount = dish?.steps.length ?? 0;

  // Keep the screen on while cooking (a phone that locks mid-sauce is the main complaint).
  useEffect(() => {
    activateKeepAwakeAsync('fitplate-cook').catch(() => {});
    return () => {
      deactivateKeepAwake('fitplate-cook').catch(() => {});
    };
  }, []);

  // Read each step aloud when the switch is on (stops when the step changes or the screen closes).
  const readAloud = featureFlags.voiceSteps && settings.featureToggles.readAloud === true;
  const spoken = i >= 0 ? dish?.steps[i] : undefined;
  useEffect(() => {
    if (readAloud && spoken && !done) speakStep(stepSpeech(spoken));
    else stopSpeaking();
    return stopSpeaking;
  }, [readAloud, spoken, done]);

  // Offer to pick up where this dish was left.
  useEffect(() => {
    if (!dishId) return;
    let live = true;
    loadCookProgress(dishId, servings).then((p) => live && setSaved(usableProgress(p, stepCount, Date.now())));
    return () => {
      live = false;
    };
  }, [dishId, servings, stepCount]);

  // Remember the step and ticks as they change (not the overview with nothing ticked).
  useEffect(() => {
    if (!dishId || done || (i < 0 && !Object.values(have).some(Boolean))) return;
    saveCookProgress(dishId, servings, { step: i, have }, Date.now());
  }, [dishId, servings, i, have, done]);

  if (!dish) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Cook" fallback="/cook" />
        <View style={{ padding: 20 }}>
          <Notice tone="warn">This dish isn’t in this version of the app. Find it again in the Cook tab.</Notice>
        </View>
      </SafeAreaView>
    );
  }
  if (done) return <Finished dish={dish} servings={servings} />;

  const steps = dish.steps;
  const step = i >= 0 ? steps[i] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={dish.name} subtitle={`for ${servings} · ${steps.length} steps`} fallback="/cook" />
      <View style={{ paddingHorizontal: 18 }}>
        {steps.length > 0 && steps.length <= 40 ? (
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {steps.map((_, n) => (
              <View key={n} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: n < i ? colors.accent : n === i ? colors.accent2 : 'rgba(255,255,255,0.10)' }} />
            ))}
          </View>
        ) : (
          <Bar progress={steps.length ? (i + 1) / steps.length : 0} />
        )}
      </View>
      {featureFlags.voiceSteps && i >= 0 ? (
        <Pressable
          onPress={() => updateSettings({ featureToggles: { ...settings.featureToggles, readAloud: !readAloud } })}
          style={s.voice}
          accessibilityRole="switch"
          accessibilityState={{ checked: readAloud }}
          accessibilityLabel="Read steps aloud"
        >
          <Ionicons name={readAloud ? 'volume-high' : 'volume-mute-outline'} size={18} color={readAloud ? colors.accent : colors.muted} />
          <Text style={{ color: readAloud ? colors.accent : colors.muted, fontWeight: '800', fontSize: 13 }}>{readAloud ? 'Reading aloud' : 'Read aloud'}</Text>
        </Pressable>
      ) : null}
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }}>
        {i === -1 ? (
          <>
            <View style={s.overview}>
              <OverviewStat icon="time-outline" value={dish.prepMin != null || dish.cookMin != null ? `${(dish.prepMin ?? 0) + (dish.cookMin ?? 0)} min` : '–'} label="total" />
              <OverviewStat icon="list-outline" value={`${steps.length}`} label="steps" />
              <OverviewStat icon="flame-outline" value={dish.nutritionPerServing.kcal != null ? `${Math.round(dish.nutritionPerServing.kcal)}` : '–'} label="kcal each" />
            </View>
            {saved ? (
              <View style={s.resume}>
                <Text style={[k.body, { fontWeight: '800' }]}>You were on step {saved.step + 1} of {steps.length}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <PressableScale
                    onPress={() => {
                      setHave(saved.have);
                      setI(saved.step);
                      setSaved(null);
                    }}
                    style={[s.timerBtn, { flex: 1 }]}
                    accessibilityLabel="Resume cooking"
                  >
                    <Text style={{ color: '#06210F', fontWeight: '900' }}>Resume</Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => {
                      clearCookProgress(dish.id, servings);
                      setSaved(null);
                    }}
                    style={[s.timerBtn, { flex: 1, backgroundColor: colors.cardAlt }]}
                    accessibilityLabel="Start over"
                  >
                    <Text style={{ color: colors.text, fontWeight: '800' }}>Start over</Text>
                  </PressableScale>
                </View>
              </View>
            ) : null}
            <View style={{ marginBottom: 14 }}>
              <MusicPanel kind="cooking" />
            </View>
            <Section title={`You need (for ${servings})`} right={<Text style={[k.muted, { fontWeight: '800' }]}>{Object.values(have).filter(Boolean).length} of {dish.ingredients.length} ready</Text>}>
              {dish.ingredients.map((g, n) => {
                const key = `${g.name}-${n}`;
                const on = !!have[key];
                return (
                  <Pressable key={key} onPress={() => setHave((h) => ({ ...h, [key]: !h[key] }))} style={s.ingRow} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                    <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={on ? colors.accent : colors.faint} />
                    <Text style={[k.body, { flex: 1 }, on && { color: colors.muted, textDecorationLine: 'line-through' }]}>{g.name}</Text>
                    <Text style={k.muted}>{g.quantity != null ? `${Math.round(g.quantity * servings * 10) / 10}${g.unit ? ` ${g.unit}` : ''}` : (g.householdMeasure ?? '')}</Text>
                  </Pressable>
                );
              })}
            </Section>
            {dish.equipment.length ? (
              <Section title="Equipment">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {dish.equipment.map((e) => (
                    <View key={e} style={s.equip}>
                      <Ionicons name="construct-outline" size={14} color={colors.muted} />
                      <Text style={s.equipText}>{e}</Text>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}
            {steps.length === 0 ? <Notice tone="warn">The steps for this dish are still being researched.</Notice> : null}
          </>
        ) : step ? (
          <Animated.View key={i} entering={FadeInRight.duration(320)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <IconBadge name={stepIcon(`${step.title ?? ''} ${step.text}`)} color={colors.accent} size={60} radius={20} />
              <View>
                <Text style={s.bigNum}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={[type.label, { color: colors.accent }]}>of {steps.length} steps</Text>
              </View>
            </View>
            {step.title ? <Text style={[type.h1, { color: colors.text, marginTop: 12 }]}>{step.title}</Text> : null}
            {step.text && step.text !== step.title ? <Text style={[k.body, { fontSize: 18, lineHeight: 27, marginTop: 8 }]}>{step.text}</Text> : null}
            {step.timerSec ? <StepTimer key={i} seconds={step.timerSec} /> : null}

            {step.visualCue ? (
              <GuideCard icon="eye-outline" tone={colors.accent} label="You should see" body={step.visualCue} />
            ) : null}
            {step.videoShot ? <GuideCard icon="videocam-outline" tone={colors.blue} label="Video for this step (coming soon)" body={`What it will show: ${step.videoShot.replace(/[.\s]+$/, '')}.`} /> : null}
            {featureFlags.cameraCheck && step.cameraCheck ? <GuideCard icon="camera-outline" tone={colors.violet} label="Camera check (coming soon)" body={step.cameraCheck} /> : null}
            {step.watchOut || (step.tip && tips) ? (
              <GuideCard icon="warning-outline" tone={colors.warn} label={step.watchOut ? 'Watch out for' : 'Tip'} body={(step.watchOut ?? step.tip)!} />
            ) : null}
            {step.watchOut && step.tip && tips ? <GuideCard icon="bulb-outline" tone={colors.blue} label="Tip" body={step.tip} /> : null}

            {step.visualCue || step.watchOut ? (
              <View style={s.trackRow}>
                <PressableScale
                  onPress={() => {
                    select();
                    setTrack('yes');
                  }}
                  style={[s.trackBtn, track === 'yes' && { backgroundColor: alpha(colors.accent, 0.2), borderColor: colors.accent }]}
                  accessibilityLabel="Mine looks like this"
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} />
                  <Text style={s.trackText}>Mine looks like this</Text>
                </PressableScale>
                <PressableScale
                  onPress={() => {
                    select();
                    setTrack('unsure');
                  }}
                  style={[s.trackBtn, track === 'unsure' && { backgroundColor: alpha(colors.warn, 0.18), borderColor: colors.warn }]}
                  accessibilityLabel="Not sure"
                >
                  <Ionicons name="help-circle-outline" size={18} color={colors.warn} />
                  <Text style={s.trackText}>Not sure</Text>
                </PressableScale>
              </View>
            ) : null}
            {track === 'yes' ? (
              <Animated.View entering={FadeInRight.duration(200)}>
                <Notice tone="ok">You are on track. Move on when you are ready.</Notice>
              </Animated.View>
            ) : null}
            {track === 'unsure' ? (
              <Animated.View entering={FadeInRight.duration(200)}>
                <Notice tone="warn">
                  {step.timerSec ? 'Give it the full time first, then compare again. ' : 'Take a moment and compare again. '}
                  {step.visualCue ? `It should look like this: ${step.visualCue.replace(/[.\s]+$/, '')}. ` : ''}
                  {step.watchOut ?? step.tip ?? 'If it looks different, pause the heat and go back one step.'}
                </Notice>
              </Animated.View>
            ) : null}

            {step.funFact ? <GuideCard icon="sparkles-outline" tone={colors.violet} label="Fun fact" body={step.funFact} /> : null}
            {!step.funFact && whyItWorks(`${step.title ?? ''} ${step.text}`) ? <GuideCard icon="flask-outline" tone={colors.violet} label="Why it works" body={whyItWorks(`${step.title ?? ''} ${step.text}`)!} /> : null}

            <View style={{ marginTop: 16 }}>
              <MusicPanel kind="cooking" />
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
      <View style={s.footer}>
        {i >= 0 ? (
          <PressableScale onPress={() => (setTrack(null), setI(i - 1))} style={s.backBtn} accessibilityLabel="Previous step">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </PressableScale>
        ) : null}
        <GradientButton
          style={{ flex: 1 }}
          title={i === -1 ? 'Start cooking' : i < steps.length - 1 ? 'Next step' : 'Done'}
          onPress={() => {
            setTrack(null);
            if (i < steps.length - 1) setI(i + 1);
            else {
              success();
              const { cost, orderTotal } = prices(dish, servings);
              const n = dish.nutritionPerServing;
              const boughtVia = (['instamart', 'zepto', 'blinkit', 'self'].includes(via ?? '') ? via : 'self') as CookCompletion['boughtVia'];
              logResearchCook({ id: dish.id, name: dish.name, kcal: n.kcal, proteinG: n.proteinG, fibreG: n.fibreG }, servings, cost?.inr ?? null, orderTotal, boughtVia);
              clearCookProgress(dish.id, servings);
              setDone(true);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

/** Cost to make and what ordering the same servings would cost (confirmed prices only). */
function prices(dish: Dish, servings: number) {
  const cost = dishCost(dish, servings);
  const order = headlineOrderPrice(dish);
  return { cost, orderTotal: order ? order.avg * servings : null };
}

function OverviewStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={s.ovStat}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={s.ovValue}>{value}</Text>
      <Text style={k.muted}>{label}</Text>
    </View>
  );
}

function Finished({ dish, servings }: { dish: Dish; servings: number }) {
  const { rateDish, ratings, settings, updateSettings } = useStore();
  const { cost, orderTotal } = prices(dish, servings);
  const saved = cost && orderTotal ? Math.max(0, Math.round(orderTotal - cost.inr)) : null;
  const n = dish.nutritionPerServing;

  const stars = ratings[dish.id] ?? 0;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 60 }}>
        <View style={{ marginTop: 10 }}>
          <Celebrate />
        </View>
        <Text style={[type.h1, { color: colors.text, textAlign: 'center', marginTop: 8 }]}>You made {dish.name}!</Text>
        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statValue}>{n.kcal != null ? Math.round(n.kcal) : '—'}</Text>
            <Text style={k.muted}>kcal a serving</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{saved != null ? `₹${saved}` : '—'}</Text>
            <Text style={k.muted}>saved vs ordering</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{n.proteinG != null ? `${n.proteinG} g` : '—'}</Text>
            <Text style={k.muted}>protein</Text>
          </View>
        </View>
        {saved == null ? <Text style={[k.muted, { textAlign: 'center' }]}>Money saved shows once both the order price and the ingredient prices are confirmed.</Text> : null}

        <View style={{ marginTop: 14, padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
          <Text style={[k.body, { flex: 1 }]}>Logged to Today{n.kcal != null ? `: ${Math.round(n.kcal)} kcal` : ''}. Ate less or more? Edit it in My Meals.</Text>
          <Pressable onPress={() => router.push('/(tabs)/track')} accessibilityRole="button" hitSlop={8}>
            <Text style={{ color: colors.accent, fontWeight: '800' }}>View</Text>
          </Pressable>
        </View>

        <Section title="How was it?">
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <Pressable key={v} onPress={() => rateDish(dish.id, v)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${v} star${v === 1 ? '' : 's'}`}>
                <Ionicons name={v <= stars ? 'star' : 'star-outline'} size={32} color={colors.warn} />
              </Pressable>
            ))}
          </View>
        </Section>
        {dish.storage ? (
          <Section title="Storing leftovers">
            <Text style={k.body}>{dish.storage}</Text>
            {featureFlags.savingsDashboard ? (
              (settings.leftovers ?? []).some((l) => l.dishId === dish.id) ? (
                <Text style={[k.muted, { marginTop: 8 }]}>Saved as leftovers. Today will remind you to use them.</Text>
              ) : (
                <GradientButton title={`Put away: use by ${fridgeDays(dish.storage)} day${fridgeDays(dish.storage) > 1 ? 's' : ''}`} variant="glass" onPress={() => updateSettings({ leftovers: addLeftover(settings.leftovers ?? [], dish) })} style={{ marginTop: 10 }} />
              )
            ) : null}
          </Section>
        ) : null}
        {dish.leftoverRemix ? (
          <Section title="Tomorrow’s remix">
            <Text style={k.body}>{dish.leftoverRemix}</Text>
          </Section>
        ) : null}
        <GradientButton title="Back to Today" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 18 }} />
        <Pressable onPress={() => router.push({ pathname: '/balance', params: { dish: dish.id } })} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 }} accessibilityRole="button">
          <Text style={{ color: colors.muted, fontWeight: '700' }}>{BALANCE_LABEL}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function StepTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  const done = left === 0;
  useEffect(() => {
    if (done && running) {
      success();
      ringAlarm();
    }
  }, [done, running]);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <View style={s.timer}>
      <Ring size={112} stroke={9} progress={seconds > 0 ? left / seconds : 0} colorsFrom={done ? colors.accent2 : colors.warn} colorsTo={done ? colors.accent : colors.warm}>
        {done ? <Ionicons name="checkmark" size={40} color={colors.accent} /> : <Text style={s.timerNum}>{`${mm}:${ss}`}</Text>}
      </Ring>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={[type.label, { color: colors.muted }]}>{done ? 'Time is up' : running ? 'Counting down' : 'Timer'}</Text>
        {!done ? (
          <PressableScale onPress={() => setRunning(!running)} style={s.timerBtn} accessibilityLabel={running ? 'Pause timer' : 'Start timer'}>
            <Ionicons name={running ? 'pause' : 'play'} size={16} color="#06210F" />
            <Text style={{ color: '#06210F', fontWeight: '900' }}>{running ? 'Pause' : 'Start timer'}</Text>
          </PressableScale>
        ) : (
          <Text style={{ color: colors.accent, fontWeight: '800' }}>Move on to the next step</Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  voice: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 18, marginTop: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  resume: { padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent, marginBottom: 14 },
  overview: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  ovStat: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  ovValue: { color: colors.text, fontSize: 18, fontWeight: '900' },
  trackRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  trackBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  trackText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
  backBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  timer: { marginTop: 18, padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 16 },
  timerNum: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  timerBtn: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  equip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  equipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  bigNum: { color: colors.accent, fontSize: 54, fontWeight: '900', letterSpacing: -2, lineHeight: 58 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: { flex: 1, padding: 12, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '900' },
});
