// functions/src/index.ts
import * as admin from "firebase-admin";
import { App as AdminApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";

const adminApp: AdminApp = initializeApp();
setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

const db = getFirestore(adminApp, "appdb");

// ---------- Helpers ----------
function assertString(x: unknown, name: string): asserts x is string {
  if (typeof x !== "string" || x.trim() === "") {
    throw new HttpsError("invalid-argument", `${name} inválido/ausente.`);
  }
}
function assertISODate(x: unknown, name: string): asserts x is string {
  assertString(x, name);
  const s = x as string;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new HttpsError("invalid-argument", `${name} deve ser YYYY-MM-DD.`);
  }
}
function eachDateKeysExclusive(startISO: string, endISO: string): string[] {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);
  if (!(start < end)) throw new HttpsError("invalid-argument", "Intervalo de datas inválido (start < end).");
  const out: string[] = [];
  for (let t = start; t < end; t += 86_400_000) {
    const d = new Date(t);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    out.push(`${yyyy}-${mm}-${dd}`);
  }
  return out;
}
const TS = () => admin.firestore.FieldValue.serverTimestamp();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new HttpsError(
      "failed-precondition",
      "STRIPE_SECRET_KEY ausente. Defina com: firebase functions:secrets:set STRIPE_SECRET_KEY"
    );
  }
  return new Stripe(key);
}

// =====================================================
// === CONNECT EXPRESS (onboarding JIT)               ===
// =====================================================
export const createAccountLink = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const user = userSnap.exists ? (userSnap.data() as any) : {};
    let accountId: string | undefined = user?.stripeAccountId;

    const stripe = getStripe();

    if (!accountId) {
      const acct = await stripe.accounts.create({
        country: "BR",
        type: "express",
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { appUserUid: uid },
      });
      accountId = acct.id;
      await userRef.set({ stripeAccountId: accountId, updatedAt: TS() }, { merge: true });
    }

    const { refreshUrl, returnUrl } = (data ?? {}) as { refreshUrl?: string; returnUrl?: string };
    if (!refreshUrl || !returnUrl) throw new HttpsError("invalid-argument", "Passe refreshUrl e returnUrl.");

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return { url: link.url, accountId };
  }
);

export const getAccountStatus = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const userRef = db.doc(`users/${uid}`);
    const snap = await userRef.get();
    const user = snap.exists ? (snap.data() as any) : {};
    const accountId: string | undefined = user?.stripeAccountId;

    if (!accountId) {
      return { hasAccount: false, payouts_enabled: false, charges_enabled: false };
    }

    const stripe = getStripe();
    const acct = await stripe.accounts.retrieve(accountId);
    return {
      hasAccount: true,
      accountId,
      payouts_enabled: (acct as any).payouts_enabled ?? false,
      charges_enabled: (acct as any).charges_enabled ?? false,
      requirements: (acct as any).requirements ?? null,
    };
  }
);

// =====================================================
// === Reservas: aceitar / recusar / cancelar etc.    ===
// =====================================================
export const acceptReservation = onCall(async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { reservationId } = (data ?? {}) as { reservationId?: string };
  assertString(reservationId, "reservationId");

  try {
    const result = await db.runTransaction(async (trx) => {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const snap = await trx.get(resRef);
      if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const r = snap.data() as any;

      assertString(r.itemOwnerUid, "itemOwnerUid");
      assertString(r.renterUid, "renterUid");
      assertString(r.itemId, "itemId");
      assertISODate(r.startDate, "startDate");
      assertISODate(r.endDate, "endDate");

      if (r.itemOwnerUid !== uid) throw new HttpsError("permission-denied", "Não é o dono.");
      if (r.status !== "requested") throw new HttpsError("failed-precondition", `Esperado 'requested', atual: '${r.status ?? "?"}'`);

      trx.update(resRef, { status: "accepted", acceptedAt: TS(), updatedAt: TS(), acceptedBy: uid });

      return { ok: true, prevStatus: r.status, newStatus: "accepted" };
    });

    return result;
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Falha interna ao aceitar: ${err?.message ?? "erro desconhecido"}`);
  }
});

export const rejectReservation = onCall(async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { reservationId, reason } = (data ?? {}) as { reservationId?: string; reason?: string };
  assertString(reservationId, "reservationId");

  try {
    const result = await db.runTransaction(async (trx) => {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const snap = await trx.get(resRef);
      if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const r = snap.data() as any;

      assertString(r.itemOwnerUid, "itemOwnerUid");
      if (r.itemOwnerUid !== uid) throw new HttpsError("permission-denied", "Não é o dono.");
      if (r.status !== "requested") throw new HttpsError("failed-precondition", `Esperado 'requested', atual: '${r.status ?? "?"}'`);

      trx.update(resRef, {
        status: "rejected",
        rejectReason: typeof reason === "string" ? reason.slice(0, 300) : null,
        rejectedAt: TS(),
        updatedAt: TS(),
        rejectedBy: uid,
      });

      return { ok: true, prevStatus: r.status, newStatus: "rejected" };
    });

    return result;
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Falha interna ao recusar: ${err?.message ?? "erro desconhecido"}`);
  }
});

export const cancelAcceptedReservation = onCall(async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { reservationId } = (data ?? {}) as { reservationId?: string };
  assertString(reservationId, "reservationId");

  try {
    const result = await db.runTransaction(async (trx) => {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const resSnap = await trx.get(resRef);
      if (!resSnap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const r = resSnap.data() as any;

      assertString(r.itemOwnerUid, "itemOwnerUid");
      assertString(r.renterUid, "renterUid");
      assertString(r.itemId, "itemId");
      assertISODate(r.startDate, "startDate");
      assertISODate(r.endDate, "endDate");

      if (![r.itemOwnerUid, r.renterUid].includes(uid)) throw new HttpsError("permission-denied", "Sem permissão.");

      const now = TS();

      if (r.status === "accepted") {
        trx.update(resRef, { status: "canceled", canceledBy: uid, canceledAt: now, updatedAt: now });
        return { ok: true, unblockedDays: 0 };
      }

      if (r.status === "paid") {
        const days = eachDateKeysExclusive(r.startDate, r.endDate);
        const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");
        for (const d of days) trx.delete(bookedCol.doc(d));
        trx.update(resRef, { status: "canceled", canceledBy: uid, canceledAt: now, updatedAt: now });
        return { ok: true, unblockedDays: days.length };
      }

      throw new HttpsError("failed-precondition", `Somente quando 'accepted' ou 'paid'. Atual: '${r.status ?? "?"}'`);
    });

    return result;
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Falha interna ao cancelar: ${err?.message ?? "erro desconhecido"}`);
  }
});

// =====================================================
// === Stripe Checkout                               ===
// =====================================================
export const createCheckoutSession = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth, data }) => {
    try {
      const uid = auth?.uid;
      if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

      const { reservationId, successUrl, cancelUrl } =
        (data ?? {}) as { reservationId?: string; successUrl?: string; cancelUrl?: string };

      assertString(reservationId, "reservationId");
      assertString(successUrl, "successUrl");
      assertString(cancelUrl, "cancelUrl");

      const isHttp = (u: string) => /^https?:\/\//i.test(u);
      if (!isHttp(successUrl) || !isHttp(cancelUrl)) {
        throw new HttpsError("failed-precondition", "successUrl/cancelUrl devem ser http(s).");
      }

      const resRef = db.doc(`reservations/${reservationId}`);
      const snap = await resRef.get();
      if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const r = snap.data() as any;

      if (r.renterUid !== uid) throw new HttpsError("permission-denied", "Somente o locatário pode pagar.");
      if (r.status !== "accepted") throw new HttpsError("failed-precondition", "Reserva não está 'accepted'.");

      let ownerStripeAccountId: string | undefined = r.ownerStripeAccountId;
      if (!ownerStripeAccountId && r.itemOwnerUid) {
        const ownerSnap = await db.doc(`users/${r.itemOwnerUid}`).get();
        ownerStripeAccountId = ownerSnap.exists ? (ownerSnap.data() as any)?.stripeAccountId : undefined;
        if (ownerStripeAccountId) await resRef.update({ ownerStripeAccountId, updatedAt: TS() });
      }

      const daysCount = (() => {
        try { return eachDateKeysExclusive(r.startDate, r.endDate).length; }
        catch { return Number(r.days) || 1; }
      })();

      function toCents(x: any): number {
        if (typeof x === "number") return Math.round(x * 100);
        if (typeof x === "string") {
          const s = x.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}(,|$))/g, "").replace(",", ".");
          const n = Number(s);
          if (Number.isFinite(n)) return Math.round(n * 100);
        }
        return 0;
      }

      let totalCents = Number.isInteger(r.totalCents) ? Number(r.totalCents) : 0;
      if (!totalCents) totalCents = toCents(r.total) || (Number(r.priceCents) * (Number.isFinite(daysCount) ? daysCount : 1)) || 0;
      if (!Number.isInteger(totalCents) || totalCents <= 0) throw new HttpsError("failed-precondition", "totalCents inválido.");

      const platformFeeCents = Math.floor(totalCents * 0.10);
      const transferGroup = reservationId;

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        success_url: `${successUrl}?res=${reservationId}`,
        cancel_url: `${cancelUrl}?res=${reservationId}`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "BRL",
              product_data: { name: r.itemTitle ?? "Aluguel de item", metadata: { reservationId: String(reservationId) } },
              unit_amount: totalCents,
            },
          },
        ],
        payment_intent_data: {
          transfer_group: transferGroup,
          metadata: {
            reservationId: String(reservationId),
            totalCents: String(totalCents),
            platformFeeCents: String(platformFeeCents),
            ...(ownerStripeAccountId ? { ownerStripeAccountId: String(ownerStripeAccountId) } : {}),
          },
        },
        metadata: { reservationId: String(reservationId), transfer_group: transferGroup, ...(ownerStripeAccountId ? { ownerStripeAccountId: String(ownerStripeAccountId) } : {}) },
        locale: "pt-BR",
      });

      await resRef.update({
        checkoutSessionId: session.id,
        totalCents,
        ...(ownerStripeAccountId ? { ownerStripeAccountId } : {}),
        transferGroup,
        platformFeeCents,
        updatedAt: TS(),
      });

      return { url: session.url };
    } catch (err: any) {
      const msg = err?.message || err?.raw?.message || "Falha ao criar checkout.";
      throw new HttpsError("failed-precondition", msg);
    }
  }
);

// =====================================================
// === Fallback: confirmar sessão e marcar como paid  ===
// =====================================================
export const confirmCheckoutSession = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { reservationId } = (data ?? {}) as { reservationId?: string };
    assertString(reservationId, "reservationId");

    const resRef = db.doc(`reservations/${reservationId}`);
    const snap = await resRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = snap.data() as any;

    if (r.renterUid !== uid) throw new HttpsError("permission-denied", "Somente o locatário pode confirmar.");
    if (r.status === "paid") return { ok: true, already: true };

    const sessionId = r.checkoutSessionId as string | undefined;
    if (!sessionId) throw new HttpsError("failed-precondition", "checkoutSessionId ausente.");

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentStatus = session.payment_status;
    const status = session.status;
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (!(paymentStatus === "paid" || status === "complete")) {
      throw new HttpsError("failed-precondition", `Sessão não paga ainda: ${paymentStatus ?? status ?? "unknown"}`);
    }

    const days = eachDateKeysExclusive(r.startDate, r.endDate);
    const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");

    await db.runTransaction(async (trx) => {
      for (const d of days) {
        const dRef = bookedCol.doc(d);
        const dSnap = await trx.get(dRef);
        if (dSnap.exists) {
          const curr = dSnap.data() as any;
          if (curr.resId && curr.resId !== reservationId) throw new HttpsError("already-exists", `Conflito ${d}`);
        }
      }
      for (const d of days) {
        trx.set(bookedCol.doc(d), { resId: reservationId, renterUid: r.renterUid, itemOwnerUid: r.itemOwnerUid, status: "booked", createdAt: TS() });
      }
      trx.update(resRef, { status: "paid", paidAt: TS(), stripePaymentIntentId: paymentIntentId ?? null, updatedAt: TS() });
    });

    return { ok: true, marked: "paid" };
  }
);

// =====================================================
// === Webhook Stripe: marca paid e bloqueia datas    ===
// =====================================================
export const stripeWebhook = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
    maxInstances: 10,
    secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"],
  },
  async (req, res) => {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      const sig = req.headers["stripe-signature"] as string;
      if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET ausente.");
      const raw = (req as any).rawBody as Buffer;
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err?.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        let reservationId = session.metadata?.reservationId as string | undefined;
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

        if (!reservationId && typeof session.payment_intent !== "string" && session.payment_intent) {
          const pi = session.payment_intent as Stripe.PaymentIntent;
          reservationId = (pi.metadata?.reservationId as string | undefined) ?? undefined;
        }

        if (!reservationId) {
          console.warn("[Webhook] Sem reservationId");
          res.json({ received: true });
          return;
        }

        const resRef = db.doc(`reservations/${reservationId}`);
        const snap = await resRef.get();
        if (!snap.exists) {
          console.warn("[Webhook] Reserva não encontrada:", reservationId);
          res.json({ received: true });
          return;
        }

        const r = snap.data() as any;
        if (r.status === "paid") {
          res.json({ received: true });
          return;
        }

        const days = eachDateKeysExclusive(r.startDate, r.endDate);
        const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");

        await db.runTransaction(async (trx) => {
          for (const d of days) {
            const dRef = bookedCol.doc(d);
            const dSnap = await trx.get(dRef);
            if (dSnap.exists) {
              const curr = dSnap.data() as any;
              if (curr.resId && curr.resId !== reservationId) throw new Error(`Conflito de data ${d}`);
            }
          }
          

for (const day of days) {
  const dayRef = bookedCol.doc(day);
  trx.set(dayRef, {
    resId: reservationId,
    renterUid: r.renterUid,
    itemOwnerUid: r.itemOwnerUid,
    status: "booked",
    createdAt: TS(),
  });
}

trx.update(resRef, {
  status: "paid",
  paidAt: TS(),
  stripePaymentIntentId: paymentIntentId ?? null,
  updatedAt: TS(),
});

        });
      }

      res.json({ received: true });
    } catch (e: any) {
      console.error("[Webhook] Handler error:", e?.message, e);
      res.status(500).send("Webhook handler error");
    }
  }
);


// =====================================================
// === Repasse 90% para o dono (após "Recebido!")     ===
// =====================================================
export const releasePayoutToOwner = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
    const { reservationId } = (data ?? {}) as { reservationId?: string };
    assertString(reservationId, "reservationId");

    const resRef = db.doc(`reservations/${reservationId}`);
    const snap = await resRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = snap.data() as any;

    if (r.itemOwnerUid !== uid) {
      throw new HttpsError("permission-denied", "Somente o dono pode sacar.");
    }
    if (r.status === "paid_out") {
      return { ok: true, alreadyPaidOut: true };
    }

    // ✅ pronto para sacar se status já for picked_up
    // ou se ainda estiver 'paid' mas com pickedUpAt marcado
    const isReady = r.status === "picked_up" || (r.status === "paid" && !!r.pickedUpAt);
    if (!isReady) {
      throw new HttpsError(
        "failed-precondition",
        "Aguardando o locatário marcar 'Recebido!' antes do saque."
      );
    }
    if (r.status !== "picked_up") {
      throw new HttpsError("failed-precondition", "Saque disponível somente após o locatário marcar 'Recebido!'.");
    }

    const totalCents = Number(r.totalCents ?? 0);
    if (!Number.isInteger(totalCents) || totalCents <= 0) {
      throw new HttpsError("failed-precondition", "totalCents inválido.");
    }

    let ownerStripeAccountId: string | undefined = r.ownerStripeAccountId;
    if (!ownerStripeAccountId) {
      const ownerSnap = await db.doc(`users/${r.itemOwnerUid}`).get();
      ownerStripeAccountId = ownerSnap.exists ? (ownerSnap.data() as any)?.stripeAccountId : undefined;
      if (ownerStripeAccountId) {
        await resRef.update({ ownerStripeAccountId, updatedAt: TS() });
      }
    }
    if (!ownerStripeAccountId) {
      throw new HttpsError("failed-precondition", "Crie/complete sua conta Stripe para sacar.");
    }

    const transferAmount = Math.floor(totalCents * 0.90);
    const transferGroup = r.transferGroup || reservationId;

    const stripe = getStripe();
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: "BRL",
      destination: ownerStripeAccountId!,
      transfer_group: transferGroup,
      metadata: { reservationId: String(reservationId), role: "owner_payout" },
    });

    await resRef.update({
      ownerPayoutTransferId: transfer.id,
      status: "paid_out",
      paidOutAt: TS(),
      updatedAt: TS(),
    });

    return { ok: true, transferId: transfer.id, amount: transferAmount };
  }
);


// =====================================================
// === Locatário marca "Recebido!" (picked_up)        ===
// =====================================================
export const markPickup = onCall(
  { region: "southamerica-east1" },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { reservationId } = (data ?? {}) as { reservationId?: string };
    assertString(reservationId, "reservationId");

    const resRef = db.doc(`reservations/${reservationId}`);
    const snap = await resRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = snap.data() as any;

    if (r.renterUid !== uid) {
      throw new HttpsError("permission-denied", "Somente o locatário pode confirmar recebimento.");
    }
    // permite repetir sem erro
    if (r.status === "picked_up") return { ok: true, already: true };
    if (r.status !== "paid") {
      throw new HttpsError("failed-precondition", "Reserva precisa estar 'paid' para marcar recebido.");
    }

    // marca recebimento + vincula item
    await resRef.set(
      { status: "picked_up", pickedUpAt: TS(), pickedUpBy: uid, updatedAt: TS() },
      { merge: true }
    );
    await db.doc(`items/${r.itemId}`).set(
      { currentReservationId: reservationId, lastPickedUpAt: TS(), updatedAt: TS() },
      { merge: true }
    );

    return { ok: true };
  }
);



// =====================================================
// === Stripe Express: link de login do dono          ===
// =====================================================
export const createExpressLoginLink = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const userRef = db.doc(`users/${uid}`);
    const snap = await userRef.get();
    const acctId = snap.exists ? (snap.data() as any)?.stripeAccountId : undefined;
    assertString(acctId, "stripeAccountId");

    const stripe = getStripe();
    const link = await stripe.accounts.createLoginLink(acctId);
    return { url: link.url };
  }
);

// =====================================================
// === Confirmar devolução (dono)                     ===
// =====================================================
export const confirmReturn = onCall(
  { region: "southamerica-east1", secrets: ["STRIPE_SECRET_KEY"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { reservationId, photoUrl } = (data ?? {}) as { reservationId?: string; photoUrl?: string };
    if (typeof reservationId !== "string" || !reservationId.trim()) {
      throw new HttpsError("invalid-argument", "reservationId inválido/ausente.");
    }
    if (typeof photoUrl !== "string" || !photoUrl.trim()) {
      throw new HttpsError("invalid-argument", "photoUrl inválido/ausente.");
    }

    const resRef = db.doc(`reservations/${reservationId}`);
    const resSnap = await resRef.get();
    if (!resSnap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = resSnap.data() as any;

    if (r.itemOwnerUid !== uid) throw new HttpsError("permission-denied", "Somente o dono pode confirmar devolução.");
    if (!(r.status === "paid_out" || (r.status === "paid" && r.pickedUpAt))) {
      throw new HttpsError("failed-precondition", "Reserve precisa estar 'paid_out' ou ter sido retirada.");
    }

    const itemRef = db.doc(`items/${r.itemId}`);

    await db.runTransaction(async (trx) => {
      const itemSnap = await trx.get(itemRef);
      const old = itemSnap.exists ? (itemSnap.data() as any) : {};
      const oldPhotos: string[] = Array.isArray(old.photos) ? old.photos : [];
      const newPhotos = [photoUrl, ...oldPhotos.filter((p) => p && p !== photoUrl)].slice(0, 10);

      trx.set(
        itemRef,
        { photos: newPhotos, currentReservationId: null, lastReturnedAt: TS(), updatedAt: TS() },
        { merge: true }
      );

      trx.update(resRef, {
        status: "returned",
        returnedAt: TS(),
        returnPhotoUrl: photoUrl,
        reviewsOpen: {
          renterCanReviewOwner: true,
          ownerCanReviewRenter: true,
          renterCanReviewItem: true,
        },
        updatedAt: TS(),
      });
    });

    return { ok: true };
  }
);
