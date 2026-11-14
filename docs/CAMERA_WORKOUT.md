# Camera workout mode (Day 26)

## What ships now (works in Expo Go, flag `cameraWorkout` ON)
- Move page, "Camera: count and record" (for exercises with a researched rep counter) opens `/camera/<exercise id>`.
- A guide first: where to put the phone (side, front or either, from the research `cameraView`), distance, height, light.
- Live camera (expo-camera), front or back, a tap counter for reps or a stopwatch for holds, and Record.
- Clips are recorded without sound (no microphone permission asked), at most 120 seconds, and moved into the app's document folder `clips/` as `fitplate-<exercise>-<date>-<time>.mp4`. They stay on the phone, are listed under the move, can be watched back and deleted.
- expo-camera and expo-file-system are loaded only when the screen opens (`src/lib/nativeCamera.ts`), so an iPhone app built before Day 26 still starts and the screen says to update the app.
- In a browser, the preview works; recording is a phone feature.

## What is built but off (flag `poseRepCounter` OFF)
- `src/services/repCounter.ts` (Day 25) turns pose keypoints into reps, holds and form messages.
- `src/services/cameraWorkout.ts` has `fromMoveNet` (17 keypoints) and `fromMediaPipe` (33 landmarks), and a `PoseProvider` slot: `registerPoseProvider({ id, label, start(onPose) -> stop })`.
- The camera screen already feeds any registered provider into the engine and shows reps, hold time and the latest form message instead of the tap buttons.
- Nothing registers a provider yet, because no pose model can run in Expo Go.

## Pose model research (free, on device)
| Option | Verdict |
|---|---|
| react-native-vision-camera 5.x (MIT) + react-native-fast-tflite 3.x (MIT) running the MoveNet Lightning TFLite model (Apache 2.0) | Recommended. Frame processors give the camera frames to the model on the phone. 17 keypoints, fast on mid-range phones. Dev build only. |
| MediaPipe Pose Landmarker through react-native-mediapipe 0.6 (MIT) | Gives 33 landmarks (heels, foot index). The package has not been updated since Dec 2024, so check it still builds with SDK 57 before relying on it. |
| @tensorflow/tfjs-react-native (Apache 2.0) | Not recommended. Last release Nov 2023, slow, needs expo-gl. |
Note: vision-camera replaces expo-camera as the camera in that build, so the provider screen would need its own preview. The simplest route is a `PoseProvider` that owns the vision-camera session and is shown on this same screen.

## To turn live counting on (needs Sudarsan, USER ACTION)
1. Build a development client (`npx expo run:ios --device`) with the pose libraries added.
2. At start-up of that build, call `registerPoseProvider(...)`, then set `poseRepCounter: true`.
3. Test on a real person: phone placement from the guide, check reps against a manual count for 3 sets of squats and push-ups, and check the hold timer on a plank.
4. Check frames per second and battery on the iPhone before leaving it on.

## Privacy
Nothing is uploaded. Clips and keypoints stay on the phone.
