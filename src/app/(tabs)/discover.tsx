import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { LinearTransition, FadeIn as RFadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DishCardTall } from '../../components/DishCard';
import { Chip, DishArt, FadeIn, PressableScale } from '../../components/ui';
import { costToMake, costToOrder, dishes, type Dish } from '../../data/dishes';
import { useStore } from '../../lib/store';
import { colors, radius, type } from '../../theme';

const FILTERS: { label: string; test: (d: Dish, fav: string[]) => boolean }[] = [
  { label: 'All', test: () => true },
  { label: '❤️ Saved', test: (d, f) => f.includes(d.id) },
  { label: 'Breakfast', test: (d) => d.category === 'Breakfast' },
  { label: 'Under 20 min', test: (d) => d.timeMins <= 20 },
  { label: 'High protein', test: (d) => d.tags.includes('high-protein') },
  { label: 'Veg', test: (d) => d.diet === 'veg' },
  { label: 'Prep night before', test: (d) => d.tags.includes('night-before') },
  { label: 'Batch cook', test: (d) => d.tags.includes('batch-cook') },
];

export default function Discover() {
  const { favourites } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState(0);
  const { width } = useWindowDimensions();
  const col = (Math.min(width, 520) - 18 * 2 - 14) / 2;

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return dishes.filter(
      (d) =>
        FILTERS[f].test(d, favourites) &&
        (!query || d.name.toLowerCase().includes(query) || d.ingredients.some((i) => i.name.toLowerCase().includes(query))),
    );
  }, [q, f, favourites]);

  const featured = dishes[new Date().getDate() % dishes.length];
  const fSave = costToOrder(featured, 2) - costToMake(featured, 2);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 140 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FadeIn i={0}>
          <Text style={[type.h1, { color: colors.text }]}>Discover</Text>
          <Text style={[type.small, { color: colors.muted, marginTop: 2 }]}>Search any dish or ingredient you have at home.</Text>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Biryani, paneer, oats…"
              placeholderTextColor={colors.faint}
              style={styles.input}
              returnKeyType="search"
            />
            {q ? (
              <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setQ('')} />
            ) : null}
          </View>
        </FadeIn>

        <FadeIn i={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
            {FILTERS.map((x, i) => (
              <Chip key={x.label} label={x.label} active={f === i} onPress={() => setF(i)} />
            ))}
          </ScrollView>
        </FadeIn>

        {!q && f === 0 ? (
          <FadeIn i={2}>
            <PressableScale scaleTo={0.98} onPress={() => router.push({ pathname: '/dish/[id]', params: { id: featured.id } })} style={{ marginTop: 18 }}>
              <View style={styles.feature}>
                <DishArt emoji={featured.emoji} palette={featured.palette} size={'100%'} rounded={radius.lg} style={StyleSheet.absoluteFill} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
                <View style={styles.featureTag}>
                  <Text style={styles.featureTagText}>✨ DISH OF THE DAY</Text>
                </View>
                <View style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
                  <Text style={styles.featureName}>{featured.name}</Text>
                  <Text style={styles.featureSub}>
                    {featured.kcal} kcal · {featured.timeMins} min · save ₹{fSave} vs ordering
                  </Text>
                </View>
              </View>
            </PressableScale>
          </FadeIn>
        ) : null}

        <Text style={[type.label, { color: colors.muted, marginTop: 22, marginBottom: 12 }]}>
          {results.length} {results.length === 1 ? 'dish' : 'dishes'}
        </Text>

        <Animated.View layout={LinearTransition.springify().damping(18)} style={styles.grid}>
          {results.map((d) => (
            <Animated.View key={d.id} entering={RFadeIn.duration(300)} exiting={FadeOut.duration(150)} layout={LinearTransition.springify().damping(18)} style={{ width: col, marginBottom: 18 }}>
              <DishCardTall dish={d} width={col} />
            </Animated.View>
          ))}
        </Animated.View>

        {results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🍳</Text>
            <Text style={[type.h2, { color: colors.text, marginTop: 8 }]}>Not in the demo yet</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>
              The full app aims for every dish there is. Missing dishes will be generated on request.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 13 },
  feature: { height: 220, borderRadius: radius.lg, overflow: 'hidden' },
  featureTag: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  featureTagText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  featureName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  featureSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  empty: { alignItems: 'center', padding: 30 },
});
