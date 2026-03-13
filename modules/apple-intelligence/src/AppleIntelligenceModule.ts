import { NativeModule, requireNativeModule } from 'expo';

import { AppleIntelligenceModuleEvents } from './AppleIntelligence.types';

declare class AppleIntelligenceModule extends NativeModule<AppleIntelligenceModuleEvents> {
  generateTextAsync(prompt: string): Promise<string>;
}

let moduleToExport: AppleIntelligenceModule;

try {
  // This call loads the native module object from the JSI.
  moduleToExport = requireNativeModule<AppleIntelligenceModule>('AppleIntelligence');
} catch (error) {
  console.warn("Failed to load AppleIntelligence native module. Are you running in standard Expo Go?");
  
  // Provide a fallback so the app does not crash when this module is imported
  moduleToExport = {
    generateTextAsync: async () => 'Apple Intelligence native module is not available. If you are using Expo Go on your physical device, please build a custom development client using `npx expo run:ios --device` to use native modules.',
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  } as unknown as AppleIntelligenceModule;
}

export default moduleToExport;
