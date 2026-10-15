import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';

import { googleClientIdsFromEnv, iosGoogleRedirect } from '../config/googleAuth';
import { getFirebaseAuth } from '../lib/firebase';
import { colors } from '../theme';
import { GradientButton } from './ui';

WebBrowser.maybeCompleteAuthSession();

const ids = googleClientIdsFromEnv();

// Only rendered when googleSignInAvailable() says this platform has its client ID.
export default function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: ids.web,
    androidClientId: ids.android,
    iosClientId: ids.ios,
    // On the iPhone, Google returns to the reversed client ID scheme that app.config.js registers.
    redirectUri: Platform.OS === 'ios' ? iosGoogleRedirect(ids.ios) : undefined,
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
      {response?.type === 'error' ? (
        <Text style={{ color: colors.bad, marginTop: 8 }}>{response.error?.message ?? 'Google sign-in did not finish.'}</Text>
      ) : null}
      {error ? <Text style={{ color: colors.bad, marginTop: 8 }}>{error}</Text> : null}
    </>
  );
}
