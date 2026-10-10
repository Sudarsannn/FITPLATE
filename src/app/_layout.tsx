import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider } from '../lib/store';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="dish/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="cook/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="done/[id]" options={{ animation: 'fade' }} />
          <Stack.Screen name="shop/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="profile" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="grocery" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="log" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true, sheetCornerRadius: 28, contentStyle: { backgroundColor: colors.bgElevated } }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
