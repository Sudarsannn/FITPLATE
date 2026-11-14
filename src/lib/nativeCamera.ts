/**
 * expo-camera and expo-file-system are loaded on demand. An iPhone app built before
 * Day 26 does not contain them, and importing a missing native module at start-up would
 * stop the whole app. Here the require happens only when the camera screen is opened,
 * and a missing module simply returns null so the screen can say "update the app".
 */
type CameraModule = typeof import('expo-camera');
type FilesModule = typeof import('expo-file-system');

let camera: CameraModule | null | undefined;
let files: FilesModule | null | undefined;

export function loadCamera(): CameraModule | null {
  if (camera === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      camera = require('expo-camera') as CameraModule;
    } catch {
      camera = null;
    }
  }
  return camera;
}

export function loadFiles(): FilesModule | null {
  if (files === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      files = require('expo-file-system') as FilesModule;
    } catch {
      files = null;
    }
  }
  return files;
}
