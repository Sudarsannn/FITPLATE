import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, ScreenTop } from '../components/vendors/kit';
import { Chip, FadeIn, Glass } from '../components/ui';
import { useReminders } from '../lib/useReminders';
import { CATEGORY_LABEL, describe, planReminders, type ReminderCategory, type ReminderPrefs } from '../services/reminderPlan';
import { DOCTOR_LINE } from '../services/healthLimits';
import { colors, type } from '../theme';

const CATS: ReminderCategory[] = ['water', 'meals', 'workouts', 'cookPrep'];
const STARTS = [7, 8, 9, 10];
const ENDS = [17, 18, 19, 20];
const hour12 = (h: number) => `${h > 12 ? h - 12 : h} ${h >= 12 ? 'pm' : 'am'}`;

/** Day 33: every reminder in one place, each with an off switch, planned around the person's workday. */
export default function Reminders() {
  const { prefs, change, allOff, waterCaution } = useReminders();
  const [note, setNote] = useState<string | null>(null);

  const run = async (patch: Partial<ReminderPrefs>) => {
    const res = await change(patch);
    setNote(res === 'unsupported' ? 'Reminders are sent by the phone app. Your choices are saved and will apply there.' : res === 'denied' ? 'Notifications are blocked for FitPlate. Allow them in the phone settings to get reminders.' : null);
  };
  const anyOn = CATS.some((c) => prefs[c]) || prefs.streakNudges;
  const count = planReminders(prefs, {}).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Reminders" fallback="/settings" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60, gap: 14 }} showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.small, { color: colors.muted }]}>Gentle nudges around your workday. All are off until you turn them on, none come between 9 pm and 8 am, and you can turn every one off.</Text>
        </FadeIn>

        <FadeIn i={1}>
          <Glass>
            <Text style={[type.h2, { color: colors.text }]}>Your workday</Text>
            <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Reminders fit inside these hours.</Text>
            <Text style={[type.label, { color: colors.muted, marginTop: 12 }]}>START</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {STARTS.map((h) => (
                <Chip key={h} label={hour12(h)} active={prefs.workStart === h} onPress={() => run({ workStart: h })} />
              ))}
            </View>
            <Text style={[type.label, { color: colors.muted, marginTop: 12 }]}>END</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {ENDS.map((h) => (
                <Chip key={h} label={hour12(h)} active={prefs.workEnd === h} onPress={() => run({ workEnd: h })} />
              ))}
            </View>
          </Glass>
        </FadeIn>

        {CATS.map((c, i) => (
          <FadeIn key={c} i={i + 2}>
            <Glass>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{CATEGORY_LABEL[c]}</Text>
                  <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>{describe(c, prefs)}</Text>
                  {c === 'water' && waterCaution ? <Text style={[type.small, { color: colors.warn, marginTop: 4 }]}>Off by default for you. {DOCTOR_LINE} before turning on water reminders.</Text> : null}
                </View>
                <Switch value={prefs[c]} onValueChange={(v) => run({ [c]: v })} trackColor={{ true: colors.accent, false: '#333' }} thumbColor="#fff" accessibilityLabel={`${CATEGORY_LABEL[c]} reminders`} />
              </View>
            </Glass>
          </FadeIn>
        ))}

        <FadeIn i={6}>
          <Glass>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Streak nudge</Text>
                <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>One evening nudge at 8:30 pm, only if you have a streak of 2 days or more and have not cooked yet today. Never more than one a day.</Text>
              </View>
              <Switch value={prefs.streakNudges} onValueChange={(v) => run({ streakNudges: v })} trackColor={{ true: colors.accent, false: '#333' }} thumbColor="#fff" accessibilityLabel="Streak nudge" />
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={7}>
          <Glass>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{anyOn ? `${count} weekly reminders planned` : 'No reminders planned'}</Text>
            <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Leftover reminders are set from the Done screen after cooking and are not affected here.</Text>
            {anyOn ? (
              <Text onPress={() => allOff().then(() => setNote(null))} style={{ color: colors.accent, fontWeight: '800', marginTop: 10 }} accessibilityRole="button" accessibilityLabel="Turn all reminders off">
                Turn all reminders off
              </Text>
            ) : null}
          </Glass>
        </FadeIn>
        {note ? <Notice tone="warn">{note}</Notice> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
