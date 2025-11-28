/**
 * Help Request utilities
 * 
 * Helper functions for help request validation and verification
 */

import type { UserProfile } from '@/types/user';
import type { HelpRequestUrgency } from '@/types/helpRequest';

/**
 * Check if user can create a help request
 * Requires: email verified (simplified for testing - will add more later)
 */
export function canCreateHelpRequest(user: UserProfile | null): boolean {
  if (!user) return false;
  
  // Por enquanto, apenas email verificado (já obrigatório no cadastro)
  // TODO: Adicionar phoneVerified, CPF e photoURL depois
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
  
  // TODO: Adicionar outras verificações depois
  // if (!user.phoneVerified) {
  //   missing.push('Telefone verificado');
  // }
  // if (!user.cpf) {
  //   missing.push('CPF cadastrado');
  // }
  // if (!user.photoURL) {
  //   missing.push('Foto de perfil');
  // }
  
  return missing;
}

/**
 * Calculate expiration time based on urgency type
 * - immediate: 1 hour
 * - planned: 7 days
 */
export function calculateExpirationTime(urgencyType: HelpRequestUrgency): Date {
  const now = new Date();
  const expiration = new Date(now);
  
  if (urgencyType === 'immediate') {
    expiration.setHours(expiration.getHours() + 1);
  } else {
    expiration.setDate(expiration.getDate() + 7);
  }
  
  return expiration;
}

/**
 * Get time remaining until expiration (in minutes)
 */
export function getTimeRemaining(expiresAt: Date | { toDate: () => Date }): number {
  const expiration = expiresAt instanceof Date 
    ? expiresAt 
    : expiresAt.toDate();
  
  const now = new Date();
  const diff = expiration.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(diff / (1000 * 60)));
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(minutes: number): string {
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
 * Check if help request is expired
 */
export function isExpired(expiresAt: Date | { toDate: () => Date }): boolean {
  const expiration = expiresAt instanceof Date 
    ? expiresAt 
    : expiresAt.toDate();
  
  return expiration.getTime() <= Date.now();
}

