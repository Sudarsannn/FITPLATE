import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useServerResearch } from '../lib/researchLoader';
import { StoreProvider } from '../lib/store';
import { colors } from '../theme';

export default function RootLayout() {
  useServerResearch();
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
          <Stack.Screen name="survey" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="dish/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="recipe/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="cook/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
          <Stack.Screen name="done/[id]" options={{ animation: 'fade' }} />
          <Stack.Screen name="shop/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="profile" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="your-data" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="grocery" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="basket" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="checkout/instamart" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="checkout/track" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="steps/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="exercise/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="workout/[id]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="balance" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="order-vs-make" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="meal/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="order-instead" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="multicook" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="analyse" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="vendors" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="photo-credits" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="log" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.75, 1], sheetGrabberVisible: true, sheetCornerRadius: 28, contentStyle: { backgroundColor: colors.bgElevated } }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
