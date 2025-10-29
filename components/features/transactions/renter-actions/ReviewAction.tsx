/**
 * ReviewAction - Button to navigate to review flow
 */

import React from 'react';
import { Button } from '@/components/Button';

interface ReviewActionProps {
  reservationId: string;
  onReview: (id: string) => void;
}

export function ReviewAction({ reservationId, onReview }: ReviewActionProps) {
  return (
    <Button
      variant="primary"
      size="sm"
      onPress={() => onReview(reservationId)}
    >
      Avaliar experiência
    </Button>
  );
}

