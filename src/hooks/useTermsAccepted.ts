import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import type { UserProfile } from "@/types";

export function useTermsAccepted(user: User | null) {
  const [accepted, setAccepted] = useState<boolean | null>(null); // null = carregando

  useEffect(() => {
    if (!user) { setAccepted(null); return; }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as Partial<UserProfile> | undefined;
      setAccepted(Boolean(data?.termsAcceptedAt));
    }, () => setAccepted(false));
    return () => unsub();
  }, [user]);

  return accepted; // null | true | false
}
