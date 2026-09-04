import { NativeModule, requireNativeModule } from 'expo';

import { DutchVocabAIModuleEvents } from './DutchVocabAI.types';

export type AIAvailability = 'available' | 'not_downloaded' | 'downloading' | 'load_error';

export type DownloadProgress = {
  bytesReceived: number;
  totalBytes: number;
  fraction: number;
};

declare class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  generateTextAsync(prompt: string): Promise<string>;
  translateTextsAsync(texts: string[], sourceLang: string, targetLang: string): Promise<string[]>;
  generateSmallTalkAsync(topic: string, turnCount: number): Promise<string>;
  generateSmallTalkStreamAsync(topic: string, turnCount: number): Promise<void>;
  /** Opens a stateful roleplay scene and resolves to its session id. */
  startRoleplaySessionAsync(scenario: string, character: string, level: string): Promise<string>;
  /** Sends one learner turn. Pass '' to have the character open the scene. */
  sendRoleplayTurnAsync(sessionId: string, text: string): Promise<string>;
  /** Streaming variant; emits `onRoleplayChunk` with the accumulated reply. */
  sendRoleplayTurnStreamAsync(sessionId: string, text: string): Promise<void>;
  /** Ends the scene. Resolves false when it had already been evicted. */
  endRoleplaySessionAsync(sessionId: string): Promise<boolean>;
  /** Reviews a finished scene's learner lines. Evicts any live session — end-of-scene only. */
  reviewRoleplayAsync(lines: string[]): Promise<string>;
  /** True when the engine loaded with its vision encoder. False = photo features off. */
  isVisionAvailableAsync(): Promise<boolean>;
  /** Builds an A2 picture question from a photo. `imagePath` is an absolute path, no file://. */
  generatePictureTaskAsync(imagePath: string, level: string): Promise<string>;
  /** Marks a spoken answer against the photo itself. */
  reviewPictureAnswerAsync(
    imagePath: string,
    question: string,
    checkpoints: string[],
    answer: string,
  ): Promise<string>;
  getAIAvailabilityAsync(): Promise<AIAvailability>;
  /** Returns the native error message from the last failed engine load, or null if no error. */
  getLoadErrorAsync(): Promise<string | null>;
  downloadModelAsync(): Promise<boolean>;
  cancelDownloadAsync(): Promise<boolean>;
  /** Clears in-memory engine + load error. Pass deleteFile=true to also remove the model
   *  file so the download gate re-appears (useful when the model is corrupt). */
  resetModelAsync(deleteFile: boolean): Promise<boolean>;
}

// ── JS Fallbacks ──────────────────────────────────────────────────────────────
// Used when the native module is unavailable (Expo Go, simulator without build, web).
// The first-run download gate in _layout.tsx will keep users away from AI features
// when the native module isn't built in.

function grammarCheckFallback(sentence: string): string {
  const words = sentence.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) {
    return 'INCORRECT\n\nYour input is too short. A Dutch sentence needs at least a subject and verb, e.g. "Ik loop" (I walk).';
  }
  const commonSubjects = ['ik', 'jij', 'je', 'hij', 'zij', 'ze', 'het', 'wij', 'we', 'jullie', 'u'];
  const hasSubject = words.some((w) => commonSubjects.includes(w.toLowerCase()));
  if (!hasSubject) {
    return `INCORRECT\n\n"${sentence}" doesn't appear to contain a subject (e.g. ik, jij, hij). Most Dutch sentences require a subject.`;
  }
  return `CORRECT\n\n"${sentence}" appears structurally valid. Install a development build of Dutchify to enable the on-device Gemma model.`;
}

function sentenceBuilderFallback(prompt: string): string {
  const quoteParts = prompt.split('"');
  const userSentence = (quoteParts[1] ?? '').trim().replace(/[.!?]/g, '').toLowerCase();
  const bracketMatch = prompt.match(/\[([^\]]*)\]/);
  const keywords = (bracketMatch?.[1] ?? '')
    .split(',')
    .map((kw) => kw.trim().toLowerCase())
    .filter((kw) => kw.length > 0);

  const missing = keywords.filter((kw) => !userSentence.includes(kw));
  if (missing.length === 0 && keywords.length > 0) {
    return `Excellent! "${userSentence}" uses all the required words.`;
  }
  if (keywords.length > 0) {
    return `Not quite — remember to use: ${missing.join(', ')}. Try again!`;
  }
  return "I'm your Dutch Vocab AI tutor. Type a sentence to practice!";
}

async function generateTextAsyncFallback(prompt: string): Promise<string> {
  const lower = prompt.toLowerCase();
  if (lower.includes('[grammar-check]')) {
    const parts = prompt.split('"');
    const sentence = parts.length > 1 ? parts[1].trim() : '';
    return grammarCheckFallback(sentence);
  }
  return sentenceBuilderFallback(prompt);
}

async function generateSmallTalkStreamAsyncFallback(_topic: string, _turnCount: number): Promise<void> {
  // no-op on fallback; the screen falls back to generateSmallTalkAsync
}

async function generateSmallTalkAsyncFallback(topic: string): Promise<string> {
  return JSON.stringify([
    { speaker: 'A', dutch: 'Hoi! Hoe gaat het met jou?', english: 'Hi! How are you?' },
    { speaker: 'B', dutch: 'Goed, dank je! En met jou?', english: 'Good, thanks! And you?' },
    { speaker: 'A', dutch: `Wat vind jij van ${topic}?`, english: `What do you think about ${topic}?` },
    { speaker: 'B', dutch: 'Dat vind ik heel interessant!', english: 'I find that very interesting!' },
  ]);
}

async function translateTextsAsyncFallback(texts: string[]): Promise<string[]> {
  return texts;
}

async function startRoleplaySessionAsyncFallback(): Promise<string> {
  throw new Error('load_error');
}

async function sendRoleplayTurnAsyncFallback(): Promise<string> {
  throw new Error('load_error');
}

async function endRoleplaySessionAsyncFallback(): Promise<boolean> {
  return false;
}

async function reviewRoleplayAsyncFallback(): Promise<string> {
  throw new Error('load_error');
}

async function visionUnavailableFallback(): Promise<never> {
  throw new Error('load_error');
}

// ── Module Export ─────────────────────────────────────────────────────────────

let moduleToExport: DutchVocabAIModule;
let nativeLoadError: string | null = null;

try {
  moduleToExport = requireNativeModule<DutchVocabAIModule>('DutchVocabAI');
} catch (error) {
  nativeLoadError = error instanceof Error ? error.message : String(error);
  console.warn('[DutchVocabAI] Native module unavailable — using JS fallback. AI features require a development build with MediaPipe Tasks GenAI. Error:', nativeLoadError);

  moduleToExport = {
    generateTextAsync: generateTextAsyncFallback,
    translateTextsAsync: translateTextsAsyncFallback,
    generateSmallTalkAsync: generateSmallTalkAsyncFallback,
    generateSmallTalkStreamAsync: generateSmallTalkStreamAsyncFallback,
    startRoleplaySessionAsync: startRoleplaySessionAsyncFallback,
    sendRoleplayTurnAsync: sendRoleplayTurnAsyncFallback,
    sendRoleplayTurnStreamAsync: sendRoleplayTurnAsyncFallback,
    endRoleplaySessionAsync: endRoleplaySessionAsyncFallback,
    reviewRoleplayAsync: reviewRoleplayAsyncFallback,
    isVisionAvailableAsync: async (): Promise<boolean> => false,
    generatePictureTaskAsync: visionUnavailableFallback,
    reviewPictureAnswerAsync: visionUnavailableFallback,
    getAIAvailabilityAsync: async (): Promise<AIAvailability> => 'load_error',
    getLoadErrorAsync: async (): Promise<string | null> => nativeLoadError,
    downloadModelAsync: async (): Promise<boolean> => false,
    cancelDownloadAsync: async (): Promise<boolean> => false,
    resetModelAsync: async (): Promise<boolean> => false,
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  } as unknown as DutchVocabAIModule;
}

/** True when running on JS fallback (no native module). UI should inform the user. */
export const isFallback = nativeLoadError !== null;

export default moduleToExport;
