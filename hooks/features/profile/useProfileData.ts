/**
 * useProfileData - Hook for fetching user profile data
 * 
 * Now uses Zustand store for optimized query management:
 * - Shares real-time listener across components
 * - Caches profile to avoid duplicate queries
 * - Optimizes Firestore reads
 */

import { useEffect } from 'react';
import { useUserProfileStore } from '@/stores/userProfileStore';
import type { UserProfile } from '@/types';

export function useProfileData() {
  // Get data from Zustand store
  const user = useUserProfileStore((state) => state.currentUserProfile);
  const loading = useUserProfileStore((state) => state.currentUserLoading);
  const subscribeToCurrentUser = useUserProfileStore((state) => state.subscribeToCurrentUser);
  const unsubscribeFromCurrentUser = useUserProfileStore((state) => state.unsubscribeFromCurrentUser);

  // Subscribe to current user profile on mount
  useEffect(() => {
    subscribeToCurrentUser();
    
    return () => {
      // Note: We don't unsubscribe here because other components might be using the listener
      // The store manages the listener lifecycle
    };
  }, [subscribeToCurrentUser]);

  return { user, loading };
}

