/**
 * Stripe Onboarding Service
 * 
 * Handles Stripe Express account onboarding flow for item owners.
 * Provides functions to check account status and initiate onboarding.
 */

import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { getAccountStatus, createAccountLink } from '@/services/cloudFunctions';
import { logger } from '@/utils';

export type StripeAccountStatus = {
  hasAccount: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  accountId?: string;
  requirements?: unknown;
};

/**
 * Ensures the owner has a Stripe account and it's fully onboarded
 * @returns true if account is ready to receive payments, false otherwise
 */
export async function ensureOwnerOnboarded(): Promise<boolean> {
  try {
    const status = await getAccountStatus();
    
    if (!status.hasAccount || !status.charges_enabled || !status.payouts_enabled) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to check Stripe account status', error);
    throw error;
  }
}

/**
 * Syncs Stripe account status and initiates onboarding if needed
 * Opens browser for onboarding flow if account is not ready
 * 
 * @param refreshUrl - URL to redirect to if user needs to refresh (e.g., 'http://localhost:8081/')
 * @param returnUrl - URL to redirect to after onboarding (e.g., 'http://localhost:8081/')
 * @returns true if account is now ready, false if onboarding was initiated
 */
export async function syncStripeAccount(
  refreshUrl: string,
  returnUrl: string
): Promise<boolean> {
  try {
    const status = await getAccountStatus();
    
    // Account is already ready
    if (status.hasAccount && status.charges_enabled && status.payouts_enabled) {
      Alert.alert('Stripe', 'Conta já pronta para receber.');
      return true;
    }
    
    // Need to onboard
    const { url } = await createAccountLink(refreshUrl, returnUrl);
    await WebBrowser.openBrowserAsync(url);
    return false;
  } catch (error) {
    logger.error('Failed to sync Stripe account', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar conta Stripe.';
    Alert.alert('Stripe', errorMessage);
    throw error;
  }
}

/**
 * Gets current Stripe account status
 * @returns Account status information
 */
export async function getStripeAccountStatus(): Promise<StripeAccountStatus> {
  try {
    return await getAccountStatus();
  } catch (error) {
    logger.error('Failed to get Stripe account status', error);
    throw error;
  }
}

