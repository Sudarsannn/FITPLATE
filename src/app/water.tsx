import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { FadeIn, Glass, PressableScale } from '../components/ui';
import { featureFlags } from '../config/featureFlags';
import { select } from '../lib/haptics';
import { setWaterReminders } from '../lib/reminders';
import { addDays, dayKey, useStore } from '../lib/store';
import { glassesToMl, litres, PRESETS, targetGlasses, waterHistory, waterStreak } from '../services/water';
import { waterTarget } from '../services/targets';
import { colors, radius, type } from '../theme';

const dayLetter = (key: string) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${key}T00:00:00`).getDay()];

/** Day 17: the full water screen: today's progress, one-tap presets, the last 7 days, the streak, and workday reminders (flag `waterTracker`). */
export default function WaterScreen() {
  const { days, today, addWater, settings, updateSettings } = useStore();
  const [now] = useState(() => new Date());
  const target = targetGlasses();
  const info = waterTarget();
  const keysNewestFirst = useMemo(() => Array.from({ length: 30 }, (_, i) => dayKey(addDays(now, -i))), [now]);
  const week = useMemo(() => waterHistory(days, keysNewestFirst.slice(0, 7).reverse(), target), [days, keysNewestFirst, target]);
  const streak = useMemo(() => waterStreak(days, keysNewestFirst, target), [days, keysNewestFirst, target]);
  const pct = Math.min(1, today.water / target);
  const remindersOn = Boolean(settings.featureToggles.waterReminders);
  const [note, setNote] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Water" fallback="/(tabs)" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {!featureFlags.waterTracker ? <Notice tone="warn">This feature is switched off.</Notice> : null}
        <FadeIn i={0}>
          <Glass>
            <Text style={[type.h1, { color: colors.text }]}>
              {today.water} of {target} glasses
            </Text>
            <Text style={[type.small, { color: colors.muted }]}>
              {litres(today.water)} of {litres(target)} today ({glassesToMl(today.water)} ml)
            </Text>
            <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ now: Math.round(pct * 100), min: 0, max: 100 }}>
              <View style={[styles.fill, { width: `${pct * 100}%` }]} />
            </View>
            <Text style={{ color: today.water >= target ? colors.accent : colors.muted, marginTop: 6, fontWeight: '700' }}>
              {today.water >= target ? 'Target met. Nice.' : `${target - today.water} more to go`}
            </Text>
            <View style={styles.presets}>
              {PRESETS.map((p) => (
                <PressableScale
                  key={p.id}
                  onPress={() => {
                    select();
                    addWater(p.glasses);
                  }}
                  style={styles.preset}
                  scaleTo={0.95}
                  accessibilityLabel={`Add ${p.label}`}
                >
                  <Ionicons name="water" size={20} color={colors.blue} />
                  <Text style={styles.presetText}>+{p.glasses * 250} ml</Text>
                  <Text style={styles.presetSub}>{p.label}</Text>
                </PressableScale>
              ))}
            </View>
            <PressableScale onPress={() => addWater(-1)} style={styles.undo} accessibilityLabel="Remove one glass">
              <Text style={{ color: colors.muted }}>Undo one glass</Text>
            </PressableScale>
            <Text style={[type.small, { color: colors.faint, marginTop: 8 }]}>One glass is about 250 ml. {info.note}</Text>
          </Glass>
        </FadeIn>

        <FadeIn i={1}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>
              {streak > 0 ? `${streak} day${streak === 1 ? '' : 's'} in a row` : 'No streak yet'}
            </Text>
            <Text style={[type.small, { color: colors.muted }]}>Days you reached the target. Today counts once you reach it.</Text>
            <View style={styles.week}>
              {week.map((d) => (
                <View key={d.key} style={styles.dayCol}>
                  <View style={styles.dayBarBox}>
                    <View style={[styles.dayBar, { height: `${Math.min(1, d.glasses / target) * 100}%`, backgroundColor: d.met ? colors.accent : colors.blue }]} />
                  </View>
                  <Text style={styles.dayLetter}>{dayLetter(d.key)}</Text>
                  <Text style={styles.dayNum}>{d.glasses}</Text>
                </View>
              ))}
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Water reminders</Text>
                <Text style={[type.small, { color: colors.muted }]}>Weekdays, five nudges from 8:30 am to 6 pm. Quiet from 9 pm to 8 am. On the phone app only.</Text>
              </View>
              <Switch
                value={remindersOn}
                onValueChange={async (v) => {
                  updateSettings({ featureToggles: { ...settings.featureToggles, waterReminders: v } });
                  const ok = await setWaterReminders(v);
                  setNote(v && !ok ? 'Reminders need the phone app and notification permission.' : null);
                }}
                trackColor={{ true: colors.accent, false: '#333' }}
                thumbColor="#fff"
                accessibilityLabel="Water reminders"
              />
            </View>
            {note ? <Text style={[type.small, { color: colors.warn, marginTop: 6 }]}>{note}</Text> : null}
          </Glass>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  track: { height: 12, borderRadius: 6, backgroundColor: colors.cardAlt, marginTop: 12, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6, backgroundColor: colors.blue },
  presets: { flexDirection: 'row', gap: 10, marginTop: 14 },
  preset: { flex: 1, minHeight: 72, borderRadius: radius.md, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center', padding: 8 },
  presetText: { color: colors.text, fontWeight: '800', marginTop: 2 },
  presetSub: { color: colors.muted, fontSize: 11 },
  undo: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 6 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayCol: { alignItems: 'center', flex: 1 },
  dayBarBox: { height: 70, width: 18, borderRadius: 6, backgroundColor: colors.cardAlt, justifyContent: 'flex-end', overflow: 'hidden' },
  dayBar: { width: 18, borderRadius: 6 },
  dayLetter: { color: colors.muted, fontSize: 12, marginTop: 4 },
  dayNum: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
