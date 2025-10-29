/**
 * Hook for form validation using Zod schemas
 * Provides field-level and form-level validation with error state management
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { safeValidate } from '@/utils/validation';

/**
 * Hook for form validation using Zod schemas
 * @param schema - Zod schema to validate against
 * @returns Validation state and methods
 */
export function useFormValidation<T extends z.ZodTypeAny>(schema: T) {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: string, value: unknown) => {
    // Extract field schema from object schema
    if (schema instanceof z.ZodObject) {
      const fieldSchema = schema.shape[field as keyof typeof schema.shape];
      if (!fieldSchema) {
        return { valid: true };
      }

      const result = (fieldSchema as z.ZodTypeAny).safeParse(value);
      
      setErrors(prev => ({
        ...prev,
        [field]: result.success ? undefined : result.error.errors[0]?.message,
      }));

      return {
        valid: result.success,
        error: result.success ? undefined : result.error.errors[0]?.message,
      };
    }
    
    return { valid: true };
  }, [schema]);

  /**
   * Validate all fields in the form
   */
  const validateAll = useCallback((values: unknown): boolean => {
    const result = safeValidate(schema, values);
    
    if (!result.success) {
      // Convert Zod errors to field-based error map
      const fieldErrors: Record<string, string> = {};
      result.errors.errors.forEach((err) => {
        const path = err.path[0]?.toString();
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  }, [schema]);

  /**
   * Mark a field as touched (user has interacted with it)
   */
  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => new Set([...prev, field]));
  }, []);

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  /**
   * Check if a field has been touched
   */
  const isFieldTouched = useCallback((field: string): boolean => {
    return touched.has(field);
  }, [touched]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  /**
   * Reset all validation state
   */
  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    setFieldTouched,
    getFieldError,
    isFieldTouched,
    clearErrors,
    clearFieldError,
    reset,
  };
}

