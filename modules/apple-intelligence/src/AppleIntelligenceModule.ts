import { NativeModule, requireNativeModule } from 'expo';

import { AppleIntelligenceModuleEvents } from './AppleIntelligence.types';

declare class AppleIntelligenceModule extends NativeModule<AppleIntelligenceModuleEvents> {
  generateTextAsync(prompt: string): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AppleIntelligenceModule>('AppleIntelligence');
