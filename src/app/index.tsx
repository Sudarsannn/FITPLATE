import { Redirect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoogleSignInButton from '../components/GoogleSignInButton';
import { Button } from '../components/ui';
import { firebaseConfigured } from '../lib/firebase';
import { useSession } from '../lib/session';
import { colors } from '../theme';

const VIDEO_URL = process.env.EXPO_PUBLIC_LOGIN_VIDEO_URL;
const googleReady =
  firebaseConfigured &&
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

function BackgroundVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

// Shown until a real cooking clip is set in EXPO_PUBLIC_LOGIN_VIDEO_URL.
function FoodBackdrop() {
  const rows = ['🍛 🥘 🍳 🥗 🍲', '🧅 🍅 🌶️ 🧄 🥕', '🍗 🧈 🍚 🥚 🌿', '🥣 🍋 🫘 🥜 🧀'];
  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      {rows.concat(rows).map((r, i) => (
        <Text key={i} style={styles.backdropRow}>
          {r}
        </Text>
      ))}
    </View>
  );
}

export default function Login() {
  const { user, ready, continueAsGuest } = useSession();
  if (ready && user) return <Redirect href="/home" />;

  return (
    <View style={styles.root}>
      {VIDEO_URL ? <BackgroundVideo uri={VIDEO_URL} /> : <FoodBackdrop />}
      <View style={styles.scrim} />
      <SafeAreaView style={styles.content}>
        <View>
          <Text style={styles.logo}>FitPlate</Text>
          <Text style={styles.tagline}>Your health starts on your plate.</Text>
        </View>
        <View style={{ gap: 12 }}>
          <Text style={styles.pitch}>
            See what a dish costs to make before you tap order. Then cook it, step by tiny step.
          </Text>
          {googleReady ? <GoogleSignInButton /> : null}
          <Button
            title={googleReady ? 'Try the demo without signing in' : 'Try the demo'}
            variant={googleReady ? 'secondary' : 'primary'}
            onPress={continueAsGuest}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  backdrop: { justifyContent: 'space-around', alignItems: 'center', opacity: 0.35 },
  backdropRow: { fontSize: 44, letterSpacing: 8 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,12,10,0.55)' },
  content: { flex: 1, justifyContent: 'space-between', padding: 24 },
  logo: { color: colors.text, fontSize: 44, fontWeight: '900', marginTop: 40 },
  tagline: { color: colors.accent, fontSize: 18, fontWeight: '600', marginTop: 4 },
  pitch: { color: colors.text, fontSize: 17, lineHeight: 24, marginBottom: 8 },
});
