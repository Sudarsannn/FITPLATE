import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MUSIC_MOODS, MUSIC_SERVICES, type MusicKind } from '../services/music';
import { openExternal } from '../services/vendors/openApp';
import { colors, radius } from '../theme';
import { Chip, PressableScale } from './ui';

/**
 * A "Music" pill that opens a small panel: pick a mood, then the service. It
 * opens a playlist search in that service, so your own music app keeps playing
 * while you cook or work out.
 */
export function MusicPanel({ kind }: { kind: MusicKind }) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(MUSIC_MOODS[kind][0].id);
  const query = MUSIC_MOODS[kind].find((m) => m.id === mood)!.query;
  return (
    <View>
      <PressableScale onPress={() => setOpen((v) => !v)} style={styles.pill} scaleTo={0.96} accessibilityLabel={open ? 'Hide music' : kind === 'cooking' ? 'Cooking music' : 'Workout music'}>
        <Ionicons name="musical-notes" size={15} color={colors.violet} />
        <Text style={styles.pillText}>{kind === 'cooking' ? 'Cooking music' : 'Workout music'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeInDown.duration(220)} style={styles.panel}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MUSIC_MOODS[kind].map((m) => (
              <Chip key={m.id} label={m.label} active={m.id === mood} onPress={() => setMood(m.id)} />
            ))}
          </View>
          <View style={styles.services}>
            {MUSIC_SERVICES.map((s) => (
              <PressableScale key={s.id} onPress={() => openExternal(s.url(query))} style={styles.service} scaleTo={0.95} accessibilityLabel={`Open ${s.label}`}>
                <Text style={styles.serviceText}>{s.label}</Text>
              </PressableScale>
            ))}
          </View>
          <Text style={styles.note}>Opens your music app with a playlist search. FitPlate plays no music itself, so your music keeps going while you use the steps.</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: 'rgba(167,139,250,0.12)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.35)' },
  pillText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  panel: { marginTop: 10, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 12 },
  services: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  service: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.accent },
  serviceText: { color: '#06210F', fontWeight: '900', fontSize: 13 },
  note: { color: colors.faint, fontSize: 11.5, lineHeight: 16 },
});
