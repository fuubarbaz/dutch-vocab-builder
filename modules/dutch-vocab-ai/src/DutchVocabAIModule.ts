import { NativeModule, requireNativeModule } from 'expo';

import { DutchVocabAIModuleEvents } from './DutchVocabAI.types';

declare class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  generateTextAsync(prompt: string): Promise<string>;
}

/**
 * JS fallback that mirrors the native Swift evaluation logic.
 * Used when the native module is unavailable (e.g. Expo Go, web, or linking issues).
 */
async function generateTextAsyncFallback(prompt: string): Promise<string> {
  const lowerPrompt = prompt.toLowerCase();

  // Extract user sentence (between quotes)
  const quoteParts = lowerPrompt.split('"');
  let userSentence = quoteParts.length > 1
    ? quoteParts[1].trim().replace(/[.!?]/g, '')
    : '';

  // Extract expected keywords (between brackets)
  const bracketMatch = lowerPrompt.match(/\[([^\]]*)\]/);
  const keywordsStr = bracketMatch ? bracketMatch[1] : '';
  const keywords = keywordsStr
    .split(',')
    .map((kw) => kw.trim())
    .filter((kw) => kw.length > 0);

  const missingKeywords = keywords.filter((kw) => !userSentence.includes(kw));

  if (missingKeywords.length === 0 && keywords.length > 0) {
    return `Excellent! '${userSentence}' is correct and follows the rule perfectly!`;
  } else if (keywords.length > 0) {
    return `Not quite. Remember to use these words: ${missingKeywords.join(', ')}. Try again!`;
  }

  return "I'm your Dutch Vocab AI tutor! Give me a sentence or ask for a rule to practice.";
}

let moduleToExport: DutchVocabAIModule;

try {
  // This call loads the native module object from the JSI.
  moduleToExport = requireNativeModule<DutchVocabAIModule>('DutchVocabAI');
} catch (error) {
  console.warn(
    'DutchVocabAI native module not loaded, using JS fallback. Error:',
    error instanceof Error ? error.message : String(error),
  );

  // Provide a functional JS fallback so the feature works even without the native module
  moduleToExport = {
    generateTextAsync: generateTextAsyncFallback,
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  } as unknown as DutchVocabAIModule;
}

export default moduleToExport;
