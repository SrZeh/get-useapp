/**
 * Utilities for converting Brazilian phone numbers to E.164 format
 * E.164 is the international format required by Firebase Phone Authentication
 * Format: +55DDDNNNNNNNN (country code + DDD + number)
 */

import { cleanPhone } from './phoneFormatter';

/**
 * Converts Brazilian phone number to E.164 format
 * @param phone Brazilian phone in any format (e.g., "(11) 98765-4321" or "11987654321")
 * @returns E.164 formatted phone (e.g., "+5511987654321")
 */
export function phoneToE164(phone: string): string {
  const digits = cleanPhone(phone);
  
  // Must have 10 or 11 digits (DDD + number)
  if (digits.length < 10 || digits.length > 11) {
    throw new Error('Telefone deve ter 10 ou 11 dígitos');
  }
  
  // Add Brazil country code (+55)
  return `+55${digits}`;
}

/**
 * Validates if phone can be converted to E.164
 */
export function isValidE164Phone(phone: string): boolean {
  try {
    const e164 = phoneToE164(phone);
    // E.164 format: + followed by country code (1-3 digits) + number (max 15 digits total)
    return /^\+[1-9]\d{10,14}$/.test(e164);
  } catch {
    return false;
  }
}

/**
 * Formats E.164 phone back to Brazilian format for display
 * @param e164Phone E.164 formatted phone (e.g., "+5511987654321")
 * @returns Brazilian format (e.g., "(11) 98765-4321")
 */
export function e164ToBrazilian(e164Phone: string): string {
  // Remove +55 country code
  const withoutCountry = e164Phone.replace(/^\+55/, '');
  
  if (withoutCountry.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${withoutCountry.substring(0, 2)}) ${withoutCountry.substring(2, 6)}-${withoutCountry.substring(6)}`;
  } else if (withoutCountry.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return `(${withoutCountry.substring(0, 2)}) ${withoutCountry.substring(2, 7)}-${withoutCountry.substring(7)}`;
  }
  
  return e164Phone; // Return as is if format is unexpected
}
