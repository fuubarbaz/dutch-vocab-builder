import { registerWebModule, NativeModule } from 'expo';

import { DutchVocabAIModuleEvents } from './DutchVocabAI.types';
import type { AIAvailability } from './DutchVocabAIModule';

class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  async generateTextAsync(_prompt: string): Promise<string> {
    throw new Error('requires_ios26');
  }
  async generateSmallTalkAsync(_topic: string, _turnCount: number): Promise<string> {
    throw new Error('requires_ios26');
  }
  async translateTextsAsync(texts: string[], _sourceLang: string, _targetLang: string): Promise<string[]> {
    return texts;
  }
  async getAIAvailabilityAsync(): Promise<AIAvailability> {
    return 'requires_ios26';
  }
}

export const isFallback = true;
export default registerWebModule(DutchVocabAIModule, 'DutchVocabAIModule');
