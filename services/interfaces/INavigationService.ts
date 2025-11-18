/**
 * Navigation Service Interface
 * 
 * Defines the contract for navigation operations.
 * Allows for easy swapping of implementations and mocking in tests.
 */

/**
 * Navigation parameters for routes with dynamic segments
 */
export type NavigationParams = Record<string, string | number | boolean | undefined>;

/**
 * Navigation options
 */
export type NavigationOptions = {
  replace?: boolean;
};

/**
 * Navigation Service Interface
 */
export interface INavigationService {
  /**
   * Navigate to a route
   * @param pathname - Route pathname (e.g., '/item/[id]', '/item/new')
   * @param params - Optional route parameters
   * @param options - Optional navigation options
   */
  navigate(pathname: string, params?: NavigationParams, options?: NavigationOptions): void;

  /**
   * Navigate back to previous screen
   */
  goBack(): void;

  /**
   * Replace current route (replaces history entry)
   * @param pathname - Route pathname
   * @param params - Optional route parameters
   */
  replace(pathname: string, params?: NavigationParams): void;

  /**
   * Navigate to item details screen
   * @param itemId - Item ID
   */
  navigateToItem(itemId: string): void;

  /**
   * Navigate to edit item screen
   * @param itemId - Item ID
   */
  navigateToEditItem(itemId: string): void;

  /**
   * Navigate to new item screen
   */
  navigateToNewItem(): void;

  /**
   * Navigate to transaction/payment screen
   * @param transactionId - Transaction/reservation ID
   */
  navigateToPayment(transactionId: string): void;

  /**
   * Navigate to transaction/chat screen
   * @param transactionId - Transaction/reservation ID
   */
  navigateToTransactionChat(transactionId: string): void;

  /**
   * Navigate to review screen
   * @param transactionId - Transaction/reservation ID
   */
  navigateToReview(transactionId: string): void;

  /**
   * Navigate to owner review screen (avaliar locatário)
   * @param transactionId - Transaction/reservation ID
   */
  navigateToOwnerReview(transactionId: string): void;

  /**
   * Navigate to profile screen
   */
  navigateToProfile(): void;

  /**
   * Navigate to edit profile screen
   */
  navigateToEditProfile(): void;

  /**
   * Navigate to login screen
   */
  navigateToLogin(): void;

  /**
   * Navigate to registration screen
   */
  navigateToRegister(): void;

  /**
   * Navigate to tabs home screen
   */
  navigateToHome(): void;

  /**
   * Navigate to transactions screen
   */
  navigateToTransactions(): void;

  /**
   * Navigate to items management screen
   */
  navigateToItems(): void;

  /**
   * Navigate to reservation details
   * @param reservationId - Reservation ID
   */
  navigateToReservation(reservationId: string): void;
}

