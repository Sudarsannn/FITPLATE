// Dynamic Expo config on top of app.json (priority plan P1-a). Reads only
// public, non-secret values from the environment; never put keys in here.
const queried = require('./src/config/queriedSchemes.json');

/** "123-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.123-abc" */
function reversedClientId(id) {
  if (!id) return null;
  return `com.googleusercontent.apps.${id.replace(/\.apps\.googleusercontent\.com$/, '')}`;
}

module.exports = ({ config }) => {
  const iosGoogle = reversedClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  const schemes = ['fitplate', ...(iosGoogle ? [iosGoogle] : [])];
  const querySchemes = Array.from(new Set([...queried.zepto, ...queried.swiggy, ...queried.upi]));

  return {
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
  };
};
