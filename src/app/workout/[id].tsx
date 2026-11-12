import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exerciseById, liveItems, resolveRoutine, startParams } from '../../services/routines';
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
import { clampKg, clampRpe, countCue, countdownCue, effortWords, KG_STEP, repTarget, summarise, swapOptions } from '../../services/workoutSession';
import { speakStep, stopSpeaking } from '../../lib/speak';
import type { WorkoutSet } from '../../models/logs';
import { fitNote, moveFit, userConcerns } from '../../services/moveSafety';
import { colors, radius, type } from '../../theme';

/**
 * Guided workout (22 Oct 2026): one researched move, set by set. Timed sets
 * and rests count down on their own; rep sets wait for "Done set". The
 * research's step-by-step cues sit under the timer. At the end the real time
 * spent can be logged, so the calories burnt reach Today.
 */
export default function WorkoutScreen() {
  const { id, minutes, routine, at } = useLocalSearchParams<{ id: string; minutes?: string; routine?: string; at?: string }>();
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
  return <Player e={e} target={Number(minutes) || null} routine={routine ? { id: routine, at: Number(at) || 0 } : null} />;
}

function Player({ e, target, routine }: { e: Exercise; target: number | null; routine: { id: string; at: number } | null }) {
  const { bodyWeightKg, logWorkout, routines, profile } = useStore();
  const { concerns, unresearched } = useMemo(() => userConcerns(profile.survey), [profile.survey]);
  const note = fitNote(moveFit(e, concerns));
  const [override, setOverride] = useState(false);
  const gated = note.level === 'avoid' && !override;
  const rt = routine ? resolveRoutine(routine.id, routines.map((r) => ({ id: r.id, routine: r }))) : null;
  const rItems = rt ? liveItems(rt.routine) : [];
  const nextAt = routine && routine.at + 1 < rItems.length ? routine.at + 1 : null;
  const phases = useMemo(() => workoutPhases(e, target), [e, target]);
  const [at, setAt] = useState(-1); // -1 = before starting
  const [left, setLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cue, setCue] = useState(0);
  const [done, setDone] = useState(false);
  const [logged, setLogged] = useState(false);
  const [count, setCount] = useState(0);
  const [weight, setWeight] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [results, setResults] = useState<WorkoutSet[]>([]);
  const [voice, setVoice] = useState(true);
  const [swapOpen, setSwapOpen] = useState(false);
  const phase = at >= 0 ? phases[at] : null;
  const name = shortExerciseName(e.name);
  const workSets = phases.filter((p) => p.kind === 'work').length;

  const leftRef = useRef(0);
  const voiceRef = useRef(true);
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);
  const go = useCallback(
    (i: number) => {
      stopSpeaking();
      setCount(0);
      if (i >= phases.length) {
        success();
        setDone(true);
        return;
      }
      setAt(i);
      leftRef.current = phases[i].seconds ?? 0;
      setLeft(leftRef.current);
    },
    [phases, setCount],
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
      const c = voiceRef.current ? countdownCue(leftRef.current) : null;
      if (c) speakStep(c);
      if (leftRef.current === 0) {
        success();
        go(at + 1);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [at, done, paused, phases, go]);

  const isStrength = e.type === 'strength';
  const target0 = phase && phase.kind === 'work' && !phase.seconds ? repTarget(phase.reps) : null;
  /** Save this work set's numbers (reps tapped, weight, effort), then move on. */
  const finishSet = (next: number) => {
    if (phase && phase.kind === 'work') {
      setResults((r) => [...r, { set: phase.set, reps: count > 0 ? count : null, weightKg: isStrength && weight > 0 ? weight : null, rpe: isStrength && rpe > 0 ? rpe : null }]);
    }
    go(next);
  };
  const summary = summarise(results);
  const alternatives = useMemo(() => swapOptions(e, researchExercises, 4, concerns), [e, concerns]);
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
          {summary.reps > 0 || summary.avgRpe != null ? (
            <Text style={[type.body, { color: colors.muted, marginTop: 12, textAlign: 'center' }]}>
              {summary.reps > 0 ? `${summary.reps} reps` : ''}
              {summary.volumeKg > 0 ? ` · ${summary.volumeKg} kg lifted in total` : ''}
              {summary.avgRpe != null ? ` · effort ${summary.avgRpe} of 10 (${effortWords(summary.avgRpe).toLowerCase()})` : ''}
            </Text>
          ) : null}
          {e.met != null ? (
            <GradientButton
              title={logged ? 'Logged to Today' : `Log ${mins} min of ${name}`}
              variant="warm"
              disabled={logged}
              style={{ alignSelf: 'stretch', marginTop: 22 }}
              onPress={() => {
                logWorkout({ id: e.id, name: e.name, met: e.met! }, mins, results);
                setLogged(true);
                success();
              }}
            />
          ) : null}
          {rt && routine ? (
            nextAt != null ? (
              <GradientButton
                title={`Next: ${shortExerciseName(exerciseById(rItems[nextAt].exerciseId)?.name ?? 'move')} (${nextAt + 1} of ${rItems.length})`}
                style={{ alignSelf: 'stretch', marginTop: 12 }}
                onPress={() => router.replace({ pathname: '/workout/[id]', params: startParams(routine.id, rItems, nextAt) })}
              />
            ) : (
              <Text style={[type.body, { color: colors.accent, fontWeight: '800', marginTop: 14 }]}>Routine finished: {rt.routine.name}</Text>
            )
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
            {note.level ? (
              <View style={[styles.card, { borderColor: note.level === 'avoid' ? colors.bad : note.level === 'modify' ? colors.border : colors.warn }]} accessibilityRole="alert">
                {note.headline ? <Text style={[styles.cueTitle, { color: note.level === 'avoid' ? colors.bad : colors.warn }]}>{note.headline}</Text> : null}
                {note.lines.map((l, i) => (
                  <Text key={i} style={styles.body}>
                    {l}
                  </Text>
                ))}
                {note.level === 'avoid' ? (
                  <View style={{ gap: 4, marginTop: 8 }}>
                    <PressableScale onPress={() => setSwapOpen(true)} style={styles.plain} accessibilityLabel="Swap this move">
                      <Text style={[styles.plainText, { color: colors.accent }]}>Swap for a safer move</Text>
                    </PressableScale>
                    <PressableScale onPress={() => (nextAt != null && routine ? router.replace({ pathname: '/workout/[id]', params: startParams(routine.id, rItems, nextAt) }) : router.replace('/move'))} style={styles.plain} accessibilityLabel="Skip this move">
                      <Text style={styles.plainText}>Skip this move</Text>
                    </PressableScale>
                    {!override ? (
                      <PressableScale onPress={() => setOverride(true)} style={styles.plain} accessibilityLabel="Do it anyway">
                        <Text style={styles.plainText}>I have checked with my doctor. Do it anyway</Text>
                      </PressableScale>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
            {!note.level && unresearched.length ? <Text style={styles.note}>You told us about your {unresearched.join(', ')}. We have no research on which moves suit that yet, so stop if anything hurts.</Text> : null}
            {swapOpen && !phase ? (
              <View style={[styles.card, { gap: 4 }]}>
                <Text style={styles.cardLabel}>Swap for</Text>
                {alternatives.length === 0 ? <Text style={styles.muted}>No safe swap found. Skip this move or ask a doctor.</Text> : null}
                {alternatives.map((a) => (
                  <PressableScale key={a.id} onPress={() => router.replace({ pathname: '/workout/[id]', params: { id: a.id, ...(routine ? { routine: routine.id, at: String(routine.at) } : {}) } })} style={styles.plain} accessibilityLabel={`Swap to ${shortExerciseName(a.name)}`}>
                    <Text style={[styles.plainText, { color: colors.text }]}>{shortExerciseName(a.name)}</Text>
                  </PressableScale>
                ))}
              </View>
            ) : null}
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
                    {phase.kind === 'work' ? (count > 0 ? String(count) : (phase.reps ?? 'Go')) : ''}
                  </Text>
                  <Text style={styles.repsLabel}>{count > 0 && target0 ? `of ${target0} reps` : 'reps'}</Text>
                </>
              )}
            </Ring>
            {phase.kind === 'work' && phase.seconds && phase.reps ? <Text style={styles.hint}>{phase.reps}</Text> : null}
            {phase.kind === 'rest' ? <Text style={styles.hint}>Breathe. Next up: set {phase.nextSet}.</Text> : null}
            {paused ? <Text style={[styles.hint, { color: colors.warn }]}>Paused</Text> : null}

            {phase.kind === 'work' && !phase.seconds ? (
              <GradientButton
                title={count > 0 ? `Tap for each rep · ${count}` : 'Tap for each rep'}
                variant="glass"
                style={{ alignSelf: 'stretch', marginTop: 14 }}
                onPress={() => {
                  select();
                  const n = count + 1;
                  setCount(n);
                  if (voice) speakStep(countCue(n, target0));
                }}
              />
            ) : null}
            {phase.kind === 'work' && isStrength ? (
              <View style={[styles.card, { alignSelf: 'stretch' }]}>
                <Text style={styles.cardLabel}>This set</Text>
                <Stepper label="Weight" value={weight > 0 ? `${weight} kg` : 'Bodyweight'} onMinus={() => setWeight((w) => clampKg(w - KG_STEP))} onPlus={() => setWeight((w) => clampKg(w + KG_STEP))} />
                <Stepper label="Effort" value={rpe > 0 ? `${rpe} of 10 · ${effortWords(rpe)}` : 'Not set'} onMinus={() => setRpe((r) => (r <= 1 ? 0 : clampRpe(r - 1)))} onPlus={() => setRpe((r) => clampRpe(r === 0 ? 6 : r + 1))} />
              </View>
            ) : null}

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
            {gated ? <Text style={[styles.muted, { textAlign: 'center' }]}>Choose Swap or Skip above before starting.</Text> : <GradientButton title="▶  Start workout" onPress={() => go(0)} />}
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
                finishSet(at + 1);
              }}
            />
          </View>
        )}
        {phase ? (
          <View style={styles.sideRow}>
            <PressableScale onPress={() => setVoice((v) => !v)} style={styles.plain} accessibilityLabel={voice ? 'Counting aloud is on' : 'Counting aloud is off'}>
              <Text style={styles.plainText}>{voice ? 'Counting aloud: on' : 'Counting aloud: off'}</Text>
            </PressableScale>
            <PressableScale onPress={() => setSwapOpen((v) => !v)} style={styles.plain} accessibilityLabel="Swap this move">
              <Text style={styles.plainText}>Swap move</Text>
            </PressableScale>
            <PressableScale
              onPress={() => (nextAt != null && routine ? router.replace({ pathname: '/workout/[id]', params: startParams(routine.id, rItems, nextAt) }) : router.replace('/move'))}
              style={styles.plain}
              accessibilityLabel="Skip this move"
            >
              <Text style={styles.plainText}>Skip move</Text>
            </PressableScale>
          </View>
        ) : null}
        {phase && swapOpen ? (
          <View style={{ gap: 6, marginTop: 6 }}>
            {alternatives.length === 0 ? <Text style={styles.muted}>No easy swap for this one.</Text> : null}
            {alternatives.map((a) => (
              <PressableScale
                key={a.id}
                onPress={() => router.replace({ pathname: '/workout/[id]', params: { id: a.id, ...(routine ? { routine: routine.id, at: String(routine.at) } : {}) } })}
                style={styles.plain}
                accessibilityLabel={`Swap to ${shortExerciseName(a.name)}`}
              >
                <Text style={styles.plainText}>{shortExerciseName(a.name)}</Text>
              </PressableScale>
            ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <Text style={[styles.body, { width: 64, fontWeight: '800' }]}>{label}</Text>
      <PressableScale onPress={onMinus} style={styles.cueBtn} accessibilityLabel={`Less ${label.toLowerCase()}`}>
        <Ionicons name="remove" size={18} color={colors.text} />
      </PressableScale>
      <Text style={[styles.body, { flex: 1, textAlign: 'center' }]}>{value}</Text>
      <PressableScale onPress={onPlus} style={styles.cueBtn} accessibilityLabel={`More ${label.toLowerCase()}`}>
        <Ionicons name="add" size={18} color={colors.text} />
      </PressableScale>
    </View>
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
  sideRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
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
