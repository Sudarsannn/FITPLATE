import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '../components/ui';
import { researchDishes } from '../data/research';
import { dishImageCredits, dishImageFiles } from '../data/research/dish-images';
import { creditLine } from '../services/data/dishImageCandidates';
import { colors, radius, type } from '../theme';

/** Every bundled dish photo with its author, licence and source (SPEC-ADDENDA §10). */
export default function PhotoCreditsScreen() {
  const rows = researchDishes.filter((d) => dishImageFiles[d.id] && dishImageCredits[d.id]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/cook'));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={back} style={styles.back} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text style={[type.h2, { color: colors.text }]} accessibilityRole="header">
          Photo credits
        </Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Dish photos are free-licence images by the people named below. Tap one to open its source page. Dishes without a photo show a placeholder until a licensed photo is found.
          </Text>
        }
        renderItem={({ item }) => {
          const c = dishImageCredits[item.id];
          return (
            <Pressable style={styles.row} onPress={() => Linking.openURL(c.pageUrl)} accessibilityRole="link" accessibilityLabel={`${item.name}. ${creditLine(c)}`}>
              <Image source={dishImageFiles[item.id]} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.credit}>{creditLine(c)}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.intro}>No dish photos yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 6 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { color: colors.muted, marginBottom: 12, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  thumb: { width: 56, height: 56, borderRadius: radius.md },
  name: { color: colors.text, fontWeight: '700' },
  credit: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
