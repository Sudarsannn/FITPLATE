import { router } from 'expo-router';
import { SafeAreaView, Text, View } from 'react-native';

import { colors, type } from '../theme';
import { GradientButton } from './ui';

/** Shown instead of a blank or red screen: one plain sentence and a way out. */
export function ErrorScreen({ title, body, retry }: { title: string; body: string; retry?: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
        <Text style={[type.h1, { color: colors.text }]} accessibilityRole="header">
          {title}
        </Text>
        <Text style={[type.body, { color: colors.muted }]}>{body}</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {retry ? <GradientButton title="Try again" onPress={retry} /> : null}
          <GradientButton title="Go to Today" variant={retry ? 'glass' : 'primary'} onPress={() => router.replace('/')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
