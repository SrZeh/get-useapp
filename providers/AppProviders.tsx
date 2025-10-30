/**
 * AppProviders - Composite Provider Component
 * 
 * Consolidates all app-level providers into a single component.
 * This reduces nesting depth in the root layout and improves maintainability.
 * 
 * Provider order matters:
 * 1. ErrorBoundary - Must wrap everything to catch errors
 * 2. AuthProvider - Required by ServicesProvider and other providers
 * 3. ServicesProvider - Provides business logic services
 * 4. ThemeProvider - Provides theme context
 * 5. SidebarProvider - Provides sidebar state management
 * 
 * Usage:
 * ```tsx
 * <AppProviders>
 *   <AppContent />
 * </AppProviders>
 * ```
 */

import React, { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/providers/AuthProvider';
import { ServicesProvider } from '@/providers/ServicesProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { composeProviders } from './composeProviders';
import { IconFontsProvider } from './IconFontsProvider';

// Compose all providers in the correct dependency order
const ComposedProviders = composeProviders(
  IconFontsProvider,
  ErrorBoundary,
  AuthProvider,
  ServicesProvider,
  ThemeProvider,
  SidebarProvider,
);

/**
 * AppProviders Component
 * 
 * Wraps the app with all required providers in the correct order.
 * All provider logic is consolidated here, making it easier to:
 * - Test provider composition
 * - Mock providers for testing
 * - Add/remove providers without touching root layout
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <ComposedProviders>{children}</ComposedProviders>;
}

