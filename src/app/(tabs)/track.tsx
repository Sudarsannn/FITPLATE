import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { select } from '../../lib/haptics';
import { colors, radius } from '../../theme';
import { PlanScreen } from './plan';
import { ProgressScreen } from './progress';

type TrackView = 'progress' | 'plan';

const OPTIONS: { key: TrackView; label: string }[] = [
  { key: 'progress', label: 'Progress' },
  { key: 'plan', label: 'Meal plan' },
];

// Day 2 shell: Track holds the demo's Progress and Plan screens behind a
// switcher. Day 29 turns it into the full dashboard.
export default function Track() {
  const [view, setView] = useState<TrackView>('progress');
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.switcher} accessibilityRole="tablist">
        {OPTIONS.map((o) => {
          const on = view === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => {
                select();
                setView(o.key);
              }}
              style={[styles.option, on && styles.optionOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={o.label}
            >
              <Text style={[styles.optionText, { color: on ? '#06210F' : colors.muted }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {view === 'progress' ? <ProgressScreen embedded /> : <PlanScreen embedded />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 8,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: { flex: 1, minHeight: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  optionOn: { backgroundColor: colors.accent },
  optionText: { fontWeight: '800', fontSize: 14 },
});
