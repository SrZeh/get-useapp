/**
 * Standardized error messages and error code constants
 * 
 * This file centralizes all user-facing error messages and error codes
 * to ensure consistency across the application and prepare for i18n.
 */

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_EMAIL = 'auth/invalid-email',
  AUTH_USER_DISABLED = 'auth/user-disabled',
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_WRONG_PASSWORD = 'auth/wrong-password',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  AUTH_NETWORK_ERROR = 'auth/network-request-failed',
  AUTH_TOO_MANY_REQUESTS = 'auth/too-many-requests',
  
  // Firestore errors
  FIRESTORE_PERMISSION_DENIED = 'permission-denied',
  FIRESTORE_NOT_FOUND = 'not-found',
  FIRESTORE_UNAVAILABLE = 'unavailable',
  FIRESTORE_REQUIRES_INDEX = 'failed-precondition',
  
  // Validation errors
  VALIDATION_REQUIRED = 'validation/required',
  VALIDATION_INVALID_FORMAT = 'validation/invalid-format',
  VALIDATION_INVALID_CPF = 'validation/invalid-cpf',
  VALIDATION_INVALID_EMAIL = 'validation/invalid-email',
  VALIDATION_MIN_LENGTH = 'validation/min-length',
  VALIDATION_MAX_LENGTH = 'validation/max-length',
  
  // Item errors
  ITEM_NOT_FOUND = 'item/not-found',
  ITEM_NOT_AVAILABLE = 'item/not-available',
  ITEM_UNAUTHORIZED = 'item/unauthorized',
  
  // Reservation errors
  RESERVATION_NOT_FOUND = 'reservation/not-found',
  RESERVATION_INVALID_DATES = 'reservation/invalid-dates',
  RESERVATION_DATE_CONFLICT = 'reservation/date-conflict',
  RESERVATION_UNAUTHORIZED = 'reservation/unauthorized',
  
  // Payment errors
  PAYMENT_FAILED = 'payment/failed',
  PAYMENT_CANCELLED = 'payment/cancelled',
  PAYMENT_REFUND_FAILED = 'payment/refund-failed',
  
  // Network errors
  NETWORK_ERROR = 'network/error',
  NETWORK_TIMEOUT = 'network/timeout',
  
  // Generic errors
  UNKNOWN_ERROR = 'unknown/error',
  OPERATION_FAILED = 'operation/failed',
}

/**
 * User-facing error messages in Portuguese (default)
 * TODO: Move to i18n system for multilingual support
 */
export const ErrorMessages: Record<ErrorCode | string, string> = {
  // Authentication
  [ErrorCode.AUTH_INVALID_EMAIL]: 'E-mail inválido.',
  [ErrorCode.AUTH_USER_DISABLED]: 'Usuário desativado.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'Usuário não encontrado.',
  [ErrorCode.AUTH_WRONG_PASSWORD]: 'Senha incorreta.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Senha muito fraca. Use pelo menos 6 caracteres.',
  [ErrorCode.AUTH_EMAIL_ALREADY_IN_USE]: 'Este e-mail já está em uso.',
  [ErrorCode.AUTH_NETWORK_ERROR]: 'Falha de rede. Verifique sua conexão.',
  [ErrorCode.AUTH_TOO_MANY_REQUESTS]: 'Muitas tentativas. Tente novamente mais tarde.',
  
  // Firestore
  [ErrorCode.FIRESTORE_PERMISSION_DENIED]: 'Permissão negada. Verifique suas credenciais.',
  [ErrorCode.FIRESTORE_NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCode.FIRESTORE_UNAVAILABLE]: 'Serviço temporariamente indisponível. Tente novamente.',
  [ErrorCode.FIRESTORE_REQUIRES_INDEX]: 'Índice necessário. Siga as instruções no console.',
  
  // Validation
  [ErrorCode.VALIDATION_REQUIRED]: 'Este campo é obrigatório.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Formato inválido.',
  [ErrorCode.VALIDATION_INVALID_CPF]: 'CPF inválido.',
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'E-mail inválido.',
  [ErrorCode.VALIDATION_MIN_LENGTH]: 'O valor é muito curto.',
  [ErrorCode.VALIDATION_MAX_LENGTH]: 'O valor é muito longo.',
  
  // Items
  [ErrorCode.ITEM_NOT_FOUND]: 'Item não encontrado.',
  [ErrorCode.ITEM_NOT_AVAILABLE]: 'Item não disponível no momento.',
  [ErrorCode.ITEM_UNAUTHORIZED]: 'Você não tem permissão para acessar este item.',
  
  // Reservations
  [ErrorCode.RESERVATION_NOT_FOUND]: 'Reserva não encontrada.',
  [ErrorCode.RESERVATION_INVALID_DATES]: 'Datas inválidas. Verifique o período selecionado.',
  [ErrorCode.RESERVATION_DATE_CONFLICT]: 'O período selecionado está indisponível.',
  [ErrorCode.RESERVATION_UNAUTHORIZED]: 'Você não tem permissão para esta ação.',
  
  // Payment
  [ErrorCode.PAYMENT_FAILED]: 'Pagamento falhou. Tente novamente.',
  [ErrorCode.PAYMENT_CANCELLED]: 'Pagamento cancelado.',
  [ErrorCode.PAYMENT_REFUND_FAILED]: 'Não foi possível processar o estorno.',
  
  // Network
  [ErrorCode.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet.',
  [ErrorCode.NETWORK_TIMEOUT]: 'Tempo de conexão esgotado. Tente novamente.',
  
  // Generic
  [ErrorCode.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado.',
  [ErrorCode.OPERATION_FAILED]: 'Operação falhou. Tente novamente.',
  
  // Fallback
  'default': 'Ocorreu um erro. Tente novamente.',
};

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code: string | ErrorCode): string {
  return ErrorMessages[code] ?? ErrorMessages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Extract error code from Firebase error or generic error
 */
export function extractErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; message?: string };
    if (err.code) {
      return err.code;
    }
  }
  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorUserMessage(error: unknown): string {
  const code = extractErrorCode(error);
  return getErrorMessage(code);
}

