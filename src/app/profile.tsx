import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import type { Diet } from '../data/dishes';
import { setReminders } from '../lib/reminders';
import { GOALS, useStore, type Goal, type Level } from '../lib/store';
import { colors, type } from '../theme';

export default function Profile() {
  const { profile, updateProfile, signOut, resetDemo, user, favourites } = useStore();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text style={[type.h2, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        <FadeIn i={0}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <View style={styles.avatar}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} referrerPolicy="no-referrer" style={{ width: 78, height: 78, borderRadius: 39 }} />
              ) : (
                <Text style={{ color: colors.text, fontSize: 34, fontWeight: '900' }}>{(profile.name || 'F')[0].toUpperCase()}</Text>
              )}
            </View>
            <Text style={[type.h1, { color: colors.text, marginTop: 10 }]}>{profile.name || 'Guest'}</Text>
            <Text style={{ color: colors.muted }}>
              {user?.guest ? 'Demo mode · not signed in' : user?.email ? `Signed in with Google · ${user.email}` : 'Signed in with Google'}
            </Text>
          </View>
        </FadeIn>

        <FadeIn i={1}>
          <Glass>
            <Text style={styles.label}>Goal</Text>
            <View style={styles.chips}>
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <Chip key={g} label={`${GOALS[g].emoji} ${GOALS[g].label}`} active={profile.goal === g} onPress={() => updateProfile({ goal: g })} />
              ))}
            </View>
            <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>
              Target {GOALS[profile.goal].kcal} kcal and {GOALS[profile.goal].protein} g protein a day.
            </Text>
            <Text style={[styles.label, { marginTop: 18 }]}>Diet</Text>
            <View style={styles.chips}>
              {([['veg', '🥦 Veg'], ['egg', '🥚 Egg'], ['non-veg', '🍗 Non-veg']] as [Diet, string][]).map(([d, l]) => (
                <Chip key={d} label={l} active={profile.diet === d} onPress={() => updateProfile({ diet: d })} />
              ))}
            </View>
            <Text style={[styles.label, { marginTop: 18 }]}>Cooking level</Text>
            <View style={styles.chips}>
              {([['beginner', '🌱 Beginner'], ['expert', '👨‍🍳 Expert']] as [Level, string][]).map(([d, l]) => (
                <Chip key={d} label={l} active={profile.level === d} onPress={() => updateProfile({ level: d })} />
              ))}
            </View>
          </Glass>
        </FadeIn>

        <FadeIn i={2}>
          <Glass style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 26 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>Breakfast & batch-cook nudges</Text>
              <Text style={[type.small, { color: colors.muted }]}>9 pm prep reminder, Sunday batch-cook reminder</Text>
            </View>
            <Switch
              value={profile.breakfastReminder}
              onValueChange={(v) => {
                updateProfile({ breakfastReminder: v });
                setReminders(v).catch(() => {});
              }}
              trackColor={{ true: colors.accent, false: '#333' }}
              thumbColor="#fff"
            />
          </Glass>
        </FadeIn>

        <FadeIn i={3}>
          <Glass style={{ marginTop: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>❤️ {favourites.length} saved dishes</Text>
            <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>Find them under Discover → Saved.</Text>
          </Glass>
        </FadeIn>

        <View style={{ gap: 10, marginTop: 24 }}>
          <GradientButton
            title="Reset demo data"
            variant="glass"
            onPress={() =>
              Alert.alert('Reset demo data?', 'This restores the sample week and clears your logs.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: resetDemo },
              ])
            }
          />
          <GradientButton
            title="Sign out"
            variant="glass"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </View>
        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          FitPlate demo · nutrition and prices are estimates, not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.accent },
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
