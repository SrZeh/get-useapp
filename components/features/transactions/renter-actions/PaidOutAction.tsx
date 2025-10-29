/**
 * PaidOutAction - Status display when payment has been transferred to owner
 */

import React from 'react';
import { ThemedText } from '@/components/themed-text';

export function PaidOutAction() {
  return (
    <ThemedText type="defaultSemiBold">
      Pagamento repassado ao dono ✅
    </ThemedText>
  );
}

