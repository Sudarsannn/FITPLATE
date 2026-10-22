import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenTop } from '../../components/vendors/kit';
import { GradientButton, PressableScale } from '../../components/ui';
import { researchExercises, researchFitnessGuides } from '../../data/research';
import { useStore } from '../../lib/store';
import type { Exercise, Guidance } from '../../models/exercise';
import { splitSource } from '../../services/dishDetail';
import { doseLabel, kcalPer10, prescriptionFor, SECTION_LABEL, shortExerciseName } from '../../services/fitness';
import { colors, radius, type } from '../../theme';

/** One exercise (or gym guide) from the fitness research, step by step. */
export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = researchExercises.find((e) => e.id === id);
  const guide = exercise ? undefined : researchFitnessGuides.find((g) => g.id === id);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title={exercise ? shortExerciseName(exercise.name) : (guide?.name ?? 'Move')} subtitle={exercise?.section ? SECTION_LABEL[exercise.section] : guide ? 'Guide' : null} fallback="/move" />
      {exercise ? (
        <ExerciseBody e={exercise} />
      ) : guide ? (
        <GuideBody g={guide} />
      ) : (
        <View style={{ padding: 30, alignItems: 'center' }}>
          <Text style={[type.h2, { color: colors.text }]}>Not found</Text>
          <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>It may have been renamed in an update. Find it again in the Move tab.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const clean = (s: string) => s.replace(/\s*\(.*?\)\s*/g, ' ').trim();

function ExerciseBody({ e }: { e: Exercise }) {
  const { bodyWeightKg } = useStore();
  const [allSteps, setAllSteps] = useState(false);
  const [allSetup, setAllSetup] = useState(false);
  const p = prescriptionFor(e);
  const dose = doseLabel(p);
  const k10 = kcalPer10(e, bodyWeightKg);
  const steps = allSteps ? e.steps : e.steps.slice(0, 6);
  const setup = allSetup ? e.setupSteps : e.setupSteps.slice(0, 4);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      {shortExerciseName(e.name) !== e.name ? <Text style={[styles.muted, { marginTop: 0, marginBottom: 12 }]}>{e.name}</Text> : null}
      <View style={styles.pills}>
        <Pill value={e.level ? cap(e.level) : '–'} label="level" />
        <Pill value={k10 != null ? `${k10}` : '–'} label="kcal / 10 min" />
        <Pill value={e.impact ? cap(e.impact) : '–'} label="impact" />
      </View>
      {dose ? (
        <View style={styles.dose}>
          <Ionicons name="repeat" size={18} color={colors.accent2} />
          <Text style={styles.doseText}>
            {dose}
            {p?.perWeek ? ` · ${p.perWeek}× a week` : ''}
          </Text>
        </View>
      ) : null}
      {p?.tempo ? <Text style={styles.note}>Tempo: {p.tempo}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <GradientButton title="▶  Start workout" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/workout/[id]', params: { id: e.id } })} />
        <GradientButton title="Log it" variant="glass" style={{ flex: 0.6 }} onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise', exercise: e.id } })} />
      </View>

      <Card title="Works">
        <Text style={styles.body}>{e.musclesPrimary.map(clean).map(cap).join(', ') || 'Coming soon'}</Text>
        {e.musclesSecondary.length ? <Text style={styles.muted}>Also: {e.musclesSecondary.map(clean).join(', ')}</Text> : null}
        <Text style={[styles.body, { marginTop: 8 }]}>
          <Text style={styles.strong}>Equipment: </Text>
          {e.equipment.length ? e.equipment.map(clean).join(', ') : 'None'}
        </Text>
        {e.flatFriendly ? <Text style={styles.muted}>Fine for a flat: quiet and needs little space.</Text> : null}
      </Card>

      {e.setupSteps.length ? (
        <Card title="Set up">
          {setup.map((s, i) => (
            <Bullet key={i} n={i + 1}>
              {s}
            </Bullet>
          ))}
          {e.setupSteps.length > 4 ? <More open={allSetup} count={e.setupSteps.length} onPress={() => setAllSetup((v) => !v)} /> : null}
        </Card>
      ) : null}

      <Card title="Step by step">
        {steps.length ? (
          steps.map((s, i) => (
            <View key={`${s.n}-${i}`}>
              {s.part && s.part !== steps[i - 1]?.part ? <Text style={styles.part}>{s.part}</Text> : null}
              <View style={styles.step}>
                <View style={styles.num}>
                  <Text style={styles.numText}>{s.n}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.strong}>{s.title}</Text>
                  {s.action ? <Text style={styles.body}>{cap(s.action)}</Text> : null}
                  {s.feel ? <Text style={styles.muted}>Feel: {s.feel}</Text> : null}
                  {s.breathing ? <Text style={styles.muted}>Breathe: {s.breathing}</Text> : null}
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.body}>Coming soon</Text>
        )}
        {e.steps.length > 6 ? <More open={allSteps} count={e.steps.length} onPress={() => setAllSteps((v) => !v)} /> : null}
      </Card>

      {e.commonMistakes.length ? (
        <Card title="Common mistakes">
          {e.commonMistakes.slice(0, 5).map((m, i) => (
            <View key={i} style={styles.row}>
              <Ionicons name="close-circle" size={18} color={colors.bad} />
              <Text style={[styles.body, { flex: 1, marginTop: 0 }]}>{m.text}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      {e.regressions.length || e.progressions.length ? (
        <Card title="Make it easier or harder">
          {e.regressions.length ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Easier: </Text>
              {e.regressions.join(', ')}
            </Text>
          ) : null}
          {e.progressions.length ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Harder: </Text>
              {e.progressions.join(', ')}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {e.safetyNotes.length ? (
        <Card title="Safety">
          {e.safetyNotes.slice(0, 5).map((s, i) => (
            <View key={i} style={styles.row}>
              <Ionicons name="warning" size={16} color={colors.warn} />
              <Text style={[styles.small, { flex: 1 }]}>{s}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Sources sources={e.sources} />
      <Text style={[styles.note, { textAlign: 'center', marginTop: 16 }]}>
        Calories are estimates (Compendium MET {e.met ?? '–'} × {bodyWeightKg ?? 70} kg{bodyWeightKg ? '' : ', until you add your weight'}). Check with a doctor before starting new exercise, especially with a health condition, pregnancy or an injury.
      </Text>

      <GradientButton title="▶  Start workout" style={{ marginTop: 16 }} onPress={() => router.push({ pathname: '/workout/[id]', params: { id: e.id } })} />
      <GradientButton title={`Log ${shortExerciseName(e.name)}`} variant="glass" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise', exercise: e.id } })} />
    </ScrollView>
  );
}

function GuideBody({ g }: { g: Guidance }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
      <Card title="Key takeaways">
        {g.keyTakeaways.map((t, i) => (
          <Bullet key={i} n={i + 1}>
            {t}
          </Bullet>
        ))}
      </Card>
      {g.mistakes.length ? (
        <Card title="Beginner mistakes">
          {g.mistakes.map((m, i) => (
            <View key={i} style={styles.row}>
              <Ionicons name="close-circle" size={18} color={colors.bad} />
              <Text style={[styles.body, { flex: 1, marginTop: 0 }]}>{m}</Text>
            </View>
          ))}
        </Card>
      ) : null}
      <Sources sources={g.sources} />
      <Text style={[styles.note, { textAlign: 'center', marginTop: 16 }]}>General information, not medical advice. Check with a doctor before starting new exercise.</Text>
    </ScrollView>
  );
}

function Sources({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;
  return (
    <Card title="Sources">
      <PressableScale onPress={() => setOpen((o) => !o)} style={styles.link} scaleTo={0.98}>
        <Text style={styles.linkText}>{`${open ? 'Hide' : 'Show'} ${sources.length} sources`}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
      </PressableScale>
      {open
        ? sources.map((s, i) => {
            const { label, url } = splitSource(s);
            return (
              <Text key={i} style={[styles.note, url ? { textDecorationLine: 'underline' } : null]} onPress={url ? () => Linking.openURL(url) : undefined}>
                {label}
              </Text>
            );
          })
        : null}
    </Card>
  );
}

function Pill({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text style={styles.pillLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Bullet({ n, children }: { n: number; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.bulletN}>{n}.</Text>
      <Text style={[styles.small, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

function More({ open, count, onPress }: { open: boolean; count: number; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.link} scaleTo={0.98}>
      <Text style={styles.linkText}>{open ? 'Show fewer' : `Show all ${count}`}</Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pillVal: { color: colors.text, fontWeight: '900', fontSize: 16 },
  pillLabel: { color: colors.muted, fontSize: 11.5, marginTop: 2 },
  dose: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(180,244,97,0.10)' },
  doseText: { color: colors.text, fontWeight: '800', fontSize: 14, flex: 1 },
  card: { marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  body: { color: colors.text, fontSize: 14.5, lineHeight: 21, marginTop: 2 },
  small: { color: colors.text, fontSize: 13.5, lineHeight: 19 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  strong: { color: colors.text, fontWeight: '800', fontSize: 14.5 },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 6 },
  part: { color: colors.accent2, fontWeight: '800', fontSize: 13, marginTop: 12, marginBottom: 2 },
  step: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(61,220,132,0.16)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  numText: { color: colors.accent, fontWeight: '900', fontSize: 12.5 },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 5 },
  bulletN: { color: colors.muted, fontWeight: '800', width: 20, fontSize: 13.5, lineHeight: 19 },
  link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
});
