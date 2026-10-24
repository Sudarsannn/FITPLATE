import { Ionicons } from '@expo/vector-icons';
import { createElement, useMemo, useRef, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { addDays, dayKey, useStore } from '../lib/store';
import { cookedDays, currentStreak, longestStreak, MONTHS_BACK, monthGrid } from '../services/streaks';
import { colors, radius } from '../theme';
import { PressableScale } from './ui';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * The flame by the profile photo: "N day streak" of days with at least one home-cooked meal.
 * On the web, hovering shows the month calendar below the button and clicking keeps it open.
 * On a phone a tap opens it. The calendar goes back six months; streak days carry a flame.
 */
export function StreakButton() {
  const { days } = useStore();
  const cooked = useMemo(() => cookedDays(days), [days]);
  const todayKey = dayKey();
  const streak = currentStreak(cooked, todayKey);
  const best = longestStreak(cooked);
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const [anchor, setAnchor] = useState({ top: 90, right: 16 });
  const ref = useRef<View>(null);
  const web = Platform.OS === 'web';

  const label = streak === 0 ? 'Start a streak' : `${streak} day streak`;
  const open = pinned || (web && hover);

  const toggle = () => {
    if (!web && !pinned) {
      ref.current?.measureInWindow((x, y, w, h) => setAnchor({ top: y + h + 8, right: 16 }));
    }
    setPinned(!pinned);
  };

  const button = (
    <View ref={ref} collapsable={false}>
      <PressableScale onPress={toggle} style={[styles.pill, open && styles.pillOn]} scaleTo={0.96} accessibilityLabel={`${label}. Show your cooking calendar`}>
        <Ionicons name="flame" size={16} color={colors.warm} />
        <Text style={styles.pillText}>{label}</Text>
      </PressableScale>
    </View>
  );

  const card = <StreakCalendar cooked={cooked} todayKey={todayKey} streak={streak} best={best} pinned={pinned} />;

  if (web) {
    return (
      <Hover onChange={setHover}>
        {button}
        {open ? (
          <View style={styles.popWeb}>
            {card}
          </View>
        ) : null}
        {pinned ? (
          <Pressable onPress={() => setPinned(false)} style={styles.scrimWeb} accessibilityLabel="Close the calendar" />
        ) : null}
      </Hover>
    );
  }
  return (
    <>
      {button}
      <Modal visible={pinned} transparent animationType="fade" onRequestClose={() => setPinned(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setPinned(false)} accessibilityLabel="Close the calendar" />
        <View style={[styles.popNative, { top: anchor.top, right: anchor.right }]}>{card}</View>
      </Modal>
    </>
  );
}

/** Web only: a wrapper that tells us when the pointer is over the button or the calendar. */
function Hover({ onChange, children }: { onChange: (h: boolean) => void; children: ReactNode }) {
  return createElement('div', { style: { position: 'relative', zIndex: 50 }, onMouseEnter: () => onChange(true), onMouseLeave: () => onChange(false) }, children);
}

export function StreakCalendar({ cooked, todayKey, streak, best, pinned }: { cooked: ReadonlySet<string>; todayKey: string; streak: number; best: number; pinned: boolean }) {
  const [offset, setOffset] = useState(0); // 0 = this month, -6 = six months back
  const base = addDays(new Date(), 0);
  const shown = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const grid = monthGrid(shown.getFullYear(), shown.getMonth(), cooked, todayKey);
  const cookedThisMonth = grid.flat().filter((c) => c && c.state !== 'none').length;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <PressableScale onPress={() => setOffset(Math.max(-MONTHS_BACK, offset - 1))} style={[styles.nav, offset <= -MONTHS_BACK && { opacity: 0.3 }]} scaleTo={0.9} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </PressableScale>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.month}>
            {MONTH[shown.getMonth()]} {shown.getFullYear()}
          </Text>
          <Text style={styles.sub}>{cookedThisMonth} {cookedThisMonth === 1 ? 'day' : 'days'} cooked at home</Text>
        </View>
        <PressableScale onPress={() => setOffset(Math.min(0, offset + 1))} style={[styles.nav, offset >= 0 && { opacity: 0.3 }]} scaleTo={0.9} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </PressableScale>
      </View>
      <View style={styles.row}>
        {WEEK.map((w, i) => (
          <Text key={i} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {grid.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((c, ci) => (
            <View key={ci} style={styles.cell}>
              {c ? (
                <View style={[styles.day, c.today && styles.dayToday, c.state === 'streak' && styles.dayStreak, c.state === 'cooked' && styles.dayCooked]}>
                  {c.state === 'streak' ? (
                    <Ionicons name="flame" size={17} color={colors.warm} />
                  ) : c.state === 'cooked' ? (
                    <Ionicons name="checkmark" size={16} color={colors.accent} />
                  ) : (
                    <Text style={[styles.dayNum, c.future && { opacity: 0.35 }]}>{c.day}</Text>
                  )}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ))}
      <View style={styles.legend}>
        <Ionicons name="flame" size={14} color={colors.warm} />
        <Text style={styles.legendText}>streak</Text>
        <Ionicons name="checkmark" size={14} color={colors.accent} />
        <Text style={styles.legendText}>cooked at home</Text>
      </View>
      <Text style={styles.foot}>
        Now {streak} {streak === 1 ? 'day' : 'days'} · best {best} {best === 1 ? 'day' : 'days'}
      </Text>
      <Text style={styles.hint}>{Platform.OS === 'web' ? (pinned ? 'Click outside to close.' : 'Click the button to keep this open.') : 'Tap outside to close.'} Goes back 6 months.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,138,61,0.15)', borderWidth: 1, borderColor: 'rgba(255,138,61,0.35)' },
  pillOn: { backgroundColor: 'rgba(255,138,61,0.25)' },
  pillText: { color: colors.warm, fontWeight: '900', fontSize: 14 },
  popWeb: { position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 300, zIndex: 60 },
  scrimWeb: { position: 'fixed' as 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
  popNative: { position: 'absolute', width: 300 },
  card: { padding: 14, borderRadius: radius.lg, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  nav: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  month: { color: colors.text, fontWeight: '900', fontSize: 15 },
  sub: { color: colors.muted, fontSize: 11.5, marginTop: 1 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: colors.faint, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  day: { width: '100%', height: '100%', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayToday: { borderWidth: 1.5, borderColor: colors.text },
  dayStreak: { backgroundColor: 'rgba(255,138,61,0.16)' },
  dayCooked: { backgroundColor: 'rgba(61,220,132,0.14)' },
  dayNum: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  legendText: { color: colors.muted, fontSize: 11.5, marginRight: 8 },
  foot: { color: colors.text, fontWeight: '800', fontSize: 13, marginTop: 8 },
  hint: { color: colors.faint, fontSize: 11, marginTop: 4 },
});
