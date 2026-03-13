import { requireNativeView } from 'expo';
import * as React from 'react';

import { AppleIntelligenceViewProps } from './AppleIntelligence.types';

const NativeView: React.ComponentType<AppleIntelligenceViewProps> =
  requireNativeView('AppleIntelligence');

export default function AppleIntelligenceView(props: AppleIntelligenceViewProps) {
  return <NativeView {...props} />;
}
