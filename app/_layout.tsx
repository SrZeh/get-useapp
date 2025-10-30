/**
 * Root Layout - Expo Router Entry Point
 * 
 * Thin route wrapper that composes providers and layout component.
 * Follows thin route pattern - delegates UI to AppContent component.
 */

import 'react-native-reanimated';
import React from 'react';
import { AppProviders } from '@/providers/AppProviders';
import { AppContent } from '@/components/layouts';


/**
 * RootLayout - Root component for Expo Router
 * Wraps app with all required providers and delegates to AppContent component
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
