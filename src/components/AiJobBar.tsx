import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PHASES } from '../services/ai/client';
import { clock, dismissAiJob, secondsLeft, setMinimised, useAiJob } from '../services/ai/job';
import { colors, radius } from '../theme';
import { alpha, IconBadge } from './Icon';
import { PressableScale } from './ui';

/** The floating status bar for a dish the AI is creating: shows while the full screen is minimised or closed, then turns into an "open it" bar. */
export function AiJobBar() {
  const job = useAiJob();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(() => Date.now());
  const running = job?.status === 'running';
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  if (!job) return null;
  // On the create screen itself the full view is the status, unless it was minimised.
  if (path === '/create-dish' && !job.minimised) return null;

  const elapsed = Math.floor(((job.endedAt ?? now) - job.startedAt) / 1000);
  const at = PHASES.findIndex((p) => p.id === job.phase);
  const left = secondsLeft(job.phase, elapsed);
  const progress = job.status === 'running' ? Math.min(0.95, (at + 1 - Math.exp(-elapsed / 14)) / PHASES.length) : 1;
  const done = job.status === 'done';
  const failed = job.status === 'error';
  const tone = failed ? colors.warn : done ? colors.accent : colors.violet;

  const open = () => {
    if (done && job.dishId) {
      const id = job.dishId;
      dismissAiJob();
      router.push({ pathname: '/recipe/[id]', params: { id } });
    } else {
      setMinimised(false);
      if (path !== '/create-dish') router.push('/create-dish');
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOutDown.duration(200)} style={[styles.wrap, { bottom: insets.bottom + 92 }]} pointerEvents="box-none">
      <PressableScale onPress={open} style={[styles.bar, { borderColor: alpha(tone, 0.45) }]} accessibilityLabel={done ? 'Open your dish' : 'Show dish progress'}>
        <IconBadge name={failed ? 'alert-circle-outline' : done ? 'checkmark' : 'sparkles'} color={tone} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {failed ? 'Couldn’t create the dish' : done ? `${job.name} is ready` : `Creating ${job.name}`}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {failed ? 'Tap to try again' : done ? `Took ${clock(elapsed)} · tap to open` : `${clock(elapsed)} so far · about ${left < 60 ? `${left} s` : `${Math.round(left / 60)} min`} left`}
          </Text>
          {!failed ? (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]}>
                <LinearGradient colors={[colors.violet, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </View>
            </View>
          ) : null}
        </View>
        {done || failed ? (
          <PressableScale onPress={dismissAiJob} style={{ padding: 6 }} accessibilityLabel="Dismiss">
            <Ionicons name="close" size={18} color={colors.muted} />
          </PressableScale>
        ) : (
          <Ionicons name="chevron-up" size={18} color={colors.muted} />
        )}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  bar: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.bgElevated, borderWidth: 1 },
  title: { color: colors.text, fontWeight: '800', fontSize: 14 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 1, fontVariant: ['tabular-nums'] },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2, overflow: 'hidden' },
});
