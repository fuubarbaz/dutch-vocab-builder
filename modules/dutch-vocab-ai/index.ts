// Reexport the native module. On web, it will be resolved to DutchVocabAIModule.web.ts
// and on native platforms to DutchVocabAIModule.ts
export { default, isFallback } from './src/DutchVocabAIModule';
export { default as DutchVocabAIView } from './src/DutchVocabAIView';
export * from './src/DutchVocabAI.types';
