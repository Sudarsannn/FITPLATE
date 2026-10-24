import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, Glass, PressableScale } from '../components/ui';
import { useStore } from '../lib/store';
import { IconBadge, type IconName } from '../components/Icon';
import { colors, type } from '../theme';

const SAVED: [IconName, string, string][] = [
  ['person-outline', 'Your profile', 'Name, goals, diet, cooking level, reminder setting and your survey answers (body details, eating habits, kitchen, training).'],
  ['medkit-outline', 'Health answers', 'Any health conditions you chose in the survey. Optional, private to your account, and never shared.'],
  ['restaurant-outline', 'Meals', 'What you ate or cooked, with its calories, protein and fibre.'],
  ['water-outline', 'Water', 'Glasses of water per day.'],
  ['barbell-outline', 'Workouts', 'Type of exercise, minutes and calories burned.'],
  ['heart-outline', 'Favourites', 'Dishes you saved.'],
  ['calendar-outline', 'Meal plans', 'Dishes you planned for each day.'],
  ['wallet-outline', 'Savings', 'Money saved by cooking instead of ordering.'],
];

function Section({ i, title, children }: { i: number; title: string; children: ReactNode }) {
  return (
    <FadeIn i={i}>
      <Glass style={{ marginTop: 14 }}>
        <Text style={styles.label} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </Glass>
    </FadeIn>
  );
}

function Point({ children }: { children: ReactNode }) {
  return (
    <View style={styles.point}>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function YourData() {
  const { user } = useStore();
  const signedIn = Boolean(user && !user.guest);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.top}>
        <PressableScale onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.back} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text style={[type.h2, { color: colors.text }]} accessibilityRole="header">
          Your data
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn i={0}>
          <Text style={styles.intro}>What FitPlate keeps about you, where it lives, and how to remove it. In plain words.</Text>
        </FadeIn>

        <Section i={1} title="What we save">
          <Text style={[styles.body, { marginBottom: 10 }]}>Only what you enter or tap in the app:</Text>
          {SAVED.map(([icon, name, what]) => (
            <View key={name} style={styles.row}>
              <IconBadge name={icon} size={34} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{name}</Text>
                <Text style={styles.small}>{what}</Text>
              </View>
            </View>
          ))}
          {signedIn ? (
            <Text style={[styles.small, { marginTop: 6 }]}>
              Signing in with Google also shares your name, email and photo with FitPlate. Firebase sign-in keeps them with your account.
            </Text>
          ) : null}
        </Section>

        <Section i={2} title="Where it’s saved">
          {signedIn ? (
            <>
              <Point>In your own private space in Google Firebase (Cloud Firestore), so it’s there on every device you sign in on.</Point>
              <Point>Stored in Google’s India region (Mumbai, asia-south1).</Point>
              <Point>Private to your account: Firebase access rules let only your signed-in account read or change it in the app. FitPlate’s owner can see stored data in the Firebase console to run the service.</Point>
              <Point>A copy stays on this device so the app works offline.</Point>
            </>
          ) : (
            <>
              <Point>Only on this device. Nothing is sent to the cloud while you use FitPlate without signing in.</Point>
              <Point>If you sign in later, we ask before copying anything into your account.</Point>
            </>
          )}
        </Section>

        <Section i={3} title="What is not personal">
          <Text style={styles.body}>
            Dishes, recipes, prices, nutrition facts and exercise info are the same for everyone. They ship inside the app and never include
            anything about you.
          </Text>
        </Section>

        <Section i={4} title="Your choices">
          <Point>
            <Text style={styles.strong}>Sign out</Text> removes your data from this device. Your account keeps it in the cloud.
          </Point>
          <Point>
            <Text style={styles.strong}>Delete my data</Text> (in Profile, when signed in) permanently removes everything we saved for your
            account, from the cloud and this device.
          </Point>
          <Point>Deleting your whole account and downloading a copy of your data are coming soon.</Point>
        </Section>

        <Text style={styles.foot}>General information about how this app handles your data, not legal advice.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 18, paddingBottom: 60, width: '100%', maxWidth: 640, alignSelf: 'center' },
  intro: { ...type.body, color: colors.muted },
  label: { ...type.label, color: colors.muted, marginBottom: 10 },
  body: { ...type.body, color: colors.text, flexShrink: 1 },
  small: { ...type.small, color: colors.muted },
  strong: { fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 7 },
  emoji: { fontSize: 20, width: 26, textAlign: 'center' },
  rowTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  point: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dot: { ...type.body, color: colors.accent },
  foot: { ...type.small, color: colors.faint, textAlign: 'center', marginTop: 20 },
});
