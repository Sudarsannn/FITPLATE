import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Stat, styles as ui } from '../components/ui';
import { costToMake, costToOrder, dishes } from '../data/dishes';
import { useSession } from '../lib/session';
import { colors } from '../theme';

export default function Home() {
  const { user, stats, signOut } = useSession();
  const [query, setQuery] = useState('');
  if (!user) return <Redirect href="/" />;

  const q = query.trim().toLowerCase();
  const results = dishes.filter((d) => !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        data={results}
        keyExtractor={(d) => d.id}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.hello}>Hi {user.name} 👋</Text>
              <Pressable onPress={signOut}>
                <Text style={ui.muted}>Sign out</Text>
              </Pressable>
            </View>
            <Card style={{ marginTop: 12 }}>
              <Text style={[ui.muted, { marginBottom: 12 }]}>Your progress</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Stat label="Money saved" value={`₹${stats.moneySaved.toLocaleString('en-IN')}`} hint={`${stats.mealsCooked} meals cooked`} />
                <Stat label="Calories in today" value={`${stats.kcalIn}`} />
                <Stat label="Calories burnt" value={`${stats.kcalBurnt}`} />
              </View>
            </Card>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search any dish… (try biryani)"
              placeholderTextColor={colors.muted}
              style={styles.search}
            />
            <Text style={ui.section}>{q ? 'Results' : 'Cook something today'}</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={ui.muted}>
            That dish isn’t in the demo yet. The full app will have every dish; for now try poha, oats, bhurji, paneer or
            biryani.
          </Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const save = costToOrder(item, item.baseServings) - costToMake(item, item.baseServings);
          return (
            <Link href={{ pathname: '/dish/[id]', params: { id: item.id } }} asChild>
              <Pressable>
                <Card style={styles.row}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dishName}>{item.name}</Text>
                    <Text style={ui.muted}>
                      {item.kcal} kcal · {item.timeMins} min · {item.difficulty}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.save}>Save ₹{save}</Text>
                    <Text style={ui.muted}>vs ordering</Text>
                  </View>
                </Card>
              </Pressable>
            </Link>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { color: colors.text, fontSize: 26, fontWeight: '800' },
  search: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 36 },
  dishName: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 2 },
  save: { color: colors.accent, fontWeight: '800', fontSize: 15 },
});
