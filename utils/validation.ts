/**
 * Input validation utilities using Zod
 * 
 * This module provides runtime validation for user inputs and API data
 * to ensure type safety and data integrity.
 */

import { z } from 'zod';
import { ValidationError } from '@/types/errors';

/**
 * Custom error map for better Portuguese error messages
 */
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        return { message: 'Campo obrigatório' };
      }
      return { message: `Valor inválido. Esperado ${issue.expected}, recebido ${issue.received}` };
    
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'E-mail inválido. Exemplo: seu@email.com' };
      }
      if (issue.validation === 'url') {
        return { message: 'URL inválida' };
      }
      return { message: 'Formato inválido' };
    
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: `Mínimo de ${issue.minimum} caracteres` };
      }
      if (issue.type === 'number') {
        return { message: `Valor deve ser maior ou igual a ${issue.minimum}` };
      }
      return { message: 'Valor muito pequeno' };
    
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Máximo de ${issue.maximum} caracteres` };
      }
      if (issue.type === 'number') {
        return { message: `Valor deve ser menor ou igual a ${issue.maximum}` };
      }
      return { message: 'Valor muito grande' };
    
    case z.ZodIssueCode.custom:
      return { message: issue.message || ctx.defaultError };
    
    default:
      return { message: ctx.defaultError };
  }
};

// Apply custom error map globally
z.setErrorMap(customErrorMap);

/**
 * Validation schemas
 */

// Email validation - Enhanced with better messages
export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido. Exemplo: seu@email.com')
  .trim();

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
// Enhanced schema with DDD validation and formatting support
const validDDDs = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
  '21', '22', '24', // RJ/ES
  '27', '28', // ES
  '31', '32', '33', '34', '35', '37', '38', // MG
  '41', '42', '43', '44', '45', '46', // PR
  '47', '48', '49', // SC
  '51', '53', '54', '55', // RS
  '61', // DF
  '62', '64', // GO
  '63', // TO
  '65', '66', // MT
  '67', // MS
  '68', // AC
  '69', // RO
  '71', '73', '74', '75', '77', // BA
  '79', // SE
  '81', '87', // PE
  '82', // AL
  '83', // PB
  '84', // RN
  '85', '88', // CE
  '86', '89', // PI
  '91', '93', '94', // PA
  '92', '97', // AM
  '95', // RR
  '96', // AP
  '98', '99', // MA
] as const;

export const phoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/\D/g, '')) // Remove formatting for validation
  .refine((digits) => digits.length === 10 || digits.length === 11, {
    message: 'Telefone deve ter 10 ou 11 dígitos (com DDD)',
  })
  .refine((digits) => {
    const ddd = digits.substring(0, 2);
    return validDDDs.includes(ddd as any);
  }, {
    message: 'DDD inválido',
  });

// CEP validation (Brazilian postal code)
export const cepSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-?\d{3}$/, 'CEP inválido. Formato: 00000-000')
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 8, 'CEP deve ter 8 dígitos');

// Password validation - Enhanced with better messages
export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha muito longa (máximo 100 caracteres)');

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

// Item category validation
export const itemCategorySchema = z.string().min(1, 'Categoria é obrigatória').trim();

// Item condition validation
export const itemConditionSchema = z.string().min(1, 'Condição é obrigatória').trim();

// New Item Input schema
export const newItemInputSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionSchema,
  category: itemCategorySchema.optional(),
  condition: itemConditionSchema.optional(),
  dailyRate: itemDailyRateSchema,
  minRentalDays: itemMinRentalDaysSchema,
  photos: z.array(z.string().url()).optional(),
  city: z.string().max(100).trim().optional(),
  neighborhood: z.string().max(100).trim().optional(),
  published: z.boolean().optional(),
  isFree: z.boolean().optional(),
});

// Review schemas
export const reviewRatingSchema = z
  .number()
  .int('Rating deve ser um número inteiro')
  .min(1, 'Rating deve ser no mínimo 1')
  .max(5, 'Rating deve ser no máximo 5');

export const reviewCommentSchema = z
  .string()
  .max(500, 'Comentário muito longo')
  .trim()
  .optional();

export const newReviewInputSchema = z.object({
  reservationId: z.string().min(1, 'Reserva é obrigatória'),
  renterUid: z.string().min(1, 'Usuário deve estar autenticado'),
  itemId: z.string().optional(),
  ownerUid: z.string().optional(),
  itemOwnerUid: z.string().min(1, 'Dono do item é obrigatório'),
  type: z.enum(['item', 'owner'], { errorMap: () => ({ message: 'Tipo de avaliação inválido' }) }),
  rating: reviewRatingSchema,
  comment: reviewCommentSchema,
});

// Reservation schemas
export const reservationStatusSchema = z.enum([
  'requested',
  'accepted',
  'rejected',
  'paid',
  'picked_up',
  'paid_out',
  'returned',
  'canceled',
  'closed',
]);

export const newReservationInputSchema = z.object({
  itemId: z.string().min(1, 'Item é obrigatório'),
  itemTitle: z.string().min(1, 'Título do item é obrigatório'),
  itemOwnerUid: z.string().min(1, 'Dono do item é obrigatório'),
  renterUid: z.string().min(1, 'Locatário é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de fim é obrigatória'),
  days: z.number().int().min(1, 'Número de dias deve ser pelo menos 1').optional(),
  total: z.number().nonnegative('Total deve ser positivo').optional(),
  isFree: z.boolean().optional(),
  status: reservationStatusSchema.optional(),
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
 * Item validation functions
 */

/**
 * Validate item creation input
 * @param input - Item input data
 * @returns Validation result with error message if invalid
 */
export function validateItemInput(input: {
  title: string;
  description: string;
  category?: string;
  minRentalDays?: string | number;
  dailyRate?: string;
  isFree?: boolean;
}): { valid: boolean; error?: string } {
  // Validate title and description
  if (!input.title?.trim()) {
    return { valid: false, error: 'Título é obrigatório.' };
  }
  if (!input.description?.trim()) {
    return { valid: false, error: 'Descrição é obrigatória.' };
  }

  // Validate category if provided
  if (input.category !== undefined && !input.category?.trim()) {
    return { valid: false, error: 'Selecione uma categoria.' };
  }

  // Validate minRentalDays
  const days =
    typeof input.minRentalDays === 'string' ? Number(input.minRentalDays) : input.minRentalDays;
  if (days !== undefined && (!Number.isFinite(days) || days <= 0)) {
    return { valid: false, error: 'Dias mínimos deve ser maior que 0.' };
  }

  // Validate dailyRate if not free
  if (!input.isFree && input.dailyRate !== undefined) {
    const rate = input.dailyRate.trim() ? Number(input.dailyRate.replace(',', '.')) : NaN;
    if (!Number.isFinite(rate) || rate <= 0) {
      return {
        valid: false,
        error: 'Informe a diária (maior que 0) ou marque Grátis.',
      };
    }
  }

  return { valid: true };
}

/**
 * Parse daily rate from string to number
 * Handles comma as decimal separator
 * Allows 0 for free items
 */
export function parseDailyRate(rateString: string): number {
  const parsed = rateString.trim() ? Number(rateString.replace(',', '.')) : NaN;
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ValidationError('Valor inválido', 'dailyRate');
  }
  return parsed;
}

/**
 * Parse min rental days from string to number
 */
export function parseMinRentalDays(daysString: string | number): number {
  const days = typeof daysString === 'string' ? Number(daysString) : daysString;
  if (!Number.isFinite(days) || days <= 0) {
    throw new ValidationError('Dias mínimos deve ser maior que 0.', 'minRentalDays');
  }
  return days;
}

/**
 * Review validation functions
 */

/**
 * Validate review input
 * @param input - Review input data
 * @returns Validation result with error message if invalid
 */
export function validateReviewInput(input: {
  rating?: number;
  reservationId?: string;
  renterUid?: string;
}): { valid: boolean; error?: string } {
  if (!input.rating || !(input.rating >= 1 && input.rating <= 5 && Number.isInteger(input.rating))) {
    return { valid: false, error: 'Rating deve ser de 1 a 5.' };
  }

  if (!input.reservationId) {
    return { valid: false, error: 'Reserva deve ser selecionada.' };
  }

  if (!input.renterUid) {
    return { valid: false, error: 'Usuário deve estar autenticado.' };
  }

  return { valid: true };
}

/**
 * Reservation validation functions
 */

/**
 * Validate reservation input
 * @param input - Reservation input data
 * @returns Validation result with error message if invalid
 */
export function validateReservationInput(input: {
  itemId?: string;
  startDate?: string;
  endDate?: string;
  renterUid?: string;
}): { valid: boolean; error?: string } {
  if (!input.itemId) {
    return { valid: false, error: 'Item é obrigatório.' };
  }

  if (!input.startDate || !input.endDate) {
    return { valid: false, error: 'Selecione check-in e check-out.' };
  }

  if (!input.renterUid) {
    return { valid: false, error: 'Usuário deve estar autenticado.' };
  }

  return { valid: true };
}

/**
 * Type inference helpers
 */
export type NewItemInput = z.infer<typeof newItemInputSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type NewReviewInput = z.infer<typeof newReviewInputSchema>;
export type NewReservationInput = z.infer<typeof newReservationInputSchema>;

