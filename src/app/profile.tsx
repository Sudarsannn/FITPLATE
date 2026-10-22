import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDeleteData } from '../components/ConfirmDeleteData';
import { Chip, FadeIn, Glass, GradientButton, PressableScale } from '../components/ui';
import { setReminders } from '../lib/reminders';
import { GOALS, useStore, type Diet, type Goal, type Level } from '../lib/store';
import { syncStatusLine } from '../services/userSession';
import { colors, type } from '../theme';

// `asTab` is set by the Profile tab of the new shell: no back button, and room
// at the bottom for the floating tab bar.
export function ProfileScreen({ asTab = false }: { asTab?: boolean }) {
  const { profile, updateProfile, sex, setSex, signOut, deleteMyData, resetDemo, user, favourites, cloud, syncError } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canDelete = Boolean(user && !user.guest && cloud);
  return (
    <SafeAreaView edges={asTab ? ['top'] : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        {asTab ? (
          <View style={{ width: 40 }} />
        ) : (
          <PressableScale onPress={() => router.back()} style={styles.back} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </PressableScale>
        )}
        <Text style={[type.h2, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: asTab ? 150 : 60 }}>
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
            <Text style={[type.small, styles.sync, { color: cloud && syncError ? colors.warn : colors.muted }]} accessibilityRole="text">
              {syncStatusLine(Boolean(user && !user.guest), cloud, syncError)}
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
            <Text style={[styles.label, { marginTop: 18 }]}>Vitamin and mineral targets for</Text>
            <View style={styles.chips}>
              {([['female', 'Women'], ['male', 'Men']] as const).map(([d, l]) => (
                <Chip key={d} label={l} active={sex === d} onPress={() => setSex(d)} />
              ))}
            </View>
            <Text style={[type.small, { color: colors.muted, marginTop: 6 }]}>ICMR-NIN sets some daily targets differently for adult women and men. Men&apos;s targets are used until you choose.</Text>
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
            <Text style={[type.small, { color: colors.muted, marginTop: 4 }]}>Find them under Cook → Saved.</Text>
          </Glass>
        </FadeIn>

        <FadeIn i={4}>
          <PressableScale onPress={() => router.push('/basket')} accessibilityLabel="Your shopping lists" style={{ marginTop: 14 }}>
            <Glass style={styles.linkRow}>
              <Text style={{ fontSize: 24 }}>🛒</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Shopping lists</Text>
                <Text style={[type.small, { color: colors.muted }]}>Grocery apps arrive with the phone app</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Glass>
          </PressableScale>
          <PressableScale onPress={() => router.push('/your-data')} accessibilityLabel="Your data: what we save and where" style={{ marginTop: 14 }}>
            <Glass style={styles.linkRow}>
              <Text style={{ fontSize: 24 }}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>Your data</Text>
                <Text style={[type.small, { color: colors.muted }]}>What we save, where it lives, and your choices</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Glass>
          </PressableScale>
        </FadeIn>

        <View style={{ gap: 10, marginTop: 24 }}>
          {/* Only guests can restore the sample week; a real account never gets sample data. */}
          {user?.guest ? (
            <GradientButton
              title="Reset demo data"
              variant="glass"
              onPress={() =>
                Alert.alert('Reset demo data?', 'This restores the sample week and clears your logs on this device.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: resetDemo },
                ])
              }
            />
          ) : null}
          <GradientButton
            title="Sign out"
            variant="glass"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
          {canDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete my data"
              accessibilityHint="Permanently deletes everything FitPlate saved for your account"
              onPress={() => setConfirmDelete(true)}
              style={({ pressed }) => [styles.danger, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.bad} />
              <Text style={styles.dangerText}>Delete my data</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={[type.small, { color: colors.faint, textAlign: 'center', marginTop: 20 }]}>
          FitPlate demo · nutrition and prices are estimates, not medical advice.
        </Text>
      </ScrollView>
      <ConfirmDeleteData
        visible={confirmDelete}
        onConfirm={deleteMyData}
        onCancel={() => setConfirmDelete(false)}
        onDone={() => {
          setConfirmDelete(false);
          router.replace('/');
        }}
      />
    </SafeAreaView>
  );
}

export default function Profile() {
  return <ProfileScreen />;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.accent },
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  sync: { marginTop: 6, textAlign: 'center', paddingHorizontal: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.45)',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  dangerText: { color: colors.bad, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
