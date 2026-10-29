# Cook mode extras (Day 12)

- **Video slot:** each step that has a researched "video shot" shows a card "Video for this step (coming soon)" with what the clip will show. Real clips replace it later.
- **Voice read-out:** flag `voiceSteps` (ON). A "Read aloud" switch on the step screen reads the title, instruction and timer with `expo-speech`; the choice is saved in `settings.featureToggles.readAloud`. The iPhone app must be rebuilt once because `expo-speech` is a native module.
- **Camera check (plan, flag `cameraCheck` OFF):** a step with a researched camera-check line will show it as a card. The later build uses the phone camera to compare the pan against the step's visual cue (needs a development build and an on-device or server vision model, and a privacy note: frames are not stored or uploaded). Until then the flag stays off.
- **Finished screen:** shows the celebration, saved vs ordering, the 1-5 rating (stored on the device for the future FitPlate Score) and "Logged to Today", which links to the meal log. Finishing records the cook completion and logs the meal.
