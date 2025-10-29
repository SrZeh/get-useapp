/**
 * PayAction - Button to pay for accepted reservation
 */

import React from 'react';
import { Button } from '@/components/Button';

interface PayActionProps {
  reservationId: string;
  onPay: (id: string) => void;
}

export function PayAction({ reservationId, onPay }: PayActionProps) {
  return (
    <Button
      variant="primary"
      size="sm"
      onPress={() => onPay(reservationId)}
    >
      Pagar
    </Button>
  );
}

