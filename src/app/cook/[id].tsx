import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, styles as ui } from '../../components/ui';
import { getDish, scaleQty } from '../../data/dishes';
import { colors } from '../../theme';

function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (left === null)
    return <Button title={`Start ${minutes}-min timer`} variant="secondary" onPress={() => setLeft(minutes * 60)} />;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return <Text style={styles.timer}>{left > 0 ? `${mm}:${ss}` : '⏰ Time’s up!'}</Text>;
}

export default function CookScreen() {
  const { id, servings: s } = useLocalSearchParams<{ id: string; servings?: string }>();
  const dish = getDish(id);
  const servings = Number(s) || dish?.baseServings || 2;
  const [i, setI] = useState(0);
  if (!dish) return null;

  const step = dish.steps[i];
  const last = i === dish.steps.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }} edges={['bottom']}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((i + 1) / dish.steps.length) * 100}%` }]} />
      </View>
      <Text style={[ui.muted, { marginTop: 8 }]}>
        Step {i + 1} of {dish.steps.length} · {dish.name} for {servings}
      </Text>

      {/* Placeholder for the per-step video clip. */}
      <View style={styles.video}>
        <Text style={{ fontSize: 64 }}>{dish.emoji}</Text>
        <Text style={ui.muted}>Step video goes here</Text>
      </View>

      <Card style={{ flex: 1 }}>
        <Text style={styles.stepText}>{step.text}</Text>
        {step.amount ? (
          <Text style={styles.amount}>
            {scaleQty(step.amount.qty, dish, servings)} {step.amount.unit} {step.amount.item}
          </Text>
        ) : null}
        {step.equipment ? <Text style={[ui.muted, { marginTop: 10 }]}>🍳 Use: {step.equipment}</Text> : null}
        {step.minutes ? (
          <View style={{ marginTop: 16 }}>
            <Timer key={i} minutes={step.minutes} />
          </View>
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Button title="Back" variant="secondary" disabled={i === 0} onPress={() => setI(i - 1)} />
        </View>
        <View style={{ flex: 2 }}>
          <Button
            title={last ? 'Done! 🎉' : 'Next step'}
            onPress={() =>
              last ? router.replace({ pathname: '/done/[id]', params: { id: dish.id, servings: String(servings) } }) : setI(i + 1)
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.cardAlt, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.accent },
  video: {
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stepText: { color: colors.text, fontSize: 22, fontWeight: '700', lineHeight: 30 },
  amount: { color: colors.accent, fontSize: 20, fontWeight: '800', marginTop: 12 },
  timer: { color: colors.warn, fontSize: 40, fontWeight: '900', textAlign: 'center' },
});
