import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export default function ServingsPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Cooking for</Text>
      <Pressable style={styles.btn} onPress={() => onChange(Math.max(1, value - 1))}>
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value}>
        {value} {value === 1 ? 'person' : 'people'}
      </Text>
      <Pressable style={styles.btn} onPress={() => onChange(Math.min(8, value + 1))}>
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { color: colors.muted, fontSize: 14, flex: 1 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  value: { color: colors.text, fontSize: 16, fontWeight: '700', minWidth: 80, textAlign: 'center' },
});
