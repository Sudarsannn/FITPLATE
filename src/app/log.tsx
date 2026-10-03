import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn as RFadeIn } from 'react-native-reanimated';

import { Chip, GradientButton, PressableScale } from '../components/ui';
import { success } from '../lib/haptics';
import { EXERCISES, exerciseKcal, QUICK_MEALS, useStore, WATER_TARGET } from '../lib/store';
import { colors, radius, type } from '../theme';

type Tab = 'meal' | 'exercise' | 'water';

export default function Log() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'meal');
  const { logQuickMeal, logExercise, addWater, today } = useStore();
  const [ex, setEx] = useState(EXERCISES[0]);
  const [mins, setMins] = useState(30);

  const done = (msg?: string) => {
    success();
    router.back();
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bgElevated }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
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
            <Text style={styles.hint}>Didn’t cook? Log the office lunch or an order in one tap.</Text>
            {QUICK_MEALS.map((m) => (
              <PressableScale
                key={m.name}
                scaleTo={0.98}
                onPress={() => {
                  logQuickMeal(m);
                  done();
                }}
                style={styles.row}
              >
                <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  <Text style={[type.small, { color: colors.muted }]}>
                    {m.protein} g protein · {m.fibre} g fibre
                  </Text>
                </View>
                <Text style={styles.kcal}>{m.kcal} kcal</Text>
              </PressableScale>
            ))}
            <PressableScale onPress={() => router.replace('/discover')} style={[styles.row, { justifyContent: 'center' }]}>
              <Ionicons name="restaurant" size={18} color={colors.accent} />
              <Text style={{ color: colors.accent, fontWeight: '800' }}>Cook something instead</Text>
            </PressableScale>
          </>
        ) : null}

        {tab === 'exercise' ? (
          <>
            <Text style={styles.hint}>Calories burnt are estimated for a 70 kg adult.</Text>
            <View style={styles.grid}>
              {EXERCISES.map((e) => (
                <PressableScale key={e.type} onPress={() => setEx(e)} style={[styles.exTile, ex.type === e.type && styles.exOn]} scaleTo={0.92}>
                  <Text style={{ fontSize: 30 }}>{e.emoji}</Text>
                  <Text style={[styles.name, { marginTop: 4 }]}>{e.type}</Text>
                </PressableScale>
              ))}
            </View>
            <View style={styles.minRow}>
              <PressableScale onPress={() => setMins(Math.max(5, mins - 5))} style={styles.round}>
                <Ionicons name="remove" size={22} color={colors.text} />
              </PressableScale>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.bigNum}>{mins}</Text>
                <Text style={{ color: colors.muted }}>minutes</Text>
              </View>
              <PressableScale onPress={() => setMins(mins + 5)} style={styles.round}>
                <Ionicons name="add" size={22} color={colors.text} />
              </PressableScale>
            </View>
            <Text style={{ color: colors.warm, textAlign: 'center', fontSize: 18, fontWeight: '900', marginBottom: 18 }}>
              ≈ {exerciseKcal(ex.met, mins)} kcal burnt
            </Text>
            <GradientButton
              title={`Log ${ex.type.toLowerCase()}`}
              variant="warm"
              onPress={() => {
                logExercise(ex.type, mins);
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
              <GradientButton title="+1 glass" onPress={() => { addWater(1); done(); }} style={{ flex: 1 }} />
              <GradientButton title="+2 glasses" variant="glass" onPress={() => { addWater(2); done(); }} style={{ flex: 1 }} />
            </View>
          </View>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 8 },
  hint: { color: colors.muted, marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  kcal: { color: colors.accent, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  exTile: { width: '31%', alignItems: 'center', paddingVertical: 16, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  exOn: { borderColor: colors.warm, backgroundColor: 'rgba(255,138,61,0.12)' },
  minRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 22 },
  round: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  bigNum: { color: colors.text, fontSize: 52, fontWeight: '900', letterSpacing: -2 },
});
