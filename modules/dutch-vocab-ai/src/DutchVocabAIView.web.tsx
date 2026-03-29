import * as React from 'react';

import { DutchVocabAIViewProps } from './DutchVocabAI.types';

export default function DutchVocabAIView(props: DutchVocabAIViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
