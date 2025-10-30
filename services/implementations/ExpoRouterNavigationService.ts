/**
 * Expo Router Navigation Service Implementation
 * 
 * Concrete implementation of INavigationService using expo-router.
 * This is the default implementation used in production.
 */

import { router } from 'expo-router';
import type { INavigationService, NavigationParams, NavigationOptions } from '../interfaces/INavigationService';

/**
 * Expo Router implementation of Navigation Service
 */
export class ExpoRouterNavigationService implements INavigationService {
  navigate(pathname: string, params?: NavigationParams, options?: NavigationOptions): void {
    if (options?.replace) {
      router.replace({ pathname, params } as never);
    } else {
      router.push({ pathname, params } as never);
    }
  }

  goBack(): void {
    router.back();
  }

  replace(pathname: string, params?: NavigationParams): void {
    router.replace({ pathname, params } as never);
  }

  navigateToItem(itemId: string): void {
    router.push(`/item/${itemId}`);
  }

  navigateToEditItem(itemId: string): void {
    router.push(`/item/edit/${itemId}`);
  }

  navigateToNewItem(): void {
    router.push('/item/new');
  }

  navigateToPayment(transactionId: string): void {
    router.push({
      pathname: '/transaction/[id]/pay',
      params: { id: transactionId },
    } as never);
  }

  navigateToTransactionChat(transactionId: string): void {
    router.push({
      pathname: '/transaction/[id]/chat',
      params: { id: transactionId },
    } as never);
  }

  navigateToReview(transactionId: string): void {
    router.push({
      pathname: '/review/[transactionId]',
      params: { transactionId },
    } as never);
  }

  navigateToProfile(): void {
    router.push('/profile');
  }

  navigateToEditProfile(): void {
    router.push('/profile/edit');
  }

  navigateToLogin(): void {
    router.replace('/(auth)/login');
  }

  navigateToRegister(): void {
    router.push('/(auth)/register');
  }

  navigateToHome(): void {
    router.replace('/');
  }

  navigateToTransactions(): void {
    router.push('/transactions');
  }

  navigateToItems(): void {
    router.push('/items');
  }

  navigateToReservation(reservationId: string): void {
    router.push(`/reservations/${reservationId}`);
  }
}

// Export singleton instance
export const expoRouterNavigationService = new ExpoRouterNavigationService();

