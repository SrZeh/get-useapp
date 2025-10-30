/**
 * SidebarProvider - Manages sidebar open/close state
 * 
 * Provides global sidebar state that can be controlled from anywhere in the app,
 * particularly from the header burger button and the sidebar itself.
 * 
 * Usage:
 * ```tsx
 * const { isOpen, open, close, toggle } = useSidebar();
 * ```
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SidebarContextValue {
  /** Whether the sidebar is currently open */
  isOpen: boolean;
  /** Open the sidebar */
  open: () => void;
  /** Close the sidebar */
  close: () => void;
  /** Toggle the sidebar open/closed */
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

/**
 * SidebarProvider Component
 * 
 * Wraps the app with sidebar state management.
 * Provides open, close, and toggle functions to control sidebar visibility.
 */
export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value: SidebarContextValue = {
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * useSidebar Hook
 * 
 * Access sidebar state and controls.
 * 
 * @throws {Error} If used outside SidebarProvider
 * 
 * @example
 * ```tsx
 * const { isOpen, toggle } = useSidebar();
 * 
 * return (
 *   <TouchableOpacity onPress={toggle}>
 *     <Text>{isOpen ? 'Close' : 'Open'} Sidebar</Text>
 *   </TouchableOpacity>
 * );
 * ```
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
