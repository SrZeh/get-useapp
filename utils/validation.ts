/**
 * Input validation utilities using Zod
 * 
 * This module provides runtime validation for user inputs and API data
 * to ensure type safety and data integrity.
 */

import { z } from 'zod';
import { ValidationError } from '@/types/errors';

/**
 * Validation schemas
 */

// Email validation
export const emailSchema = z.string().email('E-mail inválido').trim();

// CPF validation (Brazilian tax ID)
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

function validateCPFChecksum(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '').split('').map(Number);
  if (digits.length !== 11 || new Set(digits).size === 1) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== digits[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  return digit === digits[10];
}

export const cpfSchema = z
  .string()
  .trim()
  .refine((val) => cpfRegex.test(val), 'CPF em formato inválido')
  .refine(validateCPFChecksum, 'CPF inválido');

// Phone validation (Brazilian format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone em formato inválido');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha muito longa');

// Item schemas
export const itemTitleSchema = z
  .string()
  .min(1, 'Título é obrigatório')
  .max(100, 'Título muito longo')
  .trim();

export const itemDescriptionSchema = z
  .string()
  .max(1000, 'Descrição muito longa')
  .trim()
  .optional();

export const itemDailyRateSchema = z
  .number()
  .positive('Valor deve ser positivo')
  .optional();

export const itemMinRentalDaysSchema = z
  .number()
  .int('Deve ser um número inteiro')
  .min(1, 'Mínimo de dias deve ser pelo menos 1')
  .optional();

// New Item Input schema
export const newItemInputSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  category: z.string().optional(),
  condition: z.string().optional(),
  dailyRate: itemDailyRateSchema,
  minRentalDays: itemMinRentalDaysSchema,
  photos: z.array(z.string().url()).optional(),
  city: z.string().max(100).trim().optional(),
  neighborhood: z.string().max(100).trim().optional(),
  published: z.boolean().optional(),
});

// User profile schemas
export const userNameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .trim();

export const userProfileSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  cpf: cpfSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().max(200).trim().optional(),
  photoURL: z.string().url().nullable().optional(),
});

/**
 * Validation helpers
 */

/**
 * Validate data against a Zod schema and throw ValidationError on failure
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError?.message ?? 'Validação falhou',
        firstError?.path?.[0]?.toString(),
        { errors: error.errors }
      );
    }
    throw error;
  }
}

/**
 * Safely validate data and return result or errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate CPF (Brazilian tax ID)
 */
export function validateCPF(cpf: string): boolean {
  try {
    cpfSchema.parse(cpf);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format CPF for display or validation
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type inference helpers
 */
export type NewItemInput = z.infer<typeof newItemInputSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;

