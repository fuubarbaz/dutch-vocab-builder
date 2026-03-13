import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './AppleIntelligence.types';

type AppleIntelligenceModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class AppleIntelligenceModule extends NativeModule<AppleIntelligenceModuleEvents> {
  async generateTextAsync(prompt: string): Promise<string> {
    return 'Apple Intelligence is not supported on the web platform.';
  }
};

export default registerWebModule(AppleIntelligenceModule, 'AppleIntelligenceModule');
