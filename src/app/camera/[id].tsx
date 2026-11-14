import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton, PressableScale } from '../../components/ui';
import { ScreenTop } from '../../components/vendors/kit';
import { isEnabled } from '../../config/featureFlags';
import { loadCamera, loadFiles } from '../../lib/nativeCamera';
import { researchExercises } from '../../data/research';
import type { Exercise } from '../../models/exercise';
import { CLIP_DIR, clipFileName, clipLabel, clockLabel, getPoseProvider, MAX_CLIP_SECONDS, parseClipName, placementGuide, poseReady } from '../../services/cameraWorkout';
import { shortExerciseName } from '../../services/fitness';
import { configFor, createEngine, type Update } from '../../services/repCounter';
import { colors, radius, type } from '../../theme';

/** Camera workout: where to put the phone, a counter, and a recorded clip to watch back. */
export default function CameraWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = researchExercises.find((e) => e.id === id);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenTop title="Camera" subtitle={exercise ? shortExerciseName(exercise.name) : null} fallback="/move" />
      {!exercise ? (
        <Info title="Not found" text="It may have been renamed in an update. Find it again in the Move tab." />
      ) : !isEnabled('cameraWorkout') ? (
        <Info title="Camera mode is off" text="This feature is switched off in this version of the app." />
      ) : (
        <Body e={exercise} />
      )}
    </SafeAreaView>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ padding: 30, alignItems: 'center' }}>
      <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
      <Text style={{ color: colors.muted, marginTop: 6, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}

function Body({ e }: { e: Exercise }) {
  const [live, setLive] = useState(false);
  const cam = loadCamera();
  const guide = placementGuide(e);
  if (live && cam) return <Live e={e} cam={cam} onBack={() => setLive(false)} />;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.card}>
        <Text style={[type.label, { color: colors.muted, marginBottom: 8 }]} accessibilityRole="header">
          WHERE TO PUT YOUR PHONE
        </Text>
        <Text style={s.strong}>{guide.title}</Text>
        <View style={s.guideRow}>
          <Ionicons name="resize-outline" size={18} color={colors.accent} />
          <Text style={s.small}>{guide.distance}</Text>
        </View>
        <View style={s.guideRow}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.accent} />
          <Text style={s.small}>{guide.height}</Text>
        </View>
        {guide.steps.map((t, i) => (
          <View key={i} style={s.step}>
            <Text style={s.n}>{i + 1}.</Text>
            <Text style={[s.small, { flex: 1 }]}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.strong}>What this does</Text>
        <Text style={s.muted}>
          {poseReady()
            ? 'Counts your reps and checks your form as you move, and records a clip you can watch back.'
            : 'You tap to count your reps and can record a clip to watch back. Live counting from the camera needs a special build of the app and is not on yet.'}
        </Text>
        <Text style={s.muted}>Clips stay on this phone. They are not uploaded anywhere.</Text>
      </View>
      {cam ? (
        <GradientButton title="Open camera" style={{ marginTop: 16 }} onPress={() => setLive(true)} />
      ) : (
        <View style={s.card}>
          <Text style={s.strong}>Update the app to use the camera</Text>
          <Text style={s.muted}>This copy of the app was built before camera mode. Build it again from the project folder, or open the website version, to turn the camera on.</Text>
        </View>
      )}
      <Text style={[s.note, { textAlign: 'center', marginTop: 14 }]}>Stop if anything hurts. Rep counting from video is an estimate, not a coach.</Text>
    </ScrollView>
  );
}

type Cam = NonNullable<ReturnType<typeof loadCamera>>;

function Live({ e, cam, onBack }: { e: Exercise; cam: Cam; onBack: () => void }) {
  const { CameraView, useCameraPermissions } = cam;
  const [perm, ask] = useCameraPermissions();
  const ref = useRef<InstanceType<typeof CameraView>>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [reps, setReps] = useState(0);
  const [holdOn, setHoldOn] = useState(false);
  const [holdSec, setHoldSec] = useState(0);
  const [clips, setClips] = useState(() => listClips(e.id));
  const [watching, setWatching] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pose, setPose] = useState<Update | null>(null);
  const [tip, setTip] = useState<string | null>(null);

  const config = useMemo(() => configFor(e), [e]);
  const holdMode = (e.repCounter?.mode ?? 'reps') === 'hold_timer';

  const refresh = useCallback(() => setClips(listClips(e.id)), [e.id]);

  // Elapsed time while recording.
  useEffect(() => {
    if (!recording) return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 500);
    return () => clearInterval(id);
  }, [recording]);

  // Manual hold timer.
  useEffect(() => {
    if (!holdOn) return;
    const t0 = Date.now();
    const id = setInterval(() => setHoldSec((Date.now() - t0) / 1000), 250);
    return () => clearInterval(id);
  }, [holdOn]);

  // Live pose counting, only when a development build registered a pose source and the flag is on.
  useEffect(() => {
    const provider = getPoseProvider();
    if (!poseReady() || !provider || !config) return;
    const engine = createEngine(config);
    const stop = provider.start((pts) => {
      const u = engine.push({ t: Date.now() / 1000, pts });
      setPose(u);
      if (u.messages.length) setTip(u.messages[0].text);
    });
    return () => {
      stop();
      setPose(null);
    };
  }, [config]);

  const save = useCallback(
    (uri: string) => {
      const F = loadFiles();
      if (!F) return setNote('Recorded, but this app cannot keep clips yet. Update the app to save them.');
      try {
        const dir = new F.Directory(F.Paths.document, CLIP_DIR);
        if (!dir.exists) dir.create();
        const dest = new F.File(dir, clipFileName(e.id, new Date()));
        new F.File(uri).move(dest);
        setNote('Saved on this phone.');
        refresh();
        setWatching(dest.uri);
      } catch {
        setNote('Recorded, but saving the clip failed. Try again.');
      }
    },
    [e.id, refresh],
  );

  const toggleRecord = useCallback(async () => {
    const view = ref.current;
    if (!view) return;
    if (recording) {
      view.stopRecording();
      return;
    }
    setNote(null);
    setElapsed(0);
    setRecording(true);
    try {
      const r = await view.recordAsync({ maxDuration: MAX_CLIP_SECONDS });
      if (r?.uri) save(r.uri);
    } catch {
      setNote(Platform.OS === 'web' ? 'Recording works in the phone app. In the browser you can still count reps.' : 'Recording stopped. Try again.');
    } finally {
      setRecording(false);
    }
  }, [recording, save]);

  const remove = (uri: string) => {
    const F = loadFiles();
    try {
      if (F) new F.File(uri).delete();
    } catch {
      /* already gone */
    }
    if (watching === uri) setWatching(null);
    refresh();
  };

  if (!perm) return <Info title="Starting the camera" text="One moment." />;
  if (!perm.granted) {
    return (
      <View style={{ padding: 20 }}>
        <View style={s.card}>
          <Text style={s.strong}>Camera permission</Text>
          <Text style={s.muted}>FitPlate uses the camera to show you while you move and to record a clip for you to watch back. Nothing leaves your phone.</Text>
        </View>
        {perm.canAskAgain ? (
          <GradientButton title="Allow camera" style={{ marginTop: 16 }} onPress={() => void ask()} />
        ) : (
          <GradientButton title="Open settings" style={{ marginTop: 16 }} onPress={() => void Linking.openSettings()} />
        )}
        <GradientButton title="Back to the guide" variant="glass" style={{ marginTop: 10 }} onPress={onBack} />
      </View>
    );
  }

  const posed = pose !== null;
  const shownReps = posed ? pose.reps : reps;
  const shownHold = posed ? pose.holdSeconds : holdSec;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.cameraBox}>
        <CameraView ref={ref} style={StyleSheet.absoluteFill} facing={facing} mode="video" mute onCameraReady={() => setReady(true)} />
        <View style={s.badgeRow} pointerEvents="none">
          {recording ? (
            <View style={s.rec}>
              <View style={s.recDot} />
              <Text style={s.recText}>{clockLabel(elapsed)}</Text>
            </View>
          ) : (
            <View />
          )}
          <View style={s.rec}>
            <Text style={s.recText}>{holdMode ? clockLabel(shownHold) : `${shownReps} reps`}</Text>
          </View>
        </View>
        {tip ? (
          <View style={s.tip} pointerEvents="none">
            <Text style={s.tipText}>{tip}</Text>
          </View>
        ) : null}
      </View>

      <View style={s.controls}>
        <PressableScale onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} style={s.round} accessibilityLabel="Switch camera">
          <Ionicons name="camera-reverse-outline" size={24} color={colors.text} />
        </PressableScale>
        <PressableScale onPress={() => void toggleRecord()} disabled={!ready} style={[s.recBtn, recording && { backgroundColor: colors.bad }]} accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}>
          <Ionicons name={recording ? 'stop' : 'videocam'} size={26} color="#06210F" />
          <Text style={s.recBtnText}>{recording ? 'Stop' : 'Record'}</Text>
        </PressableScale>
        <PressableScale onPress={onBack} style={s.round} accessibilityLabel="Back to the guide">
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </PressableScale>
      </View>
      {note ? <Text style={[s.muted, { textAlign: 'center', marginTop: 10 }]}>{note}</Text> : null}

      <View style={s.card}>
        {holdMode ? (
          <>
            <Text style={s.strong}>Hold timer</Text>
            <Text style={s.muted}>{posed ? 'The camera is timing your hold.' : 'Start when you are in position, stop when you come out.'}</Text>
            {!posed ? (
              <GradientButton
                title={holdOn ? 'Stop' : 'Start hold'}
                variant={holdOn ? 'glass' : 'primary'}
                style={{ marginTop: 10 }}
                onPress={() => {
                  if (!holdOn) setHoldSec(0);
                  setHoldOn((v) => !v);
                }}
              />
            ) : null}
          </>
        ) : (
          <>
            <Text style={s.strong}>{posed ? 'Counting from the camera' : 'Rep counter'}</Text>
            <Text style={s.muted}>{posed ? 'Reps are counted from your movement. The tap buttons are off.' : 'Tap after each rep.'}</Text>
            {!posed ? (
              <View style={s.counter}>
                <PressableScale onPress={() => setReps((r) => Math.max(0, r - 1))} style={s.cBtn} accessibilityLabel="One fewer rep">
                  <Ionicons name="remove" size={26} color={colors.text} />
                </PressableScale>
                <Text style={s.cNum} accessibilityLabel={`${reps} reps`}>
                  {reps}
                </Text>
                <PressableScale onPress={() => setReps((r) => r + 1)} style={[s.cBtn, { backgroundColor: colors.accent }]} accessibilityLabel="One more rep">
                  <Ionicons name="add" size={26} color="#06210F" />
                </PressableScale>
              </View>
            ) : null}
          </>
        )}
      </View>

      {watching ? (
        <View style={s.card}>
          <Text style={s.strong}>Watch it back</Text>
          <Text style={s.muted}>Slow it down in your player and check the checkpoints on the move page.</Text>
          <Player uri={watching} />
        </View>
      ) : null}

      {clips.length ? (
        <View style={s.card}>
          <Text style={s.strong}>Your clips for this move</Text>
          {clips.map((c) => {
            const info = parseClipName(c.name);
            return (
              <View key={c.name} style={s.clipRow}>
                <PressableScale onPress={() => setWatching(c.uri)} style={{ flex: 1 }} accessibilityLabel={`Watch clip ${info ? clipLabel(info.at) : c.name}`}>
                  <Text style={s.small}>{info ? clipLabel(info.at) : c.name}</Text>
                </PressableScale>
                <PressableScale onPress={() => remove(c.uri)} style={s.del} accessibilityLabel="Delete clip">
                  <Ionicons name="trash-outline" size={20} color={colors.bad} />
                </PressableScale>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

type Clip = { uri: string; name: string };

/** This move's saved clips, newest first. Empty when the file module is missing or the folder does not exist yet. */
function listClips(exerciseId: string): Clip[] {
  const F = loadFiles();
  if (!F) return [];
  try {
    const dir = new F.Directory(F.Paths.document, CLIP_DIR);
    if (!dir.exists) return [];
    return dir
      .list()
      .filter((f): f is InstanceType<typeof F.File> => f instanceof F.File)
      .filter((f) => parseClipName(f.name)?.exerciseId === exerciseId)
      .map((f) => ({ uri: f.uri, name: f.name }))
      .sort((a, b) => (a.name < b.name ? 1 : -1));
  } catch {
    return [];
  }
}

function Player({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView player={player} style={s.video} nativeControls contentFit="contain" />;
}

const s = StyleSheet.create({
  card: { marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  strong: { color: colors.text, fontWeight: '800', fontSize: 14.5 },
  small: { color: colors.text, fontSize: 13.5, lineHeight: 19 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  note: { color: colors.faint, fontSize: 12, lineHeight: 17 },
  guideRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 },
  step: { flexDirection: 'row', gap: 8, paddingVertical: 5 },
  n: { color: colors.muted, fontWeight: '800', width: 20, fontSize: 13.5, lineHeight: 19 },
  cameraBox: { height: 420, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000', borderWidth: 1, borderColor: colors.border },
  badgeRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
  rec: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)' },
  recDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.bad },
  recText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  tip: { position: 'absolute', bottom: 12, left: 12, right: 12, padding: 10, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.65)' },
  tipText: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 8 },
  round: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  recBtn: { minWidth: 140, height: 56, borderRadius: 28, backgroundColor: colors.accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  recBtnText: { color: '#06210F', fontWeight: '900', fontSize: 16 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 12 },
  cBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  cNum: { color: colors.text, fontWeight: '900', fontSize: 44, minWidth: 70, textAlign: 'center' },
  video: { width: '100%', height: 260, marginTop: 10, borderRadius: radius.md, backgroundColor: '#000' },
  clipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  del: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
