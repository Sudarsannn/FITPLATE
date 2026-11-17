import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { colors, type } from '../theme';

export type ChartPoint = { label: string; value: number | null };

/**
 * Plain column chart. A missing value draws nothing (a gap, not a zero). `goal` draws a dashed line.
 * `empty` is the sentence shown when no column has data, so a new account sees a clear message, not a blank box.
 */
export function ColumnChart({ points, color, goal, height = 120, empty, unit = '', summary }: { points: ChartPoint[]; color: string; goal?: number | null; height?: number; empty: string; unit?: string; summary: string }) {
  const present = points.filter((p) => p.value != null && p.value > 0);
  if (present.length === 0) return <EmptyChart text={empty} height={height} />;
  const max = Math.max(goal ?? 0, ...points.map((p) => p.value ?? 0)) * 1.1 || 1;
  return (
    <View accessible accessibilityLabel={summary}>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: points.length > 40 ? 1 : points.length > 14 ? 2 : 6 }}>
        {goal != null && goal > 0 ? <View pointerEvents="none" style={[s.goal, { bottom: `${(goal / max) * 100}%` }]} /> : null}
        {points.map((p, i) => (
          <View key={i} style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
            <View style={{ height: `${Math.max(p.value ? 3 : 0, ((p.value ?? 0) / max) * 100)}%`, backgroundColor: color, borderRadius: 4, opacity: p.value ? 1 : 0 }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: points.length > 40 ? 1 : points.length > 14 ? 2 : 6, marginTop: 6 }}>
        {points.map((p, i) => (
          <Text key={i} numberOfLines={1} style={[s.axis, { flex: 1, overflow: 'visible' }]}>
            {p.label}
          </Text>
        ))}
      </View>
      {goal != null && goal > 0 ? (
        <Text style={[type.small, { color: colors.faint, marginTop: 4 }]}>
          Dashed line: goal {Math.round(goal)}
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

/** A line over equally spaced readings, with a dot per reading. Needs two readings; one is shown as a single dot. */
export function LineChart({ values, color, width = 260, height = 70, summary }: { values: number[]; color: string; width?: number; height?: number; summary: string }) {
  if (values.length === 0) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pad = 6;
  const x = (i: number) => (values.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (values.length - 1));
  const y = (v: number) => height - pad - ((v - lo) / span) * (height - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <Svg width={width} height={height} accessibilityLabel={summary}>
      <Line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      {values.length > 1 ? <Polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" /> : null}
      {values.map((v, i) => (
        <Circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={color} />
      ))}
    </Svg>
  );
}

export function EmptyChart({ text, height = 90 }: { text: string; height?: number }) {
  return (
    <View style={[s.empty, { minHeight: height }]}>
      <Text style={[type.small, { color: colors.muted, textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  goal: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.3)' },
  axis: { color: colors.muted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
});
