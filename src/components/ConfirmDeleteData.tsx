import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { tap } from '../lib/haptics';
import { colors, type } from '../theme';
import { GradientButton } from './ui';

type Props = {
  visible: boolean;
  /** Deletes everything; rejects when the cloud can't be reached. */
  onConfirm: () => Promise<void>;
  /** Called after a successful delete. */
  onDone: () => void;
  onCancel: () => void;
};

/**
 * The "Delete my data" confirmation. An in-app Modal rather than Alert.alert,
 * which does nothing on web.
 */
export function ConfirmDeleteData({ visible, onConfirm, onDone, onCancel }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await onConfirm();
      setBusy(false);
      onDone();
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  const cancel = () => {
    if (busy) return;
    setFailed(false); // the next opening starts clean
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancel}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.emoji}>🗑️</Text>
          <Text style={styles.title}>Delete all your FitPlate data?</Text>
          <Text style={styles.body}>
            This permanently deletes your profile, meal, water and workout logs, saved dishes, meal plans and savings, from the cloud and from
            this device. It can’t be undone. You’ll be signed out afterwards.
          </Text>
          {failed ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              Couldn’t reach the cloud. Nothing was deleted. Check your connection and try again.
            </Text>
          ) : null}
          {busy ? (
            <View style={styles.busy} accessibilityLabel="Deleting your data">
              <ActivityIndicator color={colors.bad} />
              <Text style={styles.busyText}>Deleting…</Text>
            </View>
          ) : (
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete everything"
                onPress={() => {
                  tap();
                  confirm();
                }}
                style={({ pressed }) => [styles.danger, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.dangerText}>Delete everything</Text>
              </Pressable>
              <GradientButton title="Cancel" variant="glass" onPress={cancel} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
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
  error: { ...type.small, color: colors.bad, marginTop: 12 },
  buttons: { gap: 10, marginTop: 20 },
  danger: {
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: colors.bad,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dangerText: { color: '#2A0606', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  busy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 118, marginTop: 20 },
  busyText: { ...type.body, color: colors.text },
});
