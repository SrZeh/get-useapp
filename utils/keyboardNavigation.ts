/**
 * Keyboard navigation utilities for web platform
 * Provides keyboard shortcuts and navigation helpers
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Hook for handling keyboard shortcuts in forms
 * @param handlers - Object mapping key combinations to handler functions
 */
export function useKeyboardShortcuts(handlers: {
  onEnter?: (e: KeyboardEvent) => void;
  onEscape?: (e: KeyboardEvent) => void;
  onSubmit?: (e: KeyboardEvent) => void;
  custom?: Record<string, (e: KeyboardEvent) => void>;
}) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter key to submit forms
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        // Only trigger if not in a textarea or multiline input
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handlers.onEnter?.(e);
          handlers.onSubmit?.(e);
        }
      }

      // Escape key
      if (e.key === 'Escape') {
        handlers.onEscape?.(e);
      }

      // Custom shortcuts
      if (handlers.custom) {
        const key = e.key;
        const keyCode = `${e.ctrlKey ? 'Ctrl+' : ''}${e.metaKey ? 'Cmd+' : ''}${e.shiftKey ? 'Shift+' : ''}${key}`;
        handlers.custom[keyCode]?.(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

/**
 * Hook for keyboard navigation in forms
 * Handles tab navigation, enter to submit, escape to cancel
 */
export function useFormKeyboardNavigation(options: {
  onSubmit?: () => void;
  onCancel?: () => void;
  enabled?: boolean;
}) {
  useKeyboardShortcuts({
    onEnter: (e) => {
      if (options.enabled !== false) {
        const target = e.target as HTMLElement;
        // If focused on submit button or last input, trigger submit
        if (target.tagName === 'BUTTON' || target.type === 'submit') {
          options.onSubmit?.();
        }
      }
    },
    onEscape: () => {
      if (options.enabled !== false) {
        options.onCancel?.();
      }
    },
  });
}

