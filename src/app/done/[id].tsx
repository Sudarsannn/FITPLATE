import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, SectionTitle, Stat, styles as ui } from '../../components/ui';
import { costToMake, costToOrder, getDish, kmToBurn } from '../../data/dishes';
import { useSession } from '../../lib/session';
import { colors } from '../../theme';

export default function DoneScreen() {
  const { id, servings: s } = useLocalSearchParams<{ id: string; servings?: string }>();
  const dish = getDish(id);
  const servings = Number(s) || dish?.baseServings || 2;
  const { logMeal } = useSession();
  const logged = useRef(false);

  const saved = dish ? costToOrder(dish, servings) - costToMake(dish, servings) : 0;
  const kcalSaved = dish ? dish.restaurantKcal - dish.kcal : 0;

  useEffect(() => {
    if (!dish || logged.current) return;
    logged.current = true;
    logMeal(saved, dish.kcal);
  }, [dish, saved, logMeal]);

  if (!dish) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text style={styles.big}>{dish.emoji}</Text>
        <Text style={styles.title}>You made {dish.name}!</Text>

        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            <Stat label="saved vs ordering" value={`₹${saved}`} />
            <Stat label="kcal per plate" value={`${dish.kcal}`} hint={`${kcalSaved} fewer than restaurant`} />
            <Stat label="to burn it off" value={`${kmToBurn(dish.kcal)} km`} hint="running" />
          </View>
        </Card>

        <SectionTitle>Eating it</SectionTitle>
        <Text style={ui.body}>{dish.finish.eat}</Text>
        <SectionTitle>Storing leftovers</SectionTitle>
        <Text style={ui.body}>{dish.finish.store}</Text>
        <SectionTitle>Leftover remix</SectionTitle>
        <Text style={ui.body}>{dish.finish.remix}</Text>
        <SectionTitle>Make it even healthier next time</SectionTitle>
        <Text style={ui.body}>{dish.finish.healthier}</Text>

        <View style={{ marginTop: 28 }}>
          <Button title="Back to home" onPress={() => router.dismissTo('/home')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  big: { fontSize: 72, textAlign: 'center', marginTop: 16 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 8 },
});
