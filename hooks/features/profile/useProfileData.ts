/**
 * useProfileData - Hook for fetching user profile data
 */

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

export function useProfileData() {
  const uid = auth.currentUser?.uid;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data() as Partial<UserProfile>;
          setUser({ uid, ...data } as UserProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  return { user, loading };
}

