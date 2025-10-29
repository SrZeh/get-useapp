/**
 * Error Handling Utilities
 * 
 * Provides consistent error handling patterns across the application.
 * Centralizes error transformation, logging, and user-friendly messages.
 */

import { Alert } from 'react-native';
import { logger } from './logger';

type ServiceError = {
  message: string;
  code?: string;
  details?: unknown;
};

/**
 * Extract error message from unknown error type
 * @internal
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Ocorreu um erro desconhecido.';
}

/**
 * Extract error code from unknown error type
 * @internal
 */
function extractErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

/**
 * Transform error into structured ServiceError
 * @internal
 */
function handleServiceError(error: unknown): ServiceError {
  const message = extractErrorMessage(error);
  const code = extractErrorCode(error);

  return {
    message,
    code,
    details: error,
  };
}

/**
 * Handle async error with user-friendly alert and logging
 * @param error - Error of unknown type
 * @param userMessage - Optional custom user-facing message
 * @param context - Additional context for logging
 */
export function handleAsyncError(
  error: unknown,
  userMessage?: string,
  context?: Record<string, unknown>
): void {
  const serviceError = handleServiceError(error);
  const displayMessage = userMessage ?? serviceError.message;

  // Log error with context
  logger.error('Async operation failed', error, {
    code: serviceError.code,
    message: serviceError.message,
    ...context,
  });

  // Show user-friendly alert
  Alert.alert('Erro', displayMessage);
}

