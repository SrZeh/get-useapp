/**
 * Services Provider
 * 
 * Provides service dependencies via React Context following Dependency Inversion Principle (DIP)
 * and Open/Closed Principle (OCP). Allows services to be swapped for testing or different implementations.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type {
  IItemService,
  IReservationService,
  IReviewService,
  INavigationService,
} from '@/services/interfaces';
import {
  firebaseItemService,
  firebaseReservationService,
  firebaseReviewService,
  expoRouterNavigationService,
} from '@/services/implementations';

/**
 * Services context value
 */
interface ServicesContextValue {
  itemService: IItemService;
  reservationService: IReservationService;
  reviewService: IReviewService;
  navigationService: INavigationService;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

/**
 * ServicesProvider Props
 */
export interface ServicesProviderProps {
  children: ReactNode;
  /**
   * Optional service implementations (for testing or custom implementations)
   * If not provided, uses default Firebase implementations
   */
  services?: Partial<ServicesContextValue>;
}

/**
 * Services Provider Component
 * 
 * Provides services via context. Allows dependency injection for testing or
 * swapping implementations without modifying components.
 * 
 * @example
 * ```tsx
 * // Production use (default Firebase services)
 * <ServicesProvider>
 *   <App />
 * </ServicesProvider>
 * 
 * // Testing use (mock services)
 * <ServicesProvider services={{ itemService: mockItemService }}>
 *   <App />
 * </ServicesProvider>
 * ```
 */
export function ServicesProvider({ children, services }: ServicesProviderProps) {
  const value = useMemo<ServicesContextValue>(
    () => ({
      itemService: services?.itemService ?? firebaseItemService,
      reservationService: services?.reservationService ?? firebaseReservationService,
      reviewService: services?.reviewService ?? firebaseReviewService,
      navigationService: services?.navigationService ?? expoRouterNavigationService,
    }),
    [services]
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

/**
 * Hook to access services from context
 * 
 * @throws Error if used outside of ServicesProvider
 * @returns Services object with itemService, reservationService, and reviewService
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { itemService, reservationService } = useServices();
 *   
 *   const handleCreate = async () => {
 *     const result = await itemService.createItem(input);
 *   };
 * }
 * ```
 */
export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext);
  
  if (!context) {
    throw new Error(
      'useServices must be used within a ServicesProvider. ' +
      'Wrap your app with <ServicesProvider> in the root layout.'
    );
  }
  
  return context;
}

/**
 * Hook to access item service specifically
 */
export function useItemService(): IItemService {
  const { itemService } = useServices();
  return itemService;
}

/**
 * Hook to access reservation service specifically
 */
export function useReservationService(): IReservationService {
  const { reservationService } = useServices();
  return reservationService;
}

/**
 * Hook to access review service specifically
 */
export function useReviewService(): IReviewService {
  const { reviewService } = useServices();
  return reviewService;
}

/**
 * Hook to access navigation service specifically
 */
export function useNavigationService(): INavigationService {
  const { navigationService } = useServices();
  return navigationService;
}

