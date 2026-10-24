import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme';
import { alpha, IconBadge } from './Icon';

/** A tinted card with an icon, a small label and a sentence: "You should see", "Watch out for", "Fun fact". */
export function GuideCard({ icon, tone, label, body }: { icon: keyof typeof Ionicons.glyphMap; tone: string; label: string; body: string }) {
  return (
    <View style={[styles.guide, { borderColor: alpha(tone, 0.4), backgroundColor: alpha(tone, 0.09) }]}>
      <IconBadge name={icon} color={tone} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: tone }]}>{label}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  guide: { flexDirection: 'row', gap: 12, marginTop: 14, padding: 14, borderRadius: radius.lg, borderWidth: 1 },
  label: { fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  body: { color: colors.text, fontSize: 15.5, lineHeight: 22, marginTop: 3 },
});
