import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { getFirebaseAuth } from '../lib/firebase';
import { colors } from '../theme';
import { GradientButton } from './ui';

WebBrowser.maybeCompleteAuthSession();

// Only rendered when Firebase and the Google client IDs are configured.
export default function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.params.id_token;
    const auth = getFirebaseAuth();
    if (!auth || !idToken) return;
    signInWithCredential(auth, GoogleAuthProvider.credential(idToken)).catch((e) =>
      setError(String(e?.message ?? e)),
    );
  }, [response]);

  return (
    <>
      <GradientButton
        title="Continue with Google"
        icon={<Ionicons name="logo-google" size={18} color="#06210F" />}
        onPress={() => promptAsync()}
        disabled={!request}
      />
      {error ? <Text style={{ color: colors.bad, marginTop: 8 }}>{error}</Text> : null}
    </>
  );
}
