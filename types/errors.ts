/**
 * Error type definitions for better error handling
 */

/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'network/error', context);
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string, context?: Record<string, unknown>) {
    super(message, 'validation/error', { ...context, field });
    this.name = 'ValidationError';
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string, public authCode?: string, context?: Record<string, unknown>) {
    super(message, 'auth/error', { ...context, authCode });
    this.name = 'AuthError';
  }
}

/**
 * Firestore errors
 */
export class FirestoreError extends AppError {
  constructor(message: string, public firestoreCode?: string, context?: Record<string, unknown>) {
    super(message, 'firestore/error', { ...context, firestoreCode });
    this.name = 'FirestoreError';
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'unknown/error', { originalError: error.name });
  }
  
  return new AppError(String(error), 'unknown/error', { originalError: String(error) });
}

