/**
 * useNotificationBadges - Hook unificado para todos os badges de notificação
 * 
 * Centraliza a lógica de badges de notificação em um único lugar, usando:
 * 1. Sistema de contadores do Firebase (fonte principal)
 * 2. Fallback para queries diretas quando necessário
 * 3. Cache e otimização de performance
 * 
 * Retorna um objeto com todos os badges disponíveis no app.
 */

import { useMemo, useCallback, useState } from 'react';
import { useNotificationCounters } from './useNotificationCounters';
import { useUnreadMessagesDot } from '../messages';
import { useTransactionsDot } from '../transactions';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';

export type NotificationBadges = {
  // Badges principais
  messages: boolean;
  transactions: boolean;
  reservations: boolean;
  payments: boolean;
  interactions: boolean;
  
  // Contadores numéricos (para badges com números)
  counts: {
    messages: number;
    transactions: number;
    reservations: number;
    payments: number;
    interactions: number;
    total: number;
  };
  
  // Helper: verifica se há qualquer notificação
  hasAny: boolean;
  
  // Função para marcar como visto (atualização otimista)
  markAsSeen: (type: 'messages' | 'transactions' | 'reservations' | 'payments' | 'interactions') => Promise<void>;
};

/**
 * Hook unificado que retorna todos os badges de notificação do app
 * 
 * @returns NotificationBadges - objeto com todos os badges e contadores
 * 
 * @example
 * ```tsx
 * const badges = useNotificationBadges();
 * 
 * // Verificar se há notificações
 * if (badges.hasAny) {
 *   // Mostrar indicador geral
 * }
 * 
 * // Usar badge específico
 * <TabIcon showDot={badges.messages} />
 * 
 * // Usar contador
 * <Badge>{badges.counts.messages}</Badge>
 * ```
 */
export function useNotificationBadges(): NotificationBadges {
  // Fonte principal: contadores do Firebase
  const counters = useNotificationCounters();
  
  // Fallbacks: queries diretas (para garantir sincronização)
  const hasUnreadMessages = useUnreadMessagesDot();
  const hasPendingTransactions = useTransactionsDot();
  
  // Estado local para atualizações otimistas (dispara imediatamente)
  const [optimisticState, setOptimisticState] = useState<{
    messages?: boolean;
    transactions?: boolean;
    reservations?: boolean;
    payments?: boolean;
    interactions?: boolean;
  }>({});
  
  // Função para marcar como visto (atualização otimista)
  const markAsSeen = useCallback(async (type: 'messages' | 'transactions' | 'reservations' | 'payments' | 'interactions') => {
    // Atualização otimista imediata (UI atualiza antes do servidor)
    setOptimisticState((prev) => {
      const updated = { ...prev };
      if (type === 'messages') {
        updated.messages = false;
      } else if (type === 'transactions') {
        updated.transactions = false;
        updated.reservations = false;
        updated.payments = false;
      } else {
        updated[type] = false;
      }
      return updated;
    });
    
    // Chama a função do servidor em background (silent fail para CORS)
    try {
      const functions = getFunctions(app, 'southamerica-east1');
      const markAsSeenFn = httpsCallable<{ type: string }, { ok: boolean }>(functions, 'markAsSeen');
      await markAsSeenFn({ type });
    } catch (error: any) {
      // Silently fail for CORS/internal errors - don't spam console
      // These errors don't affect functionality (optimistic update already happened)
      if (error?.code !== 'functions/internal' && error?.message !== 'internal') {
        console.error('Failed to mark as seen:', error);
      }
      // Não reverte o estado otimista - manteremos a UI atualizada mesmo se o servidor falhar
      // O estado será sincronizado na próxima vez que os contadores atualizarem
    }
  }, []);
  
  // Computa os badges usando contadores como fonte principal
  // e fallbacks para garantir que não perdemos notificações
  // Usa estado otimista se disponível
  const badges = useMemo<NotificationBadges>(() => {
    // Usa estado otimista se disponível, senão usa contadores
    const messages = optimisticState.messages ?? (counters.messages > 0 || hasUnreadMessages);
    const reservations = optimisticState.reservations ?? (counters.reservations > 0);
    const payments = optimisticState.payments ?? (counters.payments > 0);
    const interactions = optimisticState.interactions ?? (counters.interactions > 0);
    
    // Transactions = reservations + payments + fallback legacy
    const transactions = 
      optimisticState.transactions ?? 
      (reservations || payments || hasPendingTransactions);
    
    const hasAny = 
      messages || 
      transactions || 
      reservations || 
      payments || 
      interactions;
    
    return {
      messages,
      transactions,
      reservations,
      payments,
      interactions,
      counts: {
        messages: counters.messages,
        transactions: counters.reservations + counters.payments,
        reservations: counters.reservations,
        payments: counters.payments,
        interactions: counters.interactions,
        total: counters.total,
      },
      hasAny,
      markAsSeen,
    };
  }, [
    counters.messages,
    counters.reservations,
    counters.payments,
    counters.interactions,
    counters.total,
    hasUnreadMessages,
    hasPendingTransactions,
    optimisticState,
    markAsSeen,
  ]);
  
  return badges;
}

