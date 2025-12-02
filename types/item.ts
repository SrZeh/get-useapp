/**
 * Item-related type definitions
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';

/**
 * Item category type - all valid item categories
 */
export type ItemCategory =
  | 'Ferramentas elétricas'
  | 'Ferramentas manuais'
  | 'Construção & Reforma'
  | 'Marcenaria & Carpintaria'
  | 'Jardinagem'
  | 'Camping & Trilha'
  | 'Esportes & Lazer'
  | 'Mobilidade (bike/patinete)'
  | 'Fotografia & Vídeo'
  | 'Música & Áudio'
  | 'Informática & Acessórios'
  | 'Eletroportáteis'
  | 'Cozinha & Utensílios'
  | 'Eventos & Festas'
  | 'Móveis & Decoração'
  | 'Automotivo & Moto'
  | 'Bebê & Infantil'
  | 'Brinquedos & Jogos'
  | 'Pet'
  | 'Saúde & Beleza'
  | 'Outros';

/**
 * Item condition types
 */
export type ItemCondition = 'Novo' | 'Seminovo' | 'Usado' | 'Danificado';

/**
 * Base Item interface with all possible fields
 */
export interface Item {
  id: string;
  title: string;
  description?: string;
  category?: ItemCategory | string;
  condition?: ItemCondition | string;
  dailyRate?: number;
  minRentalDays?: number;
  photos?: string[];
  available?: boolean;
  ownerUid?: string;
  published?: boolean;
  city?: string;
  neighborhood?: string;

  // Termos de uso do item
  termsAccepted?: boolean;
  termsAcceptedAt?: FirestoreTimestamp | null;
  termsAcceptedVersion?: string | null;

  // Rating fields (product ratings)
  ratingAvg?: number;
  ratingCount?: number;
  ratingSum?: number;
  lastReviewSnippet?: string;

  // Owner rating fields (denormalized on item)
  ownerRatingCount?: number;
  ownerRatingSum?: number;

  // Additional fields
  isFree?: boolean;

  // Item type: 'offer' (default) or 'request' (socorro)
  itemType?: 'offer' | 'request';
  
  // Request-specific fields (only for itemType === 'request')
  urgencyType?: 'immediate' | 'planned'; // immediate = 1h, planned = 7 days
  expiresAt?: FirestoreTimestamp; // Calculated expiration time
  offeredItems?: string[]; // Array of item IDs offered to help this request

  // Timestamps
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;

  // Legacy field support (for backward compatibility)
  /** @deprecated Use ownerUid instead */
  owner?: string;
}

/**
 * Item document as stored in Firestore
 */
export type ItemDocument = FirestoreDocument<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Input type for creating a new item
 */
export interface NewItemInput {
  title: string;
  description?: string;
  category?: ItemCategory | string;
  condition?: ItemCondition | string;
  dailyRate?: number;
  minRentalDays?: number;
  photos?: string[];
  city?: string;
  neighborhood?: string;
  published?: boolean;
  isFree?: boolean;
  termsAccepted?: boolean;
  termsAcceptedVersion?: string;
  
  // Request-specific fields
  itemType?: 'offer' | 'request';
  urgencyType?: 'immediate' | 'planned';
}

/**
 * Type guard to check if an object is a valid Item
 */
export function isItem(obj: unknown): obj is Item {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    typeof (obj as { title: unknown }).title === 'string'
  );
}

