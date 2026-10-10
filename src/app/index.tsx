import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoogleSignInButton from '../components/GoogleSignInButton';
import { GradientButton, VideoBackground } from '../components/ui';
import { firebaseConfigured } from '../lib/firebase';
import { useStore } from '../lib/store';
import { colors, type } from '../theme';

const googleReady =
  firebaseConfigured &&
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

const WORDS = ['Cook it.', 'Track it.', 'Burn it.'];

function RotatingWord() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1600 }),
        withTiming(-1, { duration: 450 }),
        withTiming(-1, { duration: 1600 }),
        withTiming(-2, { duration: 450 }),
        withTiming(-2, { duration: 1600 }),
        withTiming(0, { duration: 450 }),
      ),
      -1,
    );
  }, [y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * 44 }] }));
  return (
    <View style={{ height: 44, overflow: 'hidden' }}>
      <Animated.View style={anim}>
        {WORDS.map((w, i) => (
          <Text key={w} style={[styles.word, { color: [colors.accent2, colors.warm, colors.blue][i] }]}>
            {w}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

export default function Welcome() {
  const { user, ready, profile, continueAsGuest } = useStore();
  if (ready && user) return <Redirect href={profile.onboarded ? '/(tabs)' : '/onboarding'} />;

  return (
    <View style={styles.root}>
      {/* Swap assets/videos/login.mp4 for real cooking footage; keep it short, muted and loopable. */}
      <VideoBackground source={require('../../assets/videos/login.mp4')} dim={0.15} />
      <SafeAreaView style={styles.content}>
        <Animated.View entering={FadeIn.duration(900)}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🍽️  FITPLATE</Text>
          </View>
        </Animated.View>

        <View>
          <Animated.Text entering={FadeInDown.delay(150).duration(700)} style={styles.title}>
            Your health{'\n'}starts on your plate.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(350).duration(700)} style={{ marginTop: 10 }}>
            <RotatingWord />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(500).duration(700)} style={styles.pitch}>
            See what a dish costs to make before you tap order. Then cook it, one tiny step at a time.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(700).duration(700)} style={{ gap: 12, marginTop: 28 }}>
            {googleReady ? <GoogleSignInButton /> : null}
            <GradientButton
              title={googleReady ? 'Try it without signing in' : 'Get started'}
              variant={googleReady ? 'glass' : 'primary'}
              onPress={continueAsGuest}
            />
            <Text style={styles.fine}>Free to start · No ads · Your data stays on your phone</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'space-between', padding: 24 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: { ...type.label, color: colors.text },
  title: { ...type.hero, fontSize: 40, lineHeight: 44, color: colors.text },
  word: { fontSize: 34, lineHeight: 44, fontWeight: '900', letterSpacing: -0.8 },
  pitch: { color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 23, marginTop: 14 },
  fine: { ...type.small, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },
});
