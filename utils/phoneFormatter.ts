/**
 * Phone number formatting utilities for Brazilian phone numbers
 * Integrates with Zod validation schemas
 */

import { phoneSchema } from '@/utils/validation';

/**
 * Formats Brazilian phone numbers for display
 * Supports: (11) 98765-4321 (mobile) or (11) 3456-7890 (landline)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  
  // Mobile: (XX) XXXXX-XXXX (9 digits after DDD)
  if (digits.length <= 11) {
    if (digits.length <= 2) {
      return `(${digits}`;
    }
    if (digits.length <= 7) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    }
    // Mobile with 9 digits
    if (digits.length === 11) {
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    }
    // Landline with 8 digits
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  }
  
  // Limit to 11 digits
  return formatPhone(digits.substring(0, 11));
}

/**
 * Validates phone using Zod schema
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const result = phoneSchema.safeParse(phone);
  
  if (result.success) {
    return { valid: true };
  }
  
  const firstError = result.error.errors[0];
  return { 
    valid: false, 
    error: firstError?.message ?? 'Telefone inválido' 
  };
}

/**
 * Removes formatting for storage (cleans to digits only)
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formats phone for display from stored value
 */
export function displayPhone(phone: string): string {
  const clean = cleanPhone(phone);
  return formatPhone(clean);
}

