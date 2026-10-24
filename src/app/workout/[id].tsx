import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenTop } from '../../components/vendors/kit';
import { GuideCard } from '../../components/Guide';
import { Celebrate } from '../../components/Icon';
import { MusicPanel } from '../../components/Music';
import { GradientButton, PressableScale, Ring } from '../../components/ui';
import { researchExercises } from '../../data/research';
import { select, success } from '../../lib/haptics';
import { useStore } from '../../lib/store';
import type { Exercise } from '../../models/exercise';
import { doseLabel, exerciseKcal, prescriptionFor, SECTION_LABEL, shortExerciseName } from '../../services/fitness';
import { clock, planMinutes, workoutPhases } from '../../services/workoutPlan';
import { colors, radius, type } from '../../theme';

/**
 * Guided workout (22 Oct 2026): one researched move, set by set. Timed sets
 * and rests count down on their own; rep sets wait for "Done set". The
 * research's step-by-step cues sit under the timer. At the end the real time
 * spent can be logged, so the calories burnt reach Today.
 */
export default function WorkoutScreen() {
  const { id, minutes } = useLocalSearchParams<{ id: string; minutes?: string }>();
  const e = researchExercises.find((x) => x.id === id);
  if (!e) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title="Workout" fallback="/move" />
        <View style={{ padding: 30, alignItems: 'center' }}>
          <Text style={[type.h2, { color: colors.text }]}>Not found</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>It may have been renamed in an update. Find it again in the Move tab.</Text>
        </View>
      </SafeAreaView>
    );
  }
  return <Player e={e} target={Number(minutes) || null} />;
}

function Player({ e, target }: { e: Exercise; target: number | null }) {
  const { bodyWeightKg, logWorkout } = useStore();
  const phases = useMemo(() => workoutPhases(e, target), [e, target]);
  const [at, setAt] = useState(-1); // -1 = before starting
  const [left, setLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cue, setCue] = useState(0);
  const [done, setDone] = useState(false);
  const [logged, setLogged] = useState(false);
  const phase = at >= 0 ? phases[at] : null;
  const name = shortExerciseName(e.name);
  const workSets = phases.filter((p) => p.kind === 'work').length;

  const leftRef = useRef(0);
  const go = useCallback(
    (i: number) => {
      if (i >= phases.length) {
        success();
        setDone(true);
        return;
      }
      setAt(i);
      leftRef.current = phases[i].seconds ?? 0;
      setLeft(leftRef.current);
    },
    [phases],
  );

  // One clock for the whole session; timed phases count down with it and move on at zero.
  useEffect(() => {
    if (at < 0 || done || paused) return;
    const timed = !!phases[at].seconds;
    const t = setInterval(() => {
      setElapsed((s) => s + 1);
      if (!timed) return;
      leftRef.current = Math.max(0, leftRef.current - 1);
      setLeft(leftRef.current);
      if (leftRef.current === 0) {
        success();
        go(at + 1);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [at, done, paused, phases, go]);

  const mins = Math.max(1, Math.round(elapsed / 60));
  const kcal = e.met != null ? exerciseKcal(e.met, done ? mins : planMinutes(phases), bodyWeightKg) : null;
  const steps = e.steps;
  // A cardio block stretched to the balance target replaces the research's usual length, so its dose line would contradict it.
  const stretched = !!target && phases.length === 1 && phases[0].seconds === target * 60;
  const dose = stretched ? null : doseLabel(prescriptionFor(e));
  const step = steps[Math.min(cue, steps.length - 1)];

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTop title={name} subtitle="Done" fallback="/move" />
        <ScrollView contentContainerStyle={{ padding: 22, alignItems: 'center', paddingBottom: 60 }}>
          <Celebrate />
          <Text style={[type.h1, { color: colors.text, marginTop: 8 }]}>Workout done</Text>
          <View style={styles.stats}>
            <Stat value={clock(elapsed)} label="time" />
            <Stat value={`${workSets}`} label={workSets === 1 ? 'set' : 'sets'} />
            <Stat value={kcal != null ? `≈ ${kcal}` : '–'} label="kcal (est.)" />
          </View>
          {e.met != null ? (
            <GradientButton
              title={logged ? 'Logged to Today' : `Log ${mins} min of ${name}`}
              variant="warm"
              disabled={logged}
              style={{ alignSelf: 'stretch', marginTop: 22 }}
              onPress={() => {
                logWorkout({ id: e.id, name: e.name, met: e.met! }, mins);
                setLogged(true);
                success();
              }}
            />
          ) : null}
          <View style={styles.links}>
            <LinkPill icon="home" label="Today" onPress={() => router.replace('/(tabs)')} />
            <LinkPill icon="barbell" label="More workouts" onPress={() => router.replace('/move')} />
            <LinkPill icon="restaurant" label="Cook something" onPress={() => router.replace('/cook')} />
          </View>
          <Text style={styles.note}>Calories are estimates from the research&apos;s Compendium MET and your weight. Stop if anything hurts.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={name} subtitle={e.section ? SECTION_LABEL[e.section] : null} fallback="/move" />
      <View style={styles.segments}>
        {phases.map((p, i) =>
          p.kind === 'work' ? <View key={i} style={[styles.segment, { backgroundColor: i < at ? colors.accent : i === at ? colors.accent2 : 'rgba(255,255,255,0.10)' }]} /> : null,
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {!phase ? (
          <Animated.View entering={RFadeIn.duration(250)}>
            <View style={styles.hero}>
              <Text style={styles.heroBig}>≈ {planMinutes(phases)} min</Text>
              <Text style={styles.heroSub}>
                {workSets} {workSets === 1 ? 'set' : 'sets'}
                {dose ? ` · ${dose}` : ''}
                {kcal != null ? ` · ≈ ${kcal} kcal` : ''}
              </Text>
              {target ? <Text style={styles.heroNote}>Aiming for about {target} min to balance your meal.</Text> : null}
            </View>
            <MusicPanel kind="workout" />
            {e.setupSteps.length ? (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Get set up</Text>
                {e.setupSteps.slice(0, 4).map((s, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.n}>{i + 1}</Text>
                    <Text style={[styles.body, { flex: 1 }]}>{s}</Text>
                  </View>
                ))}
                <Text style={styles.more} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })}>
                  Full guide, mistakes and safety
                </Text>
              </View>
            ) : null}
            <Text style={styles.note}>Check with a doctor before starting new exercise, especially with a health condition, pregnancy or an injury.</Text>
          </Animated.View>
        ) : (
          <Animated.View key={at} entering={RFadeIn.duration(250)} style={{ alignItems: 'center' }}>
            <Text style={styles.phaseLabel}>{phase.kind === 'rest' ? 'Rest' : `Set ${phase.set} of ${phase.sets}`}</Text>
            <Ring
              size={220}
              stroke={16}
              progress={phase.seconds ? 1 - left / phase.seconds : phase.kind === 'work' ? (phase.set - 1) / phase.sets : 0}
              colorsFrom={phase.kind === 'rest' ? '#9BE7FF' : '#B4F461'}
              colorsTo={phase.kind === 'rest' ? colors.blue : '#16A34A'}
            >
              {phase.seconds ? (
                <Text style={styles.clock}>{clock(left)}</Text>
              ) : (
                <>
                  <Text style={styles.reps} numberOfLines={2} adjustsFontSizeToFit>
                    {phase.kind === 'work' ? (phase.reps ?? 'Go') : ''}
                  </Text>
                  <Text style={styles.repsLabel}>reps</Text>
                </>
              )}
            </Ring>
            {phase.kind === 'work' && phase.seconds && phase.reps ? <Text style={styles.hint}>{phase.reps}</Text> : null}
            {phase.kind === 'rest' ? <Text style={styles.hint}>Breathe. Next up: set {phase.nextSet}.</Text> : null}
            {paused ? <Text style={[styles.hint, { color: colors.warn }]}>Paused</Text> : null}

            {phase.kind === 'work' && step ? (
              <View style={[styles.card, { alignSelf: 'stretch' }]}>
                <View style={styles.cueHead}>
                  <Text style={styles.cardLabel}>
                    How to do it · {Math.min(cue, steps.length - 1) + 1} of {steps.length}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <PressableScale onPress={() => setCue((c) => Math.max(0, c - 1))} style={styles.cueBtn} accessibilityLabel="Previous cue">
                      <Ionicons name="chevron-back" size={18} color={colors.text} />
                    </PressableScale>
                    <PressableScale onPress={() => setCue((c) => Math.min(steps.length - 1, c + 1))} style={styles.cueBtn} accessibilityLabel="Next cue">
                      <Ionicons name="chevron-forward" size={18} color={colors.text} />
                    </PressableScale>
                  </View>
                </View>
                {step.part ? <Text style={styles.part}>{step.part}</Text> : null}
                <Text style={styles.cueTitle}>{step.title}</Text>
                {step.action ? <Text style={styles.body}>{step.action.charAt(0).toUpperCase() + step.action.slice(1)}</Text> : null}
                {step.breathing ? <Text style={styles.muted}>Breathe: {step.breathing}</Text> : null}
              </View>
            ) : null}
            {phase.kind === 'work' && step?.feel ? <View style={{ alignSelf: 'stretch' }}><GuideCard icon="body-outline" tone={colors.accent} label="You should feel" body={step.feel.charAt(0).toUpperCase() + step.feel.slice(1)} /></View> : null}
            {phase.kind === 'work' && step?.visualCheck ? <View style={{ alignSelf: 'stretch' }}><GuideCard icon="eye-outline" tone={colors.blue} label="Your form should look like" body={step.visualCheck.charAt(0).toUpperCase() + step.visualCheck.slice(1)} /></View> : null}
            {phase.kind === 'work' && e.commonMistakes.length ? (
              <View style={{ alignSelf: 'stretch' }}>
                <GuideCard icon="warning-outline" tone={colors.warn} label="Watch out for" body={e.commonMistakes[Math.min(cue, e.commonMistakes.length - 1)].text} />
              </View>
            ) : null}
            <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
              <MusicPanel kind="workout" />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!phase ? (
          <>
            <GradientButton title="▶  Start workout" onPress={() => go(0)} />
            {e.met != null ? (
              <PressableScale onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise', exercise: e.id, ...(target ? { minutes: String(target) } : {}) } })} style={styles.plain}>
                <Text style={styles.plainText}>Already did it? Log it instead</Text>
              </PressableScale>
            ) : null}
          </>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PressableScale
              onPress={() => {
                select();
                setPaused((v) => !v);
              }}
              style={styles.round}
              accessibilityLabel={paused ? 'Resume' : 'Pause'}
            >
              <Ionicons name={paused ? 'play' : 'pause'} size={22} color={colors.text} />
            </PressableScale>
            <GradientButton
              style={{ flex: 1 }}
              variant={phase.kind === 'rest' ? 'glass' : 'primary'}
              title={phase.kind === 'rest' ? 'Skip rest' : phase.seconds ? (at === phases.length - 1 ? 'Finish' : 'Skip to next') : at === phases.length - 1 ? 'Done. Finish' : 'Done set'}
              onPress={() => {
                success();
                setPaused(false);
                go(at + 1);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function LinkPill({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.linkPill} scaleTo={0.95} accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.linkText}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: 4, paddingHorizontal: 18 },
  segment: { flex: 1, height: 5, borderRadius: 3 },
  hero: { alignItems: 'center', paddingVertical: 22 },
  heroBig: { color: colors.text, fontSize: 44, fontWeight: '900', letterSpacing: -1.5 },
  heroSub: { color: colors.muted, fontSize: 14, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  heroNote: { color: colors.accent2, fontSize: 13, fontWeight: '700', marginTop: 8 },
  card: { marginTop: 18, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  cardLabel: { ...type.label, color: colors.muted, flexShrink: 1 },
  row: { flexDirection: 'row', gap: 10, paddingVertical: 5 },
  n: { color: colors.accent, fontWeight: '900', width: 16 },
  body: { color: colors.text, fontSize: 14.5, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 3 },
  more: { color: colors.accent, fontWeight: '800', marginTop: 8 },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 16, textAlign: 'center' },
  phaseLabel: { ...type.label, color: colors.muted, marginTop: 14, marginBottom: 14 },
  clock: { color: colors.text, fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  reps: { color: colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1, textAlign: 'center', maxWidth: 160 },
  repsLabel: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 13.5, marginTop: 14, textAlign: 'center' },
  cueHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  cueBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  part: { color: colors.accent2, fontWeight: '800', fontSize: 12.5, marginBottom: 2 },
  cueTitle: { color: colors.text, fontWeight: '900', fontSize: 16, marginBottom: 4 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24, backgroundColor: colors.bgElevated, borderTopWidth: 1, borderColor: colors.border },
  round: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  plain: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  plainText: { color: colors.muted, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  stat: { flex: 1, alignItems: 'center', padding: 12, borderRadius: radius.md, backgroundColor: colors.card },
  statVal: { color: colors.text, fontSize: 20, fontWeight: '900' },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  linkPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  linkText: { color: colors.text, fontWeight: '700', fontSize: 13 },
});
