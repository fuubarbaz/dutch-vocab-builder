import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload, DutchVocabAIModuleEvents } from './DutchVocabAI.types';

class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  async generateTextAsync(prompt: string): Promise<string> {
    return 'Dutch Vocab AI is not supported on the web platform.';
  }
};

export default registerWebModule(DutchVocabAIModule, 'DutchVocabAIModule');
