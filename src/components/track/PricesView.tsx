import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { researchIngredients } from '../../data/research';
import { useResearchVersion } from '../../lib/useResearch';
import { priceRows, priceSummary, PRICE_NOTE, VERDICT_TEXT, type PriceFilter, type PriceRow, type PriceSort } from '../../services/trends';
import { colors, radius, type } from '../../theme';
import { LineChart } from '../charts';
import { Chip, FadeIn, Glass, PressableScale } from '../ui';

const SORTS: { key: PriceSort; label: string }[] = [
  { key: 'biggest-change', label: 'Biggest change' },
  { key: 'cheaper-first', label: 'Falling first' },
  { key: 'dearer-first', label: 'Rising first' },
  { key: 'name', label: 'Name' },
];
const FILTERS: { key: PriceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cheaper', label: 'Cheaper than usual' },
  { key: 'dearer', label: 'Dearer than usual' },
  { key: 'usual', label: 'About usual' },
];

const verdictColor = (r: PriceRow) => (r.verdict === 'cheaper' ? colors.accent : r.verdict === 'dearer' ? colors.warn : colors.muted);
const dateLabel = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Day 29: ingredient price trends over the dates the research recorded them. Estimates, not live shop prices. */
export function PricesView() {
  useResearchVersion();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<PriceSort>('biggest-change');
  const [filter, setFilter] = useState<PriceFilter>('all');
  const [open, setOpen] = useState<string | null>(null);
  const summary = useMemo(() => priceSummary(researchIngredients), []);
  const rows = useMemo(() => priceRows(researchIngredients, { query, sort, filter }), [query, sort, filter]);

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <FadeIn i={0}>
        <Text style={[type.h1, { color: colors.text }]}>Prices</Text>
        <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>How ingredient prices have moved between research dates.</Text>
      </FadeIn>

      <FadeIn i={1}>
        <Glass style={{ marginTop: 16 }}>
          {summary.withTrend === 0 ? (
            <Text style={[type.small, { color: colors.muted }]}>Price research has only one date so far, so there is no trend to show yet. It will appear after the next research dates.</Text>
          ) : (
            <>
              <View style={{ flexDirection: 'row' }}>
                <Big value={summary.cheaper} label="cheaper than usual" color={colors.accent} />
                <Big value={summary.dearer} label="dearer than usual" color={colors.warn} />
                <Big value={summary.withTrend} label="with a trend" />
              </View>
              {summary.biggestDrop ? (
                <Text style={{ color: colors.text, marginTop: 12 }}>
                  Biggest drop: {summary.biggestDrop.name}, {summary.biggestDrop.changePct}% since {dateLabel(summary.biggestDrop.points[0].date)}.
                </Text>
              ) : null}
              {summary.biggestRise ? (
                <Text style={{ color: colors.text, marginTop: 6 }}>
                  Biggest rise: {summary.biggestRise.name}, +{summary.biggestRise.changePct}% since {dateLabel(summary.biggestRise.points[0].date)}.
                </Text>
              ) : null}
              <Text style={[type.small, { color: colors.faint, marginTop: 10 }]}>{summary.oneReading} more ingredients have a single price reading and are not shown yet.</Text>
            </>
          )}
        </Glass>
      </FadeIn>

      <FadeIn i={2}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search an ingredient" placeholderTextColor={colors.faint} style={styles.input} accessibilityLabel="Search ingredient prices" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10 }}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
          {SORTS.map((x) => (
            <Chip key={x.key} label={x.label} active={sort === x.key} onPress={() => setSort(x.key)} />
          ))}
        </ScrollView>
      </FadeIn>

      <View style={{ marginTop: 14, gap: 10 }}>
        {rows.length === 0 ? (
          <Glass>
            <Text style={[type.small, { color: colors.muted }]}>{query || filter !== 'all' ? 'No ingredient matches these filters. Clear the search or pick All.' : 'No price trends yet.'}</Text>
          </Glass>
        ) : (
          rows.map((r) => {
            const on = open === r.id;
            return (
              <PressableScale key={r.id} onPress={() => setOpen(on ? null : r.id)} scaleTo={0.99} accessibilityLabel={`${r.name} price trend`}>
                <Glass>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{r.name}</Text>
                      <Text style={[type.small, { color: verdictColor(r) }]}>{VERDICT_TEXT[r.verdict]}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>{rupee(r.latest)}</Text>
                      <Text style={[type.small, { color: colors.muted }]}>{r.unit.replace('₹ ', '')}</Text>
                    </View>
                    <View style={{ width: 54, alignItems: 'flex-end' }}>
                      <Text style={{ color: (r.changePct ?? 0) < 0 ? colors.accent : (r.changePct ?? 0) > 0 ? colors.warn : colors.muted, fontWeight: '900' }}>{r.changePct == null ? '' : `${r.changePct > 0 ? '+' : ''}${r.changePct}%`}</Text>
                    </View>
                  </View>
                  {on ? (
                    <View style={{ marginTop: 12 }}>
                      <LineChart values={r.points.map((p) => p.avg)} color={verdictColor(r) === colors.muted ? colors.blue : verdictColor(r)} summary={`${r.name} price over ${r.points.length} research dates`} />
                      {r.points.map((p) => (
                        <View key={p.date} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                          <Text style={[type.small, { color: colors.muted }]}>{dateLabel(p.date)}</Text>
                          <Text style={[type.small, { color: colors.text }]}>
                            {rupee(p.avg)} (range {rupee(p.min)} to {rupee(p.max)})
                          </Text>
                        </View>
                      ))}
                      <Text style={[type.small, { color: colors.faint, marginTop: 8 }]}>
                        {r.seasonal ? 'Seasonal produce: prices swing with the harvest and the monsoon. ' : ''}
                        {r.stale ? 'The newest reading is getting old. ' : ''}
                        Compared with its own earlier readings, not with other shops.
                      </Text>
                    </View>
                  ) : null}
                </Glass>
              </PressableScale>
            );
          })
        )}
      </View>
      <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 16 }]}>{PRICE_NOTE}</Text>
    </ScrollView>
  );
}

function Big({ value, label, color = colors.text }: { value: number; label: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color, fontSize: 24, fontWeight: '900' }}>{value}</Text>
      <Text style={[type.small, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { marginTop: 14, minHeight: 46, borderRadius: radius.pill, paddingHorizontal: 16, color: colors.text, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
});
