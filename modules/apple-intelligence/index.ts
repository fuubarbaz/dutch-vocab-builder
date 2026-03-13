// Reexport the native module. On web, it will be resolved to AppleIntelligenceModule.web.ts
// and on native platforms to AppleIntelligenceModule.ts
export { default } from './src/AppleIntelligenceModule';
export { default as AppleIntelligenceView } from './src/AppleIntelligenceView';
export * from  './src/AppleIntelligence.types';
