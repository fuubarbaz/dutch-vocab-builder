import * as React from 'react';

import { AppleIntelligenceViewProps } from './AppleIntelligence.types';

export default function AppleIntelligenceView(props: AppleIntelligenceViewProps) {
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
