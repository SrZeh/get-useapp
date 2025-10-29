/**
 * Payment utilities
 * 
 * Provides payment-related helper functions and formatting.
 */

import type { PaymentMethodType } from '@/types/reservation';

/**
 * Get deposit message based on payment method type
 * 
 * Returns a user-friendly message about deposit timing based on the payment method.
 * 
 * @param paymentMethodType - Payment method type (pix, boleto, card, etc.)
 * @returns Deposit message string
 */
export function getDepositMessage(paymentMethodType?: PaymentMethodType): string {
  if (paymentMethodType === 'pix' || paymentMethodType === 'boleto') {
    return 'Depósito automático em até 2 dias úteis pela Stripe.';
  }

  if (paymentMethodType === 'card') {
    return 'Depósito automático em até 30 dias (cartão BR).';
  }

  return 'Depósito automático conforme o método de pagamento.';
}

