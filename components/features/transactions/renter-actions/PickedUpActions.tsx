/**
 * PickedUpActions - Status display when item is picked up
 */

import React from 'react';
import { ThemedText } from '@/components/themed-text';

export function PickedUpActions() {
  return (
    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
      Obrigado! A devolução agora pode ser confirmada pelo dono.
    </ThemedText>
  );
}

