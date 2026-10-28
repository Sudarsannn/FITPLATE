import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { FadeIn, PressableScale } from '../components/ui';
import { getDish, researchExercises, researchLinks } from '../data/research';
import { useStore } from '../lib/store';
import { burnWays, DEFAULT_WEIGHT_KG, durationLabel } from '../services/dishDetail';
import { fitOrder, moveFit, userConcerns, type Fit } from '../services/moveSafety';
import { workoutFit } from '../services/surveyMatch';
import { musclesLine, SECTION_ICON, SECTION_LABEL, shortExerciseName } from '../services/fitness';
import { colors, radius, type } from '../theme';

/**
 * "See ways to balance this" (SPEC-ADDENDA §8, opt-in): the researched moves
 * that would use up a meal's calories at your weight, each one ready to start
 * as a guided workout or to log. Reached only by tapping the balance link on a
 * dish or on Today, never pushed after logging or cooking.
 */
export default function Balance() {
  const { kcal: k, dish: dishId } = useLocalSearchParams<{ kcal?: string; dish?: string }>();
  const { bodyWeightKg, profile } = useStore();
  const dish = dishId ? getDish(dishId) : undefined;
  const kcal = Math.round(Number(k) || dish?.nutritionPerServing.kcal || 0);
  const byId = new Map(researchExercises.map((e) => [e.id, e]));
  // Moves that fit the Training answers come first; minutes break ties.
  const fit = (id: string) => {
    const e = byId.get(id);
    return e ? workoutFit(profile.survey, e) : 0;
  };
  const { concerns, unresearched } = userConcerns(profile.survey);
  const safety = (id: string) => (byId.get(id) ? moveFit(byId.get(id)!, concerns) : { fit: 'unknown' as Fit, notes: [] });
  const all = burnWays(kcal, bodyWeightKg, researchLinks.met, 8);
  // The research says to avoid these for you, so they are left out; the rest go safest first.
  const ways = all
    .filter((w) => safety(w.exerciseId).fit !== 'avoid')
    .sort((a, b) => fitOrder(safety(a.exerciseId).fit) - fitOrder(safety(b.exerciseId).fit) || fit(b.exerciseId) - fit(a.exerciseId) || a.minutes - b.minutes);
  const hidden = all.length - ways.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Balance it out" subtitle={dish ? dish.name : null} fallback="/move" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <View style={styles.hero}>
            <Text style={styles.kcal}>{kcal}</Text>
            <Text style={styles.kcalUnit}>kcal {dish ? 'in one serving' : 'over today’s goal'}</Text>
            <Text style={styles.sub}>
              Any one of these uses about that much at {bodyWeightKg ?? DEFAULT_WEIGHT_KG} kg{bodyWeightKg ? '' : ' (add your weight in Profile for your own numbers)'}. Food is fuel; this is just an option.
            </Text>
          </View>
        </FadeIn>

        {concerns.length || unresearched.length ? (
          <View style={{ marginBottom: 12, gap: 8 }}>
            {concerns.length ? (
              <Notice tone="warn">
                Picked with your answers in mind ({concerns.map((c) => c.label).join(', ')}).{hidden ? ` ${hidden} move${hidden > 1 ? 's' : ''} the research says to avoid for you ${hidden > 1 ? 'are' : 'is'} hidden.` : ''} Moves marked &quot;Ask first&quot; need a doctor&apos;s OK.
              </Notice>
            ) : null}
            {unresearched.length ? (
              <Notice tone="warn">
                You told us about your {unresearched.join(', ')}, and we have no research on which moves suit that yet. Please check with a doctor or physio before choosing, or skip anything that hurts.
              </Notice>
            ) : null}
          </View>
        ) : null}

        {ways.length ? (
          ways.map((w, i) => {
            const e = byId.get(w.exerciseId);
            return (
              <FadeIn key={w.exerciseId} i={i + 1}>
                <View style={styles.card}>
                  <PressableScale onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: w.exerciseId } })} style={styles.head} scaleTo={0.98} accessibilityLabel={`About ${w.name}`}>
                    <View style={styles.icon}>
                      <Ionicons name={e?.section ? SECTION_ICON[e.section] : 'barbell'} size={18} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.name} numberOfLines={1}>
                        {shortExerciseName(w.name)}
                      </Text>
                      {safety(w.exerciseId).fit === 'ask_doctor' ? <Text style={styles.warn}>Ask first: needs a doctor&apos;s OK</Text> : null}
                      {safety(w.exerciseId).fit === 'unknown' ? <Text style={styles.warn}>No research for your answers: ask first</Text> : null}
                      {safety(w.exerciseId).notes.filter((n) => n.status === 'modify').slice(0, 2).map((n) => (
                        <Text key={n.label} style={styles.fits}>For your {n.label}: {n.change}</Text>
                      ))}
                      {fit(w.exerciseId) >= 2 && safety(w.exerciseId).fit === 'ok' ? <Text style={styles.fits}>Fits your training answers</Text> : null}
                      <Text style={styles.meta} numberOfLines={1}>
                        {[e?.section ? SECTION_LABEL[e.section] : null, e ? musclesLine(e) : null].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.mins}>{durationLabel(w.minutes)}</Text>
                      <Text style={styles.minsUnit}>to balance</Text>
                    </View>
                  </PressableScale>
                  <View style={styles.btns}>
                    {e ? (
                      <PressableScale onPress={() => router.push({ pathname: '/workout/[id]', params: { id: w.exerciseId, minutes: String(w.minutes) } })} style={[styles.btn, styles.start]} scaleTo={0.96} accessibilityLabel={`Start ${w.name}`}>
                        <Ionicons name="play" size={15} color="#06210F" />
                        <Text style={styles.startText}>Start workout</Text>
                      </PressableScale>
                    ) : null}
                    <PressableScale onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise', exercise: w.exerciseId, minutes: String(w.minutes) } })} style={styles.btn} scaleTo={0.96} accessibilityLabel={`Log ${w.name}`}>
                      <Ionicons name="checkmark-done" size={15} color={colors.text} />
                      <Text style={styles.btnText}>Log workout</Text>
                    </PressableScale>
                  </View>
                </View>
              </FadeIn>
            );
          })
        ) : (
          <Text style={[type.body, { color: colors.muted, marginTop: 20, textAlign: 'center' }]}>Nothing to balance yet.</Text>
        )}

        <PressableScale onPress={() => router.push('/move')} style={styles.all} scaleTo={0.98}>
          <Text style={styles.allText}>Browse every workout in Move</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </PressableScale>
        <Text style={styles.note}>Minutes = calories ÷ (Compendium MET × weight), using the fitness research. Gentle stretches are left out because they would take hours. Moves come from the fitness research; where it has no rule for your answers we ask you to check first. Check with a doctor before starting new exercise.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 18 },
  kcal: { color: colors.warm, fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  kcalUnit: { color: colors.text, fontWeight: '800', fontSize: 14 },
  sub: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 8, maxWidth: 340 },
  card: { padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(61,220,132,0.14)', alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  warn: { color: colors.warn, fontSize: 11.5, fontWeight: '800', marginTop: 1 },
  fits: { color: colors.accent2, fontSize: 11.5, fontWeight: '800', marginTop: 1 },
  meta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  mins: { color: colors.warm, fontWeight: '900', fontSize: 17 },
  minsUnit: { color: colors.muted, fontSize: 10.5, fontWeight: '600' },
  btns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: radius.pill, backgroundColor: colors.cardAlt },
  start: { backgroundColor: colors.accent },
  startText: { color: '#06210F', fontWeight: '900', fontSize: 13.5 },
  btnText: { color: colors.text, fontWeight: '800', fontSize: 13.5 },
  all: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  allText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17, marginTop: 10, textAlign: 'center' },
});
