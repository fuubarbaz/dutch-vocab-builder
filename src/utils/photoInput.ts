import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Longest edge a photo is reduced to before it reaches the model.
 *
 * The vision encoder takes a small fixed input, so sending a full camera frame only
 * costs time and memory. 768px still keeps signs and faces legible.
 */
export const MAX_IMAGE_EDGE = 768;

export type PreparedPhoto =
  | { status: 'ok'; uri: string; path: string }
  | { status: 'cancelled' }
  | { status: 'denied'; message: string };

/**
 * Asks for a photo, shrinks it, and returns both forms the callers need:
 * `uri` for `<Image>`, and `path` for LiteRT-LM, which opens the file directly and
 * so cannot take the file:// scheme.
 */
export async function pickAndPreparePhoto(fromCamera: boolean): Promise<PreparedPhoto> {
  const permission = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return {
      status: 'denied',
      message: fromCamera
        ? 'Geen toegang tot de camera. Sta dit toe in Instellingen.'
        : 'Geen toegang tot uw foto\'s. Sta dit toe in Instellingen.',
    };
  }

  const picked = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
    : await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });

  if (picked.canceled || !picked.assets?.[0]) return { status: 'cancelled' };

  const shrunk = await manipulateAsync(
    picked.assets[0].uri,
    [{ resize: { width: MAX_IMAGE_EDGE } }],
    { compress: 0.85, format: SaveFormat.JPEG },
  );

  return { status: 'ok', uri: shrunk.uri, path: shrunk.uri.replace(/^file:\/\//, '') };
}
