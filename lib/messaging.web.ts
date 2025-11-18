// lib/messaging.web.ts
import { app } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

/**
 * Registra Web Push (FCM) no navegador e salva o token no backend
 * Requer:
 * - Service worker em /firebase-messaging-sw.js
 * - EXPO_PUBLIC_FCM_VAPID_KEY definido
 */
export async function registerWebPushToken(): Promise<{ ok: boolean; token?: string }> {
  const supported = await isSupported().catch(() => false);
  if (!supported) return { ok: false };

  const vapidKey = process.env.EXPO_PUBLIC_FCM_VAPID_KEY as string | undefined;
  if (!vapidKey) {
    console.warn("EXPO_PUBLIC_FCM_VAPID_KEY ausente. Pulei web push.");
    return { ok: false };
  }

  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: await navigator.serviceWorker.ready });
    if (!token) return { ok: false };

    const fns = getFunctions(app, "southamerica-east1");
    const call = httpsCallable<{ token: string }, { ok: true }>(fns, "saveWebPushToken");
    await call({ token });

    return { ok: true, token };
  } catch (e) {
    console.warn("Falha ao registrar web push token", e);
    return { ok: false };
  }
}


