import { featureFlags } from './featureFlags';

export type GoogleClientIds = {
  web?: string;
  android?: string;
  ios?: string;
};

/** The Google OAuth client IDs from .env (never hard-coded; Sudarsan supplies them). */
export function googleClientIdsFromEnv(): GoogleClientIds {
  return {
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
  };
}

/**
 * Whether "Continue with Google" can work on this platform. expo-auth-session
 * throws on iOS without an iOS client ID and on Android without an Android
 * one, so the button only shows when this platform's ID exists. Native
 * sign-in (iPhone / Android dev build) also sits behind `nativeGoogleSignIn`.
 */
export function googleSignInAvailable(
  os: string,
  ids: GoogleClientIds,
  firebaseReady: boolean,
  nativeFlag: boolean = featureFlags.nativeGoogleSignIn,
): boolean {
  if (!firebaseReady) return false;
  if (os === 'web') return Boolean(ids.web);
  if (!nativeFlag) return false;
  if (os === 'ios') return Boolean(ids.ios);
  if (os === 'android') return Boolean(ids.android);
  return false;
}

/**
 * The iOS redirect for Google: the reversed client ID, which Google accepts for
 * iOS clients and which app.config.js registers as a URL scheme.
 * "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc:/oauthredirect".
 */
export function iosGoogleRedirect(iosClientId: string | undefined): string | undefined {
  if (!iosClientId) return undefined;
  const guid = iosClientId.replace(/\.apps\.googleusercontent\.com$/, '');
  return `com.googleusercontent.apps.${guid}:/oauthredirect`;
}
