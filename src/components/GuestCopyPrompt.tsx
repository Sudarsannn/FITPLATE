import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { GradientButton } from './ui';
import { colors, type } from '../theme';
import { IconBadge } from './Icon';

type Props = {
  /** Number of entries the guest logged on this device. The prompt shows while it is above 0. */
  count: number;
  onCopy: () => Promise<void>;
  onSkip: () => Promise<void>;
};

/**
 * Shown once after a guest signs in with Google (SPEC-ADDENDA §5): one tap
 * copies what they logged on this device into their account.
 */
export function GuestCopyPrompt({ count, onCopy, onSkip }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    setFailed(false);
    try {
      await fn();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    // Android's back button must not decide for the user, so it does nothing here.
    <Modal visible={count > 0} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal accessibilityRole="alert">
          <IconBadge name="cloud-upload-outline" size={52} style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Bring your data with you?</Text>
          <Text style={styles.body}>
            Copy the meals, water and workouts you logged on this device into your account, so they show on every device.
          </Text>
          <Text style={styles.count}>
            {count === 1 ? '1 entry' : `${count} entries`} on this device · the demo’s sample week is not copied
          </Text>
          {failed ? <Text style={styles.error}>Couldn’t copy right now. Your data is still safe on this device. Please try again.</Text> : null}
          {busy ? (
            <View style={styles.busy} accessibilityLabel="Copying your data">
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.busyText}>Copying…</Text>
            </View>
          ) : (
            <View style={styles.buttons}>
              <GradientButton title="Copy my data" onPress={run(onCopy)} />
              <GradientButton title="Start fresh" variant="glass" onPress={run(onSkip)} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  emoji: { fontSize: 34, marginBottom: 8 },
  title: { ...type.h1, color: colors.text },
  body: { ...type.body, color: colors.muted, marginTop: 8 },
  count: { ...type.small, color: colors.faint, marginTop: 10 },
  error: { ...type.small, color: colors.bad, marginTop: 10 },
  buttons: { gap: 10, marginTop: 20 },
  busy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 112, marginTop: 20 },
  busyText: { ...type.body, color: colors.text },
});
