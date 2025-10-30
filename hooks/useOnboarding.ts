// hooks/useOnboarding.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Application from "expo-application";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "expo-router";        // ⬅️ novo
import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useUserProfileStore } from "@/stores/userProfileStore";

const APP_VERSION = Application.nativeApplicationVersion ?? "0";
const CONTENT_VERSION = "15";
const SECURE_KEY = `onboarding_seen_${APP_VERSION}_c${CONTENT_VERSION}`;

// ⬇️ lock de sessão (somente memória; reseta em reload)
let ONBOARDING_SHOWN_THIS_SESSION = false;

export function useOnboardingVisibility() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();                 // ⬅️ rota atual
  const initedRef = useRef(false);                // evita rodar 2x o efeito

  // Get profile from store (shared listener, no duplicate query!)
  const currentUserProfile = useUserProfileStore((state) => state.currentUserProfile);
  const currentUserLoading = useUserProfileStore((state) => state.currentUserLoading);
  const getProfile = useUserProfileStore((state) => state.getProfile);
  const subscribeToCurrentUser = useUserProfileStore((state) => state.subscribeToCurrentUser);

  // Subscribe to current user profile (shared listener)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      subscribeToCurrentUser();
    }
  }, [subscribeToCurrentUser]);

  useEffect(() => {
    // ⬅️ não mostrar onboarding na página de termos (rota ou pdf)
    const lower = (pathname || "").toLowerCase();
    const isTerms = lower.includes("/termosdeuso") || lower.endsWith(".pdf");
    if (isTerms) {
      setVisible(false);
      setLoading(false);
      return;
    }
    // se já abriu nesta sessão, não reabrir
    if (ONBOARDING_SHOWN_THIS_SESSION) {
      setVisible(false);
      setLoading(false);
      return;
    }
    if (initedRef.current) return; // proteção extra
    initedRef.current = true;

    (async () => {
      try {
        // web: localStorage | nativo: SecureStore
        let local: string | null = null;
        if (Platform.OS === "web") {
          try { local = window.localStorage.getItem(SECURE_KEY); } catch {}
        } else {
          local = await SecureStore.getItemAsync(SECURE_KEY);
        }

        if (local === "1") { setVisible(false); return; }

        const uid = auth.currentUser?.uid;
        if (uid) {
          // Get from cache or fetch if not cached (no duplicate query!)
          const profile = await getProfile(uid, false);
          const seen = Boolean(profile?.onboardingSeenAt);
          setVisible(!seen);
          if (!seen) ONBOARDING_SHOWN_THIS_SESSION = true;   // ⬅️ marca sessão
        } else {
          setVisible(false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [pathname, getProfile]); // ⬅️ reavalia ao trocar de rota (e suprime em /termosdeuso)

  const markSeen = async (opts?: { termsAccepted?: boolean }) => {
    // grava flag local
    if (Platform.OS === "web") {
      try { window.localStorage.setItem(SECURE_KEY, "1"); } catch {}
    } else {
      await SecureStore.setItemAsync(SECURE_KEY, "1");
    }
    setVisible(false);

    // tenta marcar no perfil (sem travar a UI)
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const payload: Partial<UserProfile> & { onboardingSeenAt?: ReturnType<typeof serverTimestamp>; termsAcceptedAt?: ReturnType<typeof serverTimestamp> } = { 
        onboardingSeenAt: serverTimestamp() 
      };
      if (opts?.termsAccepted) payload.termsAcceptedAt = serverTimestamp();
      const write = setDoc(doc(db, "users", uid), payload, { merge: true });
      const timeout = new Promise((_r, rej) => setTimeout(() => rej(new Error("fs-timeout")), 2500));
      await Promise.race([write, timeout]).catch(() => undefined);
    } catch {}
  };

  return { visible, loading, markSeen };
}
