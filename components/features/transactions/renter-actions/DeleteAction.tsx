/**
 * DeleteAction - Button to delete a reservation
 */

import React from 'react';
import { Button } from '@/components/Button';
import type { Reservation } from '../types';

interface DeleteActionProps {
  reservation: Reservation;
  onDelete: (id: string, reservation: Reservation) => void;
}

export function DeleteAction({ reservation, onDelete }: DeleteActionProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={() => onDelete(reservation.id, reservation)}
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 0,
      }}
      textStyle={{ color: '#ffffff' }}
    >
      Excluir
    </Button>
  );
}

