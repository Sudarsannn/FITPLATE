import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../../components/ui';
import { researchExercises, researchFitnessGuides } from '../../data/research';
import { useStore } from '../../lib/store';
import type { ExerciseSection } from '../../models/exercise';
import { lastSevenDaysActivity } from '../../services/activity';
import { bySection, doseLabel, kcalPer10, musclesLine, prescriptionFor, SECTION_ICON, SECTION_LABEL, shortExerciseName } from '../../services/fitness';
import { colors, radius, type } from '../../theme';

const SECTIONS: ExerciseSection[] = ['home', 'yoga_stretch', 'gym'];
const SECTION_BLURB: Record<ExerciseSection, string> = {
  home: 'No equipment. A mat or a rug is enough.',
  yoga_stretch: 'Gentle moves for desk days and tight hips.',
  gym: 'Machines and form, step by step.',
};

/** The Move tab: the fitness research library, grouped Home / Yoga & stretch / Gym, plus gym know-how guides. */
export default function Move() {
  const { days, bodyWeightKg, profile } = useStore();
  const week = lastSevenDaysActivity(days);
  const groups = bySection(researchExercises);
  // One training place in the survey opens on its section; gym or mixed answers see everything.
  const where = profile.survey.trainWhere;
  const [section, setSection] = useState<ExerciseSection | 'all'>(where.length === 1 && where[0] === 'home' ? 'home' : 'all');
  const shown = section === 'all' ? SECTIONS : [section];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Move</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>At home, on the mat or in the gym. Every move is researched and explained step by step.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <Glass style={{ marginTop: 16 }}>
            <Text style={styles.label}>Last 7 days</Text>
            {week.sessions === 0 ? (
              <Text style={[type.body, { color: colors.text }]}>No workouts logged this week yet. Ten minutes counts.</Text>
            ) : (
              <View style={styles.stats}>
                <Stat value={week.sessions} unit={week.sessions === 1 ? 'workout' : 'workouts'} />
                <Stat value={week.minutes} unit="minutes" />
                <Stat value={week.kcal} unit="kcal (est.)" />
              </View>
            )}
            <GradientButton title="Log a workout" onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise' } })} style={{ marginTop: 14 }} />
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginTop: 18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
            <Chip label={`All (${researchExercises.length})`} active={section === 'all'} onPress={() => setSection('all')} />
            {SECTIONS.map((s) => (
              <Chip key={s} label={`${SECTION_LABEL[s]} (${groups[s].length})`} active={section === s} onPress={() => setSection(s)} />
            ))}
          </ScrollView>
        </FadeIn>

        {shown.map((s, si) =>
          groups[s].length ? (
            <FadeIn key={s} i={3 + si}>
              <View style={styles.sectionHead}>
                <View style={styles.icon}>
                  <Ionicons name={SECTION_ICON[s]} size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[type.h2, { color: colors.text }]}>{SECTION_LABEL[s]}</Text>
                  <Text style={[type.small, { color: colors.muted }]}>{SECTION_BLURB[s]}</Text>
                </View>
              </View>
              {groups[s].map((e) => {
                const dose = doseLabel(prescriptionFor(e));
                const k10 = kcalPer10(e, bodyWeightKg);
                return (
                  <PressableScale key={e.id} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })} style={styles.row} scaleTo={0.98} accessibilityLabel={`${e.name}. ${dose ?? ''}`}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.name} numberOfLines={1}>
                        {shortExerciseName(e.name)}
                      </Text>
                      <Text style={styles.meta} numberOfLines={1}>
                        {musclesLine(e) || (e.level ? cap(e.level) : '')}
                      </Text>
                      {dose ? (
                        <Text style={styles.dose} numberOfLines={1}>
                          {dose}
                        </Text>
                      ) : null}
                    </View>
                    {k10 != null ? (
                      <View style={styles.kcal}>
                        <Text style={styles.kcalNum}>{k10}</Text>
                        <Text style={styles.kcalUnit}>kcal/10 min</Text>
                      </View>
                    ) : null}
                    <Ionicons name="chevron-forward" size={18} color={colors.faint} />
                  </PressableScale>
                );
              })}
            </FadeIn>
          ) : null,
        )}

        {researchFitnessGuides.length && (section === 'all' || section === 'gym') ? (
          <FadeIn i={7}>
            <View style={styles.sectionHead}>
              <View style={styles.icon}>
                <Ionicons name="book-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.h2, { color: colors.text }]}>Before you start</Text>
                <Text style={[type.small, { color: colors.muted }]}>Short, researched know-how for beginners.</Text>
              </View>
            </View>
            {researchFitnessGuides.map((g) => (
              <PressableScale key={g.id} onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: g.id } })} style={styles.row} scaleTo={0.98}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name} numberOfLines={2}>
                    {g.name}
                  </Text>
                  <Text style={styles.meta} numberOfLines={2}>
                    {g.keyTakeaways[0]?.split('. ')[0]}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.faint} />
              </PressableScale>
            ))}
          </FadeIn>
        ) : null}

        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          Calories are estimates (Compendium MET × your weight{bodyWeightKg ? '' : ', 70 kg until you add yours'}). Check with a doctor before starting a new routine, especially with a health condition, pregnancy or an injury.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Stat({ value, unit }: { value: number; unit: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '900' }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  stats: { flexDirection: 'row', gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 10 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(61,220,132,0.14)', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2, lineHeight: 17 },
  dose: { color: colors.accent2, fontSize: 12.5, fontWeight: '700', marginTop: 3 },
  kcal: { alignItems: 'center', minWidth: 56 },
  kcalNum: { color: colors.warm, fontSize: 18, fontWeight: '900' },
  kcalUnit: { color: colors.muted, fontSize: 10, fontWeight: '600' },
});
