// Dynamic Expo config on top of app.json (priority plan P1-a). Reads only
// public, non-secret values from the environment; never put keys in here.
const { withEntitlementsPlist } = require('expo/config-plugins');
const queried = require('./src/config/queriedSchemes.json');

// expo-notifications adds the remote-push entitlement, which a free Apple ID
// (Personal Team) can't sign. FitPlate only uses local reminders, so drop it
// unless FITPLATE_IOS_REMOTE_PUSH=true (paid Apple programme, later).
const withoutRemotePush = (config) =>
  withEntitlementsPlist(config, (mod) => {
    if (process.env.FITPLATE_IOS_REMOTE_PUSH !== 'true') delete mod.modResults['aps-environment'];
    return mod;
  });

/** "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc" */
function reversedClientId(id) {
  if (!id) return null;
  return `com.googleusercontent.apps.${id.replace(/\.apps\.googleusercontent\.com$/, '')}`;
}

module.exports = ({ config }) => {
  const iosGoogle = reversedClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  const schemes = ['fitplate', ...(iosGoogle ? [iosGoogle] : [])];
  const querySchemes = Array.from(new Set([...queried.zepto, ...queried.swiggy, ...queried.upi]));

  return withoutRemotePush({
    ...config,
    // The first scheme stays "fitplate" (deep links like fitplate://checkout/return).
    scheme: schemes,
    ios: {
      ...config.ios,
      // A free Apple ID needs a bundle ID nobody else has registered. Change it in .env if Xcode says "not available".
      bundleIdentifier: process.env.FITPLATE_IOS_BUNDLE_ID || 'com.sudarsannn.fitplate',
      infoPlist: {
        ...(config.ios && config.ios.infoPlist),
        LSApplicationQueriesSchemes: querySchemes,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: [...(config.plugins || []), 'expo-dev-client'],
  });
};
