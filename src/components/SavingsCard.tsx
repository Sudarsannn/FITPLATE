import { Text, View } from 'react-native';

import { featureFlags } from '../config/featureFlags';
import { getDish } from '../data/research';
import { useStore } from '../lib/store';
import { savingsSummary, type SavingsPeriod } from '../services/savings';
import { colors, type } from '../theme';
import { IconBadge } from './Icon';
import { Glass } from './ui';

const money = (n: number) => (n < 0 ? `-₹${-n}` : `₹${n}`);

function Col({ label, p }: { label: string; p: SavingsPeriod }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[type.label, { color: colors.muted }]}>{label}</Text>
      <Text style={{ color: p.moneyInr < 0 ? colors.bad : colors.warn, fontSize: 22, fontWeight: '900', marginTop: 2 }}>{p.counted ? money(p.moneyInr) : '—'}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{p.kcalLess != null ? `${p.kcalLess >= 0 ? '' : '+'}${Math.abs(p.kcalLess)} kcal ${p.kcalLess >= 0 ? 'lighter' : 'more'}` : 'no kcal data'}</Text>
    </View>
  );
}

/** Progress: money saved against ordering, and calories against the restaurant version, for today, 7 days and this month (flag `savingsDashboard`). */
export function SavingsCard() {
  const { days } = useStore();
  if (!featureFlags.savingsDashboard) return null;
  const s = savingsSummary(days, (id) => getDish(id));
  const unpriced = s.month.unpriced;
  return (
    <Glass style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBadge name="cash-outline" color={colors.warn} size={40} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={[type.h2, { color: colors.text }]}>Saved by cooking</Text>
          <Text style={[type.small, { color: colors.muted }]}>Order price minus ingredient cost, for meals you cooked.</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Col label="TODAY" p={s.today} />
        <Col label="7 DAYS" p={s.week} />
        <Col label="THIS MONTH" p={s.month} />
      </View>
      {unpriced ? <Text style={[type.small, { color: colors.faint, marginTop: 10 }]}>{unpriced} cooked meal{unpriced > 1 ? 's' : ''} this month left out: a price is not confirmed yet.</Text> : null}
    </Glass>
  );
}
