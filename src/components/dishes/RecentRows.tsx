import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getDish } from '../../data/research';
import { useStore } from '../../lib/store';
import { cookAgainIds, loadRecent } from '../../services/recentDishes';
import { colors, radius, type } from '../../theme';
import { PressableScale } from '../ui';

/** "Cook again" and "Recently viewed" chips above the Cook list (flag `recentDishes`). Hidden until there is something to show. */
export function RecentRows() {
  const { days } = useStore();
  const [viewed, setViewed] = useState<string[]>([]);
  useEffect(() => {
    loadRecent().then(setViewed);
  }, []);
  const again = useMemo(() => cookAgainIds(days, 8).filter((id) => getDish(id)), [days]);
  const recent = useMemo(() => viewed.filter((id) => getDish(id) && !again.includes(id)).slice(0, 8), [viewed, again]);
  return (
    <View>
      <Row title="Cook again" ids={again} />
      <Row title="Recently viewed" ids={recent} />
    </View>
  );
}

function Row({ title, ids }: { title: string; ids: string[] }) {
  if (!ids.length) return null;
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={[type.label, { color: colors.muted }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
        {ids.map((id) => (
          <PressableScale key={id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id } })} style={styles.chip} scaleTo={0.96} accessibilityLabel={`Open ${getDish(id)?.name}`}>
            <Text style={styles.text} numberOfLines={1}>
              {getDish(id)?.name}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { maxWidth: 220, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  text: { color: colors.text, fontWeight: '700', fontSize: 13 },
});
