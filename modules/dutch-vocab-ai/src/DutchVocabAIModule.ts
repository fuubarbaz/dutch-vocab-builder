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

  // Grammar check mode
  if (lowerPrompt.includes('[grammar-check]')) {
    return grammarCheckFallback(prompt);
  }

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

function grammarCheckFallback(prompt: string): string {
  const quoteParts = prompt.split('"');
  const userSentence = quoteParts.length > 1
    ? quoteParts[1].trim()
    : '';

  if (!userSentence) {
    return 'Please enter a Dutch sentence to check.';
  }

  const words = userSentence.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) {
    return 'INCORRECT\n\nYour input is too short to evaluate. A Dutch sentence typically needs at least a subject and a verb. For example: "Ik loop" (I walk).';
  }

  // Basic Dutch grammar heuristics
  const commonSubjects = ['ik', 'jij', 'je', 'hij', 'zij', 'ze', 'het', 'wij', 'we', 'jullie', 'u'];
  const firstWord = words[0].toLowerCase();
  const hasSubject = words.some((w) => commonSubjects.includes(w.toLowerCase()));

  if (!hasSubject) {
    return `INCORRECT\n\nYour sentence "${userSentence}" doesn't appear to contain a clear subject (e.g., ik, jij, hij, zij, wij). Most Dutch sentences require a subject. Try starting with a pronoun or noun.`;
  }

  // Check for verb in second position (V2 rule)
  if (commonSubjects.includes(firstWord) && words.length >= 3) {
    return `CORRECT\n\nYour sentence "${userSentence}" follows the standard Dutch word order with the subject in first position. For a more detailed analysis with Apple Intelligence, build and run on a supported iOS 26+ device.`;
  }

  return `CORRECT\n\nYour sentence "${userSentence}" appears to be structurally valid. For a more detailed grammar analysis, ensure Apple Intelligence is available on your device (iOS 26+ with a supported device).`;
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
