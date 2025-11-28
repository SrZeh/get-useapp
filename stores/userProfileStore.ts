/**
 * User Profile Store - Optimized Firestore query management for user profiles
 * 
 * Features:
 * - Caches user profiles by UID
 * - Shares real-time listener for current user
 * - Avoids duplicate profile fetches
 */

import { create } from 'zustand';
import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { onAuthStateChanged } from 'firebase/auth';
import { logger } from '@/utils';
import type { UserProfile } from '@/types';

interface ProfileCache {
  profile: UserProfile;
  timestamp: number;
}

interface UserProfileStore {
  // Cache
  profilesByUid: Map<string, ProfileCache>;
  
  // Current user
  currentUserProfile: UserProfile | null;
  currentUserLoading: boolean;
  currentUserError: Error | null;
  currentUserListener: Unsubscribe | null;
  
  // Actions
  getProfile: (uid: string, forceRefresh?: boolean) => Promise<UserProfile | null>;
  getCurrentUserProfile: () => UserProfile | null;
  subscribeToCurrentUser: () => void;
  unsubscribeFromCurrentUser: () => void;
  invalidateProfile: (uid: string) => void;
  invalidateCurrentUser: () => void;
  setProfile: (uid: string, profile: UserProfile) => void;
  setCurrentUserProfile: (profile: UserProfile | null) => void;
  setCurrentUserLoading: (loading: boolean) => void;
  setCurrentUserError: (error: Error | null) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useUserProfileStore = create<UserProfileStore>((set, get) => ({
  // Initial state
  profilesByUid: new Map(),
  currentUserProfile: null,
  currentUserLoading: false,
  currentUserError: null,
  currentUserListener: null,

  /**
   * Get profile by UID with caching
   */
  getProfile: async (uid: string, forceRefresh = false) => {
    const state = get();
    
    // If it's the current user, return from currentUserProfile
    if (state.currentUserProfile && state.currentUserProfile.uid === uid) {
      return state.currentUserProfile;
    }

    const cached = state.profilesByUid.get(uid);
    const now = Date.now();

    // Return cached profile if still valid
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
      return cached.profile;
    }

    try {
      console.log('[userProfileStore] Fetching profile for uid:', uid, 'from collection:', FIRESTORE_COLLECTIONS.USERS);
      const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
      console.log('[userProfileStore] Document reference created, calling getDoc...');
      
      let snap;
      try {
        snap = await getDoc(userDocRef);
        console.log('[userProfileStore] getDoc completed, snapshot exists:', snap.exists(), 'for uid:', uid);
      } catch (getDocError) {
        console.error('[userProfileStore] Error in getDoc:', getDocError);
        throw getDocError;
      }
      
      if (!snap.exists()) {
        console.warn('[userProfileStore] Profile not found for uid:', uid);
        // Remove from cache if not found
        set((state) => {
          const newCache = new Map(state.profilesByUid);
          newCache.delete(uid);
          return { profilesByUid: newCache };
        });
        return null;
      }

      const data = snap.data();
      console.log('[userProfileStore] Profile data loaded:', { 
        uid: snap.id, 
        hasName: !!data?.name, 
        hasEmail: !!data?.email,
        name: data?.name,
        email: data?.email,
        ratingAvg: data?.ratingAvg,
        allKeys: Object.keys(data || {})
      });
      
      const profile: UserProfile = {
        uid: snap.id,
        ...(data as Partial<UserProfile>),
      } as UserProfile;

      // Update cache
      set((state) => {
        const newCache = new Map(state.profilesByUid);
        newCache.set(uid, { profile, timestamp: now });
        return { profilesByUid: newCache };
      });

      console.log('[userProfileStore] Profile cached and returned:', { uid: profile.uid, name: profile.name });
      return profile;
    } catch (error) {
      console.error('[userProfileStore] Error fetching user profile:', error);
      logger.error('Error fetching user profile', error);
      throw error;
    }
  },

  /**
   * Get current user profile from cache
   */
  getCurrentUserProfile: () => {
    return get().currentUserProfile;
  },

  /**
   * Subscribe to current user profile with real-time updates
   * Only creates one listener that's shared across all components
   * Note: This doesn't return a cleanup function because the store manages the listener lifecycle
   */
  subscribeToCurrentUser: () => {
    const state = get();
    
    // If listener already exists, don't create another
    if (state.currentUserListener) {
      return;
    }

    let stopAuth: (() => void) | null = null;
    let currentUnsub: (() => void) | null = null;

    stopAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listener
      if (currentUnsub) {
        currentUnsub();
        currentUnsub = null;
      }

      if (!user) {
        set({
          currentUserProfile: null,
          currentUserLoading: false,
          currentUserError: null,
          currentUserListener: null,
        });
        return;
      }

      set({ currentUserLoading: true, currentUserError: null });
      logger.debug('Loading profile for user', { uid: user.uid });

      const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, user.uid);
      const unsub = onSnapshot(
        userRef,
        (snap) => {
          if (!snap.exists()) {
            set({
              currentUserProfile: null,
              currentUserLoading: false,
              currentUserError: null,
            });
            return;
          }

          const profile: UserProfile = {
            uid: snap.id,
            ...(snap.data() as Partial<UserProfile>),
          } as UserProfile;

          // Update cache
          const newCache = new Map(get().profilesByUid);
          newCache.set(user.uid, { profile, timestamp: Date.now() });

          set({
            currentUserProfile: profile,
            currentUserLoading: false,
            currentUserError: null,
            profilesByUid: newCache,
          });
        },
        (err) => {
          const error = err instanceof Error ? err : new Error(String(err));
          set({
            currentUserLoading: false,
            currentUserError: error,
          });
          logger.error('Profile snapshot listener error', err);
        }
      );

      currentUnsub = unsub;
      
      // Store combined cleanup function
      const combinedCleanup = () => {
        if (currentUnsub) {
          currentUnsub();
          currentUnsub = null;
        }
        if (stopAuth) {
          stopAuth();
          stopAuth = null;
        }
      };

      set({ currentUserListener: combinedCleanup });
    });
  },

  /**
   * Unsubscribe from current user
   */
  unsubscribeFromCurrentUser: () => {
    const state = get();
    if (state.currentUserListener) {
      state.currentUserListener();
      set({ currentUserListener: null });
    }
  },

  /**
   * Invalidate profile cache
   */
  invalidateProfile: (uid: string) => {
    set((state) => {
      const newCache = new Map(state.profilesByUid);
      newCache.delete(uid);
      
      // Also clear current user if it's the same
      const currentUserProfile = state.currentUserProfile?.uid === uid ? null : state.currentUserProfile;
      
      return {
        profilesByUid: newCache,
        currentUserProfile,
      };
    });
  },

  /**
   * Invalidate current user cache
   */
  invalidateCurrentUser: () => {
    set({ currentUserProfile: null });
    // Force refetch by clearing listener
    const state = get();
    if (state.currentUserListener) {
      state.currentUserListener();
      set({ currentUserListener: null });
    }
    get().subscribeToCurrentUser();
  },

  /**
   * Set profile in cache (useful after mutations)
   */
  setProfile: (uid: string, profile: UserProfile) => {
    set((state) => {
      const newCache = new Map(state.profilesByUid);
      newCache.set(uid, { profile, timestamp: Date.now() });
      
      // Also update current user if it's the same
      const currentUserProfile = state.currentUserProfile?.uid === uid ? profile : state.currentUserProfile;
      
      return {
        profilesByUid: newCache,
        currentUserProfile,
      };
    });
  },

  /**
   * Set current user profile directly
   */
  setCurrentUserProfile: (profile: UserProfile | null) => {
    if (profile) {
      const newCache = new Map(get().profilesByUid);
      newCache.set(profile.uid, { profile, timestamp: Date.now() });
      
      set({
        currentUserProfile: profile,
        profilesByUid: newCache,
      });
    } else {
      set({ currentUserProfile: null });
    }
  },

  /**
   * Set loading state
   */
  setCurrentUserLoading: (loading: boolean) => {
    set({ currentUserLoading: loading });
  },

  /**
   * Set error state
   */
  setCurrentUserError: (error: Error | null) => {
    set({ currentUserError: error });
  },
}));

