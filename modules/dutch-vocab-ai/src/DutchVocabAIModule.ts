import { NativeModule, requireNativeModule } from 'expo';

import { DutchVocabAIModuleEvents } from './DutchVocabAI.types';

declare class DutchVocabAIModule extends NativeModule<DutchVocabAIModuleEvents> {
  generateTextAsync(prompt: string): Promise<string>;
}

let moduleToExport: DutchVocabAIModule;

try {
  // This call loads the native module object from the JSI.
  moduleToExport = requireNativeModule<DutchVocabAIModule>('DutchVocabAI');
} catch (error) {
  console.warn("Failed to load DutchVocabAI native module. Ensure you are on a physical device and using a custom development build.");
  
  // Provide a fallback so the app does not crash when this module is imported
  moduleToExport = {
    generateTextAsync: async () => 'DutchVocabAI native module is not available. Please ensure you are using a physical device with the Dutch Vocab AI build installed.',
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  } as unknown as DutchVocabAIModule;
}

export default moduleToExport;
