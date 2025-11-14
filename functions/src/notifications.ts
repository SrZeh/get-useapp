import * as admin from "firebase-admin";
import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const adminApp = getApps().length ? getApp() : initializeApp();
const db = getFirestore(adminApp, "appdb");
const TS = () => admin.firestore.FieldValue.serverTimestamp();

type NotificationType =
  | "message"
  | "reservation_request"
  | "reservation_status"
  | "payment_update"
  | "review"
  | "system";

type CounterKey = "messages" | "reservations" | "payments" | "interactions";

function mapTypeToCounter(type: NotificationType): CounterKey {
  switch (type) {
    case "message":
      return "messages";
    case "reservation_request":
    case "reservation_status":
      return "reservations";
    case "payment_update":
      return "payments";
    default:
      return "interactions";
  }
}

export async function createNotification(input: {
  recipientId: string;
  type: NotificationType;
  entityType?: "thread" | "reservation" | "payment" | "item" | "user" | "system";
  entityId?: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const { recipientId, type, entityType, entityId, title, body, metadata } = input;
  if (!recipientId || !type) return "";

  const notifRef = db.collection("notifications").doc();
  const doc = {
    recipientId,
    type,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    title: title ?? null,
    body: body ?? null,
    metadata: metadata ?? null,
    createdAt: TS(),
    read: false,
  };

  const countersRef = db.doc(`users/${recipientId}/counters/__root__`);

  const counterKey = mapTypeToCounter(type);

  await db.runTransaction(async (trx) => {
    trx.set(notifRef, doc, { merge: false });

    const snap = await trx.get(countersRef);
    const curr = snap.exists ? (snap.data() as any) : {};
    const updated = {
      messages: Number(curr.messages ?? 0) + (counterKey === "messages" ? 1 : 0),
      reservations: Number(curr.reservations ?? 0) + (counterKey === "reservations" ? 1 : 0),
      payments: Number(curr.payments ?? 0) + (counterKey === "payments" ? 1 : 0),
      interactions: Number(curr.interactions ?? 0) + (counterKey === "interactions" ? 1 : 0),
    };
    const total = updated.messages + updated.reservations + updated.payments + updated.interactions;

    trx.set(
      countersRef,
      {
        ...updated,
        total,
        updatedAt: TS(),
      },
      { merge: true }
    );
  });

  return notifRef.id;
}

// ============== markAsSeen callable ==============
export const markAsSeenCallable = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

  const { type } = (data ?? {}) as { type?: CounterKey };
  if (!type) throw new HttpsError("invalid-argument", "Informe o tipo para limpar: messages|reservations|payments|interactions");

  const userMetaRef = db.doc(`users/${uid}`);
  const countersRef = db.doc(`users/${uid}/counters/__root__`);

  await db.runTransaction(async (trx) => {
    trx.set(
      userMetaRef,
      {
        lastSeenAt: { [type]: TS() },
        updatedAt: TS(),
      },
      { merge: true }
    );

    const cs = await trx.get(countersRef);
    const curr = cs.exists ? (cs.data() as any) : {};

    const updated = {
      messages: type === "messages" ? 0 : Number(curr.messages ?? 0),
      reservations: type === "reservations" ? 0 : Number(curr.reservations ?? 0),
      payments: type === "payments" ? 0 : Number(curr.payments ?? 0),
      interactions: type === "interactions" ? 0 : Number(curr.interactions ?? 0),
    };
    const total = updated.messages + updated.reservations + updated.payments + updated.interactions;

    trx.set(
      countersRef,
      {
        ...updated,
        total,
        updatedAt: TS(),
      },
      { merge: true }
    );
  });

  return { ok: true };
});

// ============== External notifications (email + web push) ==============

async function getUserContactAndPrefs(uid: string): Promise<{
  email?: string | null;
  prefs?: any;
  webPushTokens?: string[];
}> {
  const ref = db.doc(`users/${uid}`);
  const snap = await ref.get();
  if (!snap.exists) return {};
  const u = snap.data() as any;
  const webPushTokens: string[] = Array.isArray(u?.webPushTokens) ? u.webPushTokens.filter(Boolean) : [];
  return {
    email: u?.email ?? null,
    prefs: u?.preferences?.notifications ?? {},
    webPushTokens,
  };
}

async function sendEmail(recipientEmail: string, subject: string, text: string, html?: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM || "no-reply@getanduse.app";
  if (!apiKey) throw new Error("SENDGRID_API_KEY ausente.");

  const payload = {
    personalizations: [{ to: [{ email: recipientEmail }] }],
    from: { email: from, name: "Get & Use" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html || `<p>${text}</p>` },
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid error: ${res.status} - ${body}`);
  }
}

async function sendWebPushFCM(tokens: string[], title: string, body: string, deepLink?: string) {
  if (!tokens.length) return;
  try {
    await admin.messaging().sendMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        fcmOptions: deepLink ? { link: deepLink } : undefined,
      },
      data: deepLink ? { link: deepLink } : undefined,
    });
  } catch (e) {
    console.warn("FCM webpush failed", e);
  }
}

export async function dispatchExternalNotify(
  recipientId: string,
  data: { type: NotificationType; title: string; body: string; deepLink?: string }
) {
  const { email, prefs, webPushTokens } = await getUserContactAndPrefs(recipientId);

  const prefKey =
    data.type === "message" ? "message" :
    data.type === "reservation_request" || data.type === "reservation_status" ? "reservation" :
    data.type === "payment_update" ? "payment" :
    data.type === "review" ? "review" : "system";

  const emailAllowed = prefs?.email?.[prefKey] !== false; // padrão ligado
  const webPushEnabled = prefs?.webPush?.enabled === true && prefs?.webPush?.[prefKey] !== false;

  const ops: Promise<any>[] = [];

  if (emailAllowed && email) {
    ops.push(sendEmail(email, data.title, data.body, undefined).catch((e) => console.warn("email failed", e)));
  }

  if (webPushEnabled && Array.isArray(webPushTokens) && webPushTokens.length) {
    ops.push(sendWebPushFCM(webPushTokens, data.title, data.body, data.deepLink));
  }

  if (ops.length) await Promise.all(ops);
}

// ============== save web push token (FCM) ==============
export const saveWebPushTokenCallable = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

  const { token } = (data ?? {}) as { token?: string };
  if (typeof token !== "string" || !token.trim()) {
    throw new HttpsError("invalid-argument", "Token inválido.");
  }

  const userRef = db.doc(`users/${uid}`);
  await userRef.set(
    {
      webPushTokens: admin.firestore.FieldValue.arrayUnion(token),
      updatedAt: TS(),
    },
    { merge: true }
  );

  return { ok: true };
});


