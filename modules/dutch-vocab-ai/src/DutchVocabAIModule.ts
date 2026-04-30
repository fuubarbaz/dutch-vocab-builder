import { NativeModule, requireNativeModule } from 'expo';

import { DutchVocabAIModuleEvents } from './DutchVocabAI.types';

export type AIAvailability = 'available' | 'not_enabled' | 'model_not_ready' | 'requires_ios26' | 'device_not_eligible';

declare class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  generateTextAsync(prompt: string): Promise<string>;
  translateTextsAsync(texts: string[], sourceLang: string, targetLang: string): Promise<string[]>;
  generateSmallTalkAsync(topic: string, turnCount: number): Promise<string>;
  getAIAvailabilityAsync(): Promise<AIAvailability>;
}

// ── JS Fallbacks ──────────────────────────────────────────────────────────────
// Used when the native module is unavailable (Expo Go, simulator without build, web).
// These are intentionally limited — the UI will show a fallback banner to the user.

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
  return `CORRECT\n\n"${sentence}" appears structurally valid. For full on-device AI analysis, run on an iOS 26+ device with Apple Intelligence enabled.`;
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

// ── Module Export ─────────────────────────────────────────────────────────────

let moduleToExport: DutchVocabAIModule;
let nativeLoadError: string | null = null;

try {
  moduleToExport = requireNativeModule<DutchVocabAIModule>('DutchVocabAI');
} catch (error) {
  nativeLoadError = error instanceof Error ? error.message : String(error);
  console.warn('[DutchVocabAI] Native module unavailable — using JS fallback. Features require iOS 26+ with Apple Intelligence. Error:', nativeLoadError);

  moduleToExport = {
    generateTextAsync: generateTextAsyncFallback,
    translateTextsAsync: translateTextsAsyncFallback,
    generateSmallTalkAsync: generateSmallTalkAsyncFallback,
    getAIAvailabilityAsync: async (): Promise<AIAvailability> => 'requires_ios26',
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  } as unknown as DutchVocabAIModule;
}

/** True when running on JS fallback (no native module). UI should inform the user. */
export const isFallback = nativeLoadError !== null;

export default moduleToExport;
