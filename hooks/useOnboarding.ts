// =====================================
// File: hooks/useOnboarding.ts
// =====================================
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useState } from "react";
// Ajuste estes imports conforme seu projeto
// Se já tiver helpers de auth/db, reaproveite
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";


import * as Application from "expo-application";


// Para reaparecer a cada atualização do app e/ou alterações no conteúdo:
// - Usa a versão do app (Application.nativeApplicationVersion)
// - + um CONTENT_VERSION manual para forçar durante dev
const APP_VERSION = Application.nativeApplicationVersion ?? "0";
const CONTENT_VERSION = "6"; // aumente para 2, 3... quando mudar os textos/fluxo
const SECURE_KEY = `onboarding_seen_${APP_VERSION}_c${CONTENT_VERSION}`;


export function useOnboardingVisibility() {
const [visible, setVisible] = useState(false);
const [loading, setLoading] = useState(true);


const auth = useMemo(() => getAuth(), []);
const db = useMemo(() => getFirestore(), []);


useEffect(() => {
let mounted = true;
(async () => {
try {
const local = await SecureStore.getItemAsync(SECURE_KEY);
if (local === "1") {
if (mounted) setVisible(false);
return;
}
const uid = auth.currentUser?.uid;
if (uid) {
const snap = await getDoc(doc(db, "users", uid));
const seen = snap.exists() && Boolean((snap.data() as any)?.onboardingSeenAt);
if (mounted) setVisible(!seen);
} else {
if (mounted) setVisible(true);
}
} finally {
if (mounted) setLoading(false);
}
})();
return () => {
mounted = false;
};
}, [auth, db]);


const markSeen = async (opts?: { termsAccepted?: boolean }) => {
await SecureStore.setItemAsync(SECURE_KEY, "1");
setVisible(false);


const uid = auth.currentUser?.uid;
if (!uid) return;


try {
const payload: any = { onboardingSeenAt: serverTimestamp() };
if (opts?.termsAccepted) payload.termsAcceptedAt = serverTimestamp();
const dbWrite = setDoc(doc(db, "users", uid), payload, { merge: true });
const timeout = new Promise((_res, rej) => setTimeout(() => rej(new Error("fs-timeout")), 2500));
await Promise.race([dbWrite, timeout]).catch(() => undefined);
} catch (_) {
// ignore
}
};


return { visible, loading, markSeen };
}