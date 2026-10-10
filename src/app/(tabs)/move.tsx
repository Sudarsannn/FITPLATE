import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, Glass, GradientButton } from '../../components/ui';
import { useStore } from '../../lib/store';
import { lastSevenDaysActivity } from '../../services/activity';
import { colors, type } from '../../theme';

const COMING: { icon: keyof typeof Ionicons.glyphMap; title: string; blurb: string }[] = [
  { icon: 'home-outline', title: 'Home workouts', blurb: 'No equipment, step by step.' },
  { icon: 'leaf-outline', title: 'Yoga and stretches', blurb: 'Gentle moves for desk days.' },
  { icon: 'barbell-outline', title: 'Gym guides', blurb: 'Form checks, sets and reps.' },
];

// Day 2 placeholder. The research-backed exercise library arrives on Day 21;
// until then this tab shows the week's logged workouts and what is coming.
export default function Move() {
  const { days } = useStore();
  const week = lastSevenDaysActivity(days);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Move</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Burn it off your way: at home, on the mat or in the gym.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <Glass style={{ marginTop: 16 }}>
            <Text style={styles.label}>Last 7 days</Text>
            {week.sessions === 0 ? (
              <Text style={[type.body, { color: colors.text }]}>No workouts logged yet this week. A 10-minute walk counts!</Text>
            ) : (
              <View style={styles.stats}>
                <Stat value={week.sessions} unit={week.sessions === 1 ? 'workout' : 'workouts'} />
                <Stat value={week.minutes} unit="minutes" />
                <Stat value={week.kcal} unit="kcal (est.)" />
              </View>
            )}
            <GradientButton
              title="Log a workout"
              onPress={() => router.push({ pathname: '/log', params: { tab: 'exercise' } })}
              style={{ marginTop: 14 }}
            />
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Text style={[styles.label, { marginTop: 22 }]}>Coming soon</Text>
          {COMING.map((c) => (
            <Glass key={c.title} style={styles.row}>
              <View style={styles.icon}>
                <Ionicons name={c.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>{c.title}</Text>
                <Text style={[type.small, { color: colors.muted }]}>{c.blurb}</Text>
              </View>
            </Glass>
          ))}
        </FadeIn>

        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          Calories burnt are estimates. Check with a doctor before starting a new exercise routine, especially if you have a health condition.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(61,220,132,0.14)', alignItems: 'center', justifyContent: 'center' },
});
