import { registerWebModule, NativeModule } from 'expo';

import { DutchVocabAIModuleEvents } from './DutchVocabAI.types';
import type { AIAvailability } from './DutchVocabAIModule';

class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  async generateTextAsync(_prompt: string): Promise<string> {
    throw new Error('load_error');
  }
  async generateSmallTalkAsync(_topic: string, _turnCount: number): Promise<string> {
    throw new Error('load_error');
  }
  async generateSmallTalkStreamAsync(_topic: string, _turnCount: number): Promise<void> {
    throw new Error('load_error');
  }
  async startRoleplaySessionAsync(_scenario: string, _character: string, _level: string): Promise<string> {
    throw new Error('load_error');
  }
  async sendRoleplayTurnAsync(_sessionId: string, _text: string): Promise<string> {
    throw new Error('load_error');
  }
  async sendRoleplayTurnStreamAsync(_sessionId: string, _text: string): Promise<void> {
    throw new Error('load_error');
  }
  async endRoleplaySessionAsync(_sessionId: string): Promise<boolean> {
    return false;
  }
  async reviewRoleplayAsync(_lines: string[]): Promise<string> {
    throw new Error('load_error');
  }
  async isVisionAvailableAsync(): Promise<boolean> {
    return false;
  }
  async generatePictureTaskAsync(_imagePath: string, _level: string): Promise<string> {
    throw new Error('load_error');
  }
  async reviewPictureAnswerAsync(
    _imagePath: string,
    _question: string,
    _checkpoints: string[],
    _answer: string,
  ): Promise<string> {
    throw new Error('load_error');
  }
  async translateTextsAsync(texts: string[], _sourceLang: string, _targetLang: string): Promise<string[]> {
    return texts;
  }
  async getAIAvailabilityAsync(): Promise<AIAvailability> {
    return 'load_error';
  }
  async downloadModelAsync(): Promise<boolean> {
    return false;
  }
  async cancelDownloadAsync(): Promise<boolean> {
    return false;
  }
}

export const isFallback = true;
export default registerWebModule(DutchVocabAIModule, 'DutchVocabAIModule');
