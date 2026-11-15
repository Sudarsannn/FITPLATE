import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { isEnabled } from '../config/featureFlags';
import { useStore } from '../lib/store';
import { useTargets } from '../lib/useTargets';
import { DOCTOR_LINE } from '../services/healthLimits';
import { activityLine, netEnergy, weeklyActivity, WEEKLY_ACTIVE_MIN_GUIDE } from '../services/burnBalance';
import { colors, radius, type } from '../theme';
import { Bar, Glass, PressableScale } from './ui';

const LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Seven days of movement and the weekly guide. No guide for people whose conditions need a doctor's advice. */
export function ActivityWeekCard({ margin = 14 }: { margin?: number }) {
  const { days } = useStore();
  const { health } = useTargets();
  if (!isEnabled('burnBalance')) return null;
  const w = weeklyActivity(days);
  const guide = !health.needsDoctor;
  const maxMin = Math.max(30, ...w.days.map((d) => d.minutes));
  const net = w.avgNet == null ? null : netEnergy(w.avgNet, 0);
  return (
    <PressableScale onPress={() => router.push('/move')} scaleTo={0.98} accessibilityLabel="Activity this week. Open Move">
      <Glass style={{ marginTop: margin }}>
        <View style={s.top}>
          <Text style={[type.h2, { color: colors.text }]}>Activity this week</Text>
          <Text style={[type.small, { color: colors.muted }]}>{w.kcalOut.toLocaleString('en-IN')} kcal burnt</Text>
        </View>
        <View style={s.bars}>
          {w.days.map((d, i) => {
            const idx = new Date(d.key + 'T00:00:00').getDay();
            return (
              <View key={d.key} style={s.col}>
                <View style={s.track}>
                  <View style={[s.fill, { height: `${(d.minutes / maxMin) * 100}%`, opacity: d.minutes ? 1 : 0 }]} />
                </View>
                <Text style={[s.letter, i === 6 && { color: colors.text }]}>{LETTER[idx]}</Text>
              </View>
            );
          })}
        </View>
        {guide ? (
          <View style={{ marginTop: 12 }}>
            <Bar progress={w.guidePct} color={colors.warm} />
            <Text style={s.guide}>
              {w.minutes} of {WEEKLY_ACTIVE_MIN_GUIDE} min guide
            </Text>
          </View>
        ) : (
          <Text style={s.guide}>{DOCTOR_LINE} on how much to do.</Text>
        )}
        <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>{activityLine(w, guide)}</Text>
        {net ? (
          <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>
            Eaten minus burnt, a typical logged day: {net.net.toLocaleString('en-IN')} kcal.
          </Text>
        ) : null}
      </Glass>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  bars: { flexDirection: 'row', gap: 8, height: 70, marginTop: 12 },
  col: { flex: 1, alignItems: 'center' },
  track: { flex: 1, width: '100%', borderRadius: 6, backgroundColor: colors.card, justifyContent: 'flex-end', overflow: 'hidden', minHeight: 4 },
  fill: { width: '100%', borderRadius: 6, backgroundColor: colors.warm, minHeight: 4 },
  letter: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  guide: { color: colors.muted, fontSize: 12, marginTop: 6, fontWeight: '600', borderRadius: radius.sm },
});
