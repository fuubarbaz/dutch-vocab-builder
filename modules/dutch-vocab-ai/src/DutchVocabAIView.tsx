import { requireNativeView } from 'expo';
import * as React from 'react';

import { DutchVocabAIViewProps } from './DutchVocabAI.types';

const NativeView: React.ComponentType<DutchVocabAIViewProps> =
  requireNativeView('DutchVocabAI');

export default function DutchVocabAIView(props: DutchVocabAIViewProps) {
  return <NativeView {...props} />;
}
