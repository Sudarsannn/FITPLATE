import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from '../lib/session';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="dish/[id]" options={{ title: '' }} />
        <Stack.Screen name="shop/[id]" options={{ title: 'Shopping list' }} />
        <Stack.Screen name="cook/[id]" options={{ title: 'Cook' }} />
        <Stack.Screen name="done/[id]" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}
