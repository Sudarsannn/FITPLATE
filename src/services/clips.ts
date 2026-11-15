import { loadFiles } from '../lib/nativeCamera';
import { CLIP_DIR } from './cameraWorkout';

/**
 * Removes every workout clip recorded in the camera screen (the `clips` folder in the app's
 * document folder). Part of "Delete my data": the clips live only on the phone, so deleting
 * the account's cloud data alone would leave them behind. Returns how many clips were
 * there. Throws if the folder exists but cannot be deleted, so the caller can say so.
 * An app built before camera mode has no file module and no clips, so it returns 0.
 */
export function deleteAllClips(): number {
  const F = loadFiles();
  if (!F) return 0;
  const dir = new F.Directory(F.Paths.document, CLIP_DIR);
  if (!dir.exists) return 0;
  const count = dir.list().length;
  dir.delete();
  if (dir.exists) throw new Error('The workout videos could not be deleted.');
  return count;
}
