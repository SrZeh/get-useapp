/**
 * Help Request (Socorro!) type definitions
 * 
 * Sistema de pedidos de ajuda urgente ou planejada
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';

/**
 * Tipo de urgência do pedido
 */
export type HelpRequestUrgency = 'immediate' | 'planned';

/**
 * Status do pedido
 */
export type HelpRequestStatus = 'active' | 'expired' | 'fulfilled' | 'cancelled';

/**
 * Help Request document stored in Firestore
 */
export interface HelpRequest {
  id: string;
  requesterUid: string;              // Quem precisa
  message: string;                   // Texto do pedido
  urgencyType: HelpRequestUrgency;   // 'immediate' ou 'planned'
  neighborhood: string[];            // Array de bairros selecionados
  city?: string;                     // Cidade (opcional, para futuro)
  status: HelpRequestStatus;         // Status atual
  createdAt: FirestoreTimestamp;
  expiresAt: FirestoreTimestamp;     // createdAt + 1h (immediate) ou + 7 dias (planned)
  offeredItems: string[];            // Array de itemIds oferecidos
  selectedItemId?: string;           // Item escolhido pelo requester
  resolvedViaMessage?: boolean;      // Se foi resolvido por mensagem (apenas immediate)
  resolvedAt?: FirestoreTimestamp;   // Quando foi resolvido
}

/**
 * Help Request document as stored in Firestore
 */
export type HelpRequestDocument = FirestoreDocument<Omit<HelpRequest, 'id' | 'createdAt' | 'expiresAt' | 'resolvedAt'>>;

/**
 * Input type for creating a help request
 */
export interface CreateHelpRequestInput {
  message: string;
  urgencyType: HelpRequestUrgency;
  neighborhood: string[];  // Array de bairros selecionados
  city?: string;
}

/**
 * Type guard to check if an object is a valid HelpRequest
 */
export function isHelpRequest(obj: unknown): obj is HelpRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'requesterUid' in obj &&
    'message' in obj &&
    'urgencyType' in obj &&
    'neighborhood' in obj &&
    'status' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    typeof (obj as { requesterUid: unknown }).requesterUid === 'string' &&
    typeof (obj as { message: unknown }).message === 'string' &&
    typeof (obj as { urgencyType: unknown }).urgencyType === 'string' &&
    Array.isArray((obj as { neighborhood: unknown }).neighborhood) &&
    typeof (obj as { status: unknown }).status === 'string'
  );
}

