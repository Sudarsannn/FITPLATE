import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn as RFadeIn } from 'react-native-reanimated';

import { DishImageSlot } from '../components/dishes/parts';
import { Chip, GradientButton, PressableScale } from '../components/ui';
import { researchExercises } from '../data/research';
import { success } from '../lib/haptics';
import { recommend, useStore, WATER_TARGET } from '../lib/store';
import type { Exercise } from '../models/exercise';
import { exerciseKcal, SECTION_LABEL, shortExerciseName, suggestedMinutes } from '../services/fitness';
import { colors, radius, type } from '../theme';

type Tab = 'meal' | 'exercise' | 'water';

const num = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export default function Log() {
  const params = useLocalSearchParams<{ tab?: Tab; exercise?: string; minutes?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? (params.exercise ? 'exercise' : 'meal'));
  const { logDish, logCustomMeal, logWorkout, addWater, today, profile, bodyWeightKg } = useStore();

  const [q, setQ] = useState('');
  const [custom, setCustom] = useState(false);
  const [cName, setCName] = useState('');
  const [cKcal, setCKcal] = useState('');
  const [cProtein, setCProtein] = useState('');

  const exercises = useMemo(() => researchExercises.filter((e) => e.met != null), []);
  const [ex, setEx] = useState<Exercise | undefined>(() => exercises.find((e) => e.id === params.exercise) ?? exercises[0]);
  const [mins, setMins] = useState(() => Math.max(5, Number(params.minutes) || (ex ? suggestedMinutes(ex) : 20)));

  const ranked = useMemo(() => recommend(profile), [profile]);
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = query ? ranked.filter((d) => d.name.toLowerCase().includes(query) || d.cuisine?.toLowerCase().includes(query)) : ranked;
    return list.slice(0, query ? 30 : 12);
  }, [q, ranked]);

  const done = () => {
    success();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bgElevated }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Text style={[type.h1, { color: colors.text }]}>Quick log</Text>
      <View style={styles.tabs}>
        {(
          [
            ['meal', '🍱 Meal'],
            ['exercise', '🏃 Workout'],
            ['water', '💧 Water'],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <Chip key={t} label={l} active={tab === t} onPress={() => setTab(t)} />
        ))}
      </View>

      <Animated.View key={tab} entering={RFadeIn.duration(250)}>
        {tab === 'meal' ? (
          <>
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput value={q} onChangeText={setQ} placeholder="Search a FitPlate dish" placeholderTextColor={colors.faint} style={styles.input} />
            </View>
            <Text style={styles.hint}>{q ? `${results.length} dishes` : 'Picked for your goal. One tap logs one serving.'}</Text>
            {results.map((d) => {
              const n = d.nutritionPerServing;
              return (
                <PressableScale
                  key={d.id}
                  scaleTo={0.98}
                  onPress={() => {
                    logDish(d);
                    done();
                  }}
                  style={styles.row}
                  accessibilityLabel={`Log ${d.name}`}
                >
                  <DishImageSlot dish={d} size={44} label={false} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text style={[type.small, { color: colors.muted }]} numberOfLines={1}>
                      {[n.proteinG != null ? `${Math.round(n.proteinG)} g protein` : null, n.fibreG != null ? `${Math.round(n.fibreG)} g fibre` : null].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Text style={styles.kcal}>{n.kcal != null ? `${Math.round(n.kcal)} kcal` : '–'}</Text>
                </PressableScale>
              );
            })}

            {custom ? (
              <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
                <Text style={styles.name}>Something else</Text>
                <TextInput value={cName} onChangeText={setCName} placeholder="What did you eat?" placeholderTextColor={colors.faint} style={styles.field} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput value={cKcal} onChangeText={setCKcal} placeholder="kcal" keyboardType="numeric" placeholderTextColor={colors.faint} style={[styles.field, { flex: 1 }]} />
                  <TextInput value={cProtein} onChangeText={setCProtein} placeholder="Protein g" keyboardType="numeric" placeholderTextColor={colors.faint} style={[styles.field, { flex: 1 }]} />
                </View>
                <GradientButton
                  title="Log it"
                  disabled={!cName.trim() || !num(cKcal)}
                  onPress={() => {
                    logCustomMeal({ name: cName.trim(), kcal: num(cKcal), protein: num(cProtein), fibre: 0 });
                    done();
                  }}
                />
              </View>
            ) : (
              <PressableScale onPress={() => setCustom(true)} style={[styles.row, { justifyContent: 'center' }]}>
                <Ionicons name="create-outline" size={18} color={colors.accent} />
                <Text style={{ color: colors.accent, fontWeight: '800' }}>Something else? Enter it yourself</Text>
              </PressableScale>
            )}
          </>
        ) : null}

        {tab === 'exercise' && ex ? (
          <>
            <Text style={styles.hint}>From FitPlate&apos;s fitness research. Calories use your weight{bodyWeightKg ? ` (${bodyWeightKg} kg)` : ' (70 kg until you add yours)'}.</Text>
            <View style={styles.grid}>
              {exercises.map((e) => (
                <PressableScale
                  key={e.id}
                  onPress={() => {
                    setEx(e);
                    setMins(suggestedMinutes(e));
                  }}
                  style={[styles.exTile, ex.id === e.id && styles.exOn]}
                  scaleTo={0.95}
                  accessibilityLabel={e.name}
                >
                  <Text style={styles.exName} numberOfLines={2}>
                    {shortExerciseName(e.name)}
                  </Text>
                  <Text style={styles.exSection} numberOfLines={1}>
                    {e.section ? SECTION_LABEL[e.section] : ''}
                  </Text>
                </PressableScale>
              ))}
            </View>
            <View style={styles.minRow}>
              <PressableScale onPress={() => setMins(Math.max(5, mins - 5))} style={styles.round} accessibilityLabel="5 minutes less">
                <Ionicons name="remove" size={22} color={colors.text} />
              </PressableScale>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bigNum}>{mins}</Text>
                <Text style={{ color: colors.muted }}>minutes</Text>
              </View>
              <PressableScale onPress={() => setMins(mins + 5)} style={styles.round} accessibilityLabel="5 minutes more">
                <Ionicons name="add" size={22} color={colors.text} />
              </PressableScale>
            </View>
            <Text style={{ color: colors.warm, textAlign: 'center', fontSize: 18, fontWeight: '900', marginBottom: 18 }}>≈ {exerciseKcal(ex.met!, mins, bodyWeightKg)} kcal (est.)</Text>
            <GradientButton
              title={`Log ${shortExerciseName(ex.name)}`}
              variant="warm"
              onPress={() => {
                logWorkout({ id: ex.id, name: ex.name, met: ex.met! }, mins);
                done();
              }}
            />
          </>
        ) : null}

        {tab === 'water' ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.hint}>
              {today.water} of {WATER_TARGET} glasses today
            </Text>
            <Text style={{ fontSize: 80, marginVertical: 10 }}>💧</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
              <GradientButton
                title="+1 glass"
                onPress={() => {
                  addWater(1);
                  done();
                }}
                style={{ flex: 1 }}
              />
              <GradientButton
                title="+2 glasses"
                variant="glass"
                onPress={() => {
                  addWater(2);
                  done();
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 8 },
  hint: { color: colors.muted, marginVertical: 12, fontSize: 13, lineHeight: 18 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingHorizontal: 14, height: 46, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 15, minWidth: 0 },
  field: { color: colors.text, fontSize: 15, height: 44, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: colors.cardAlt, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  kcal: { color: colors.accent, fontWeight: '900', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exTile: { width: '48.5%', minHeight: 64, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  exOn: { borderColor: colors.warm, backgroundColor: 'rgba(255,138,61,0.12)' },
  exName: { color: colors.text, fontWeight: '800', fontSize: 13.5, lineHeight: 17 },
  exSection: { color: colors.muted, fontSize: 11.5, marginTop: 2 },
  minRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 22 },
  round: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  bigNum: { color: colors.text, fontSize: 52, fontWeight: '900', letterSpacing: -2 },
});
