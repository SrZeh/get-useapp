/**
 * useTermsAccepted - Hook to check if user has accepted terms
 * 
 * Now optimized: Uses userProfileStore instead of creating separate listener!
 * 
 * Returns acceptance status for the current user's terms.
 */

import { useEffect, useState } from "react";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { User } from "firebase/auth";

export function useTermsAccepted(user: User | null) {
  const [accepted, setAccepted] = useState<boolean | null>(null); // null = loading

  // Get current user profile from store (shared listener)
  const currentUserProfile = useUserProfileStore((state) => state.currentUserProfile);
  const currentUserLoading = useUserProfileStore((state) => state.currentUserLoading);
  const subscribeToCurrentUser = useUserProfileStore((state) => state.subscribeToCurrentUser);

  // Subscribe to current user profile (shared listener)
  useEffect(() => {
    if (user) {
      subscribeToCurrentUser();
    }
  }, [user, subscribeToCurrentUser]);

  // Update accepted status from profile
  useEffect(() => {
    if (!user) {
      setAccepted(null);
      return;
    }

    if (currentUserLoading) {
      setAccepted(null);
      return;
    }

    if (currentUserProfile) {
      setAccepted(Boolean(currentUserProfile.termsAcceptedAt));
    } else {
      setAccepted(false);
    }
  }, [user, currentUserProfile, currentUserLoading]);

  return accepted; // null | true | false
}
