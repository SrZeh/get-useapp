/**
 * Provider Composition Utility
 * 
 * Composes multiple providers into a single component, reducing nesting depth
 * and improving maintainability. Follows React best practices for provider composition.
 * 
 * @example
 * ```tsx
 * const AppProviders = composeProviders(
 *   ErrorBoundary,
 *   AuthProvider,
 *   ServicesProvider,
 *   ThemeProvider
 * );
 * 
 * <AppProviders>
 *   <App />
 * </AppProviders>
 * ```
 */

import React, { type ComponentType, type ReactNode } from 'react';

type ProviderProps = { children: ReactNode };

/**
 * Composes multiple providers into a single component
 * 
 * Providers are composed in the order provided, with the first provider
 * as the outermost wrapper. This maintains the dependency order required
 * for context consumption.
 * 
 * @param providers - Array of provider components to compose
 * @returns A single component that wraps children with all providers
 */
export function composeProviders(...providers: ComponentType<ProviderProps>[]): ComponentType<ProviderProps> {
  return function ComposedProviders({ children }: ProviderProps) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
}

