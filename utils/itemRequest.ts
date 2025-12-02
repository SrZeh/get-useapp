/**
 * Item Request utilities
 * 
 * Helper functions for request items (Socorro!)
 */

import type { Item } from '@/types/item';
import type { FirestoreTimestamp } from '@/types/firestore';
import type { UserProfile } from '@/types/user';

/**
 * Check if an item is a request (socorro)
 */
export function isRequestItem(item: Item): boolean {
  return item.itemType === 'request';
}

/**
 * Check if a request item is expired
 */
export function isRequestExpired(item: Item): boolean {
  if (!isRequestItem(item) || !item.expiresAt) return false;
  
  const expiration = item.expiresAt instanceof Date 
    ? item.expiresAt 
    : (item.expiresAt as any)?.toDate?.() || new Date(item.expiresAt as any);
  
  return expiration.getTime() <= Date.now();
}

/**
 * Get time remaining until expiration (in minutes)
 */
export function getRequestTimeRemaining(item: Item): number {
  if (!isRequestItem(item) || !item.expiresAt) return 0;
  
  const expiration = item.expiresAt instanceof Date 
    ? item.expiresAt 
    : (item.expiresAt as any)?.toDate?.() || new Date(item.expiresAt as any);
  
  const now = new Date();
  const diff = expiration.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(diff / (1000 * 60)));
}

/**
 * Format time remaining as human-readable string
 */
export function formatRequestTimeRemaining(item: Item): string {
  if (!isRequestItem(item)) return '';
  
  const minutes = getRequestTimeRemaining(item);
  if (minutes <= 0) return 'Expirado';
  
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
}

/**
 * Check if user can create a help request
 * Requires: email verified
 */
export function canCreateHelpRequest(user: UserProfile | null): boolean {
  if (!user) return false;
  return !!user.emailVerified;
}

/**
 * Get missing verification requirements
 */
export function getMissingVerifications(user: UserProfile | null): string[] {
  if (!user) return ['Usuário não autenticado'];
  
  const missing: string[] = [];
  
  if (!user.emailVerified) {
    missing.push('E-mail verificado');
  }
  
  return missing;
}

