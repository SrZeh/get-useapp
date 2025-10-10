// functions/src/index.ts
import * as admin from "firebase-admin";
import { App as AdminApp, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";


import { computeFees } from "./fees";



const adminApp: AdminApp = initializeApp();
setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

// Firestore (usar o DB "appdb")
const db = getFirestore(adminApp, "appdb");

// ----------------- Helpers -----------------
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

function toCents(x: any): number {
  if (typeof x === "number") return Math.round(x * 100);
  if (typeof x === "string") {
    const s = x.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}(,|$))/g, "").replace(",", ".");
    const n = Number(s);
    if (Number.isFinite(n)) return Math.round(n * 100);
  }
  return 0;
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new HttpsError(
      "failed-precondition",
      "STRIPE_SECRET_KEY ausente. Defina com: firebase functions:secrets:set STRIPE_SECRET_KEY"
    );
  }
  // sem apiVersion explicit para evitar conflitos de tipagem
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
// === Stripe Checkout (Destination Charges)         ===
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

      // === cálculo do valor base (anúncio) ===
      const daysCount = (() => {
        try { return eachDateKeysExclusive(r.startDate, r.endDate).length; }
        catch { return Number(r.days) || 1; }
      })();

      // Se já existir baseAmountCents na reserva, respeitamos; senão derivamos de priceCents * days
      let baseCents = Number(r.baseAmountCents);
      if (!Number.isInteger(baseCents) || baseCents <= 0) {
        const unit = Number(r.priceCents) || toCents(r.total) || 0;
        baseCents = unit * (Number.isFinite(daysCount) ? daysCount : 1);
      }
      if (!Number.isInteger(baseCents) || baseCents <= 0) {
        throw new HttpsError("failed-precondition", "Valor base inválido.");
      }

      // breakdown: 5% serviço + sobretaxa Stripe (3,99% + R$0,39 gross-up)
      const { serviceFee, surcharge, appFeeFromBase, ownerPayout, totalToCustomer } =
        computeFees(baseCents, { stripePct: 0.0399, stripeFixedCents: 39 });

      // garantir que temos o accountId do dono salvo (para etapas futuras/payout)
      let ownerStripeAccountId: string | undefined = r.ownerStripeAccountId;
      if (!ownerStripeAccountId && r.itemOwnerUid) {
        const ownerSnap = await db.doc(`users/${r.itemOwnerUid}`).get();
        ownerStripeAccountId = ownerSnap.exists ? (ownerSnap.data() as any)?.stripeAccountId : undefined;
        if (ownerStripeAccountId) await resRef.update({ ownerStripeAccountId, updatedAt: TS() });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "brl",
        payment_method_types: ["card", "pix"], // Pix aparece se estiver ativo no Dashboard
        success_url: `${successUrl}?res=${reservationId}`,
        cancel_url: `${cancelUrl}?res=${reservationId}`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "brl",
              product_data: {
                name: r.itemTitle ?? "Aluguel de item",
                metadata: { reservationId: String(reservationId) },
              },
              unit_amount: baseCents,
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: "brl",
              product_data: { name: "Taxa de serviço Get & Use (5%)" },
              unit_amount: serviceFee,
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: "brl",
              product_data: { name: "Taxa de processamento" },
              unit_amount: surcharge,
            },
          },
        ],
        metadata: {
          reservationId: String(reservationId),
          ownerStripeAccountId: String(ownerStripeAccountId ?? ""),
          baseCents: String(baseCents),
          serviceFee: String(serviceFee),
          surcharge: String(surcharge),
          appFeeFromBase: String(appFeeFromBase),
          ownerPayout: String(ownerPayout),
        },
        locale: "pt-BR",
      });

      await resRef.set({
        checkoutSessionId: session.id,
        // mantém totalCents para compat (mas agora total do checkout):
        totalCents: totalToCustomer,
        // novo breakdown:
        baseAmountCents: baseCents,
        serviceFeeCents: serviceFee,
        stripeSurchargeCents: surcharge,
        appFeeFromBaseCents: appFeeFromBase,
        expectedOwnerPayoutCents: ownerPayout,
        ownerStripeAccountId,
        updatedAt: TS(),
      }, { merge: true });

      return { url: session.url };
    } catch (err: any) {
      const msg = err?.message || err?.raw?.message || "Falha ao criar checkout.";
      throw new HttpsError("failed-precondition", msg);
    }
  }
);


// =====================================================
// === Confirmar sessão manualmente (fallback)        ===
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
          res.json({ received: true }); return;
        }

        const resRef = db.doc(`reservations/${reservationId}`);
        const snap = await resRef.get();
        if (!snap.exists) {
          console.warn("[Webhook] Reserva não encontrada:", reservationId);
          res.json({ received: true }); return;
        }

        const r = snap.data() as any;
        if (r.status === "paid") {
          res.json({ received: true }); return;
        }

        // opcional: coletar método de pagamento para mensagem de previsão
        let paymentMethodType: string | null = null;
        if (paymentIntentId) {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          const chargeId = typeof pi.latest_charge === "string"
            ? pi.latest_charge
            : (pi.latest_charge as Stripe.Charge | null)?.id;
          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId);
            // @ts-ignore
            paymentMethodType = charge.payment_method_details?.type ?? null;
          }
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
            paymentMethodType: paymentMethodType,
            updatedAt: TS(),
          });
        });
      }

      res.json({ received: true }); return;
    } catch (e: any) {
      console.error("[Webhook] Handler error:", e?.message, e);
      res.status(500).send("Webhook handler error");
    }
  }
);

// =====================================================
// === Repasse 90% para o dono (LEGADO)              ===
// =====================================================
// Mantenha apenas para reservas antigas feitas em "separate charges & transfers".
// Para novas reservas (destination charges), NÃO usar.
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

    if (r.itemOwnerUid !== uid) throw new HttpsError("permission-denied", "Somente o dono pode sacar.");
    if (r.status === "paid_out") return { ok: true, alreadyPaidOut: true };

    // apenas se já retirado
    if (!(r.status === "picked_up" || (r.status === "paid" && !!r.pickedUpAt))) {
      throw new HttpsError("failed-precondition", "Aguardando o locatário marcar 'Recebido!'.");
    }

    const baseCents = Number(r.baseAmountCents ?? 0);
    if (!Number.isInteger(baseCents) || baseCents <= 0) {
      throw new HttpsError("failed-precondition", "baseAmountCents inválido.");
    }

    let ownerStripeAccountId: string | undefined = r.ownerStripeAccountId;
    if (!ownerStripeAccountId) {
      const ownerSnap = await db.doc(`users/${r.itemOwnerUid}`).get();
      ownerStripeAccountId = ownerSnap.exists ? (ownerSnap.data() as any)?.stripeAccountId : undefined;
      if (ownerStripeAccountId) await resRef.update({ ownerStripeAccountId, updatedAt: TS() });
    }
    if (!ownerStripeAccountId) throw new HttpsError("failed-precondition", "Conecte sua conta Stripe para sacar.");

    const stripe = getStripe();
    const paymentIntentId: string | undefined =
      r.stripePaymentIntentId || r.paymentIntentId || (typeof r.checkoutPaymentIntentId === "string" ? r.checkoutPaymentIntentId : undefined);
    if (!paymentIntentId) throw new HttpsError("failed-precondition", "paymentIntentId ausente na reserva.");

    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      const chargeId =
        typeof pi.latest_charge === "string" ? pi.latest_charge : (pi.latest_charge as Stripe.Charge | null)?.id;
      if (!chargeId) throw new HttpsError("failed-precondition", "Charge ainda não existe para este pagamento.");

      const charge = await stripe.charges.retrieve(chargeId);
      const bt = await stripe.balanceTransactions.retrieve(charge.balance_transaction as string);
      const availableOnMs = (bt.available_on || 0) * 1000;
      if (Date.now() < availableOnMs) {
        const when = new Date(availableOnMs).toISOString();
        throw new HttpsError("failed-precondition", `Fundos ainda não disponíveis para transferência. Disponível em: ${when}`);
      }

      const transferAmount = Math.round(baseCents * 0.90); // 90% do anúncio

      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: "brl",
        destination: ownerStripeAccountId,
        source_transaction: charge.id,
        metadata: { reservationId: String(reservationId), role: "owner_payout_legacy" },
      });

      await resRef.update({
        ownerPayoutTransferId: transfer.id,
        status: "paid_out",
        paidOutAt: TS(),
        updatedAt: TS(),
      });

      return { ok: true, transferId: transfer.id, amount: transferAmount };
    } catch (err: any) {
      const msg = err?.raw?.message || err?.message || "Erro Stripe";
      throw new HttpsError("failed-precondition", msg);
    }
  }
);

// =====================================================
// === Locatário marca "Recebido!" (picked_up)        ===
// =====================================================
export const markPickup = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
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
  if (r.status === "picked_up") return { ok: true, already: true };

  // ===== Fluxo GRÁTIS =====
  if (r.isFree === true) {
    if (r.status !== "accepted") {
      throw new HttpsError("failed-precondition", "Reserva (grátis) precisa estar 'accepted'.");
    }

    assertString(r.itemId, "itemId");
    assertISODate(r.startDate, "startDate");
    assertISODate(r.endDate, "endDate");

    const days = eachDateKeysExclusive(r.startDate, r.endDate);
    const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");

    await db.runTransaction(async (trx) => {
      // checa conflito
      for (const d of days) {
        const dRef = bookedCol.doc(d);
        const dSnap = await trx.get(dRef);
        if (dSnap.exists) {
          const curr = dSnap.data();
          if (curr?.resId && curr.resId !== reservationId) {
            throw new HttpsError("already-exists", `Conflito no dia ${d}`);
          }
        }
      }
      // bloqueia dias
      for (const d of days) {
        trx.set(bookedCol.doc(d), {
          resId: reservationId,
          renterUid: r.renterUid,
          itemOwnerUid: r.itemOwnerUid,
          status: "booked",
          createdAt: TS(),
        });
      }
      // marca pickup
      trx.update(resRef, {
        status: "picked_up",
        pickedUpAt: TS(),
        pickedUpBy: uid,
        updatedAt: TS(),
      });
      // marca no item
      trx.set(
        db.doc(`items/${r.itemId}`),
        { currentReservationId: reservationId, lastPickedUpAt: TS(), updatedAt: TS() },
        { merge: true }
      );
    });

    return { ok: true, flow: "free", blockedDays: days.length };
  }

  // ===== Fluxo PAGO (original) =====
  if (r.status !== "paid") {
    throw new HttpsError("failed-precondition", "Reserva precisa estar 'paid' para marcar recebido.");
  }

  await resRef.set(
    { status: "picked_up", pickedUpAt: TS(), pickedUpBy: uid, updatedAt: TS() },
    { merge: true }
  );
  await db.doc(`items/${r.itemId}`).set(
    { currentReservationId: reservationId, lastPickedUpAt: TS(), updatedAt: TS() },
    { merge: true }
  );

  return { ok: true, flow: "paid" };
});


// =====================================================
// === Confirmar devolução (sem foto)                 ===
// =====================================================
export const confirmReturn = onCall(
  { region: "southamerica-east1" },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { reservationId } = (data ?? {}) as { reservationId?: string };
    if (typeof reservationId !== "string" || !reservationId.trim()) {
      throw new HttpsError("invalid-argument", "reservationId inválido/ausente.");
    }

    const resRef = db.doc(`reservations/${reservationId}`);
    const snap = await resRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = snap.data() as any;

    if (r.itemOwnerUid !== uid) {
      throw new HttpsError("permission-denied", "Somente o dono pode confirmar devolução.");
    }
    if (!(r.status === "picked_up" || r.status === "paid_out")) {
      throw new HttpsError("failed-precondition", "Reserva precisa estar 'picked_up' ou 'paid_out'.");
    }

    const itemRef = db.doc(`items/${r.itemId}`);

    await db.runTransaction(async (trx) => {
      // libera o item
      trx.set(
        itemRef,
        { currentReservationId: null, lastReturnedAt: TS(), updatedAt: TS() },
        { merge: true }
      );

      // marca devolvido e libera reviews para o locatário
      trx.update(resRef, {
        status: "returned",
        returnedAt: TS(),
        reviewsOpen: {
          renterCanReviewOwner: true,
          renterCanReviewItem: true,
          ownerCanReviewRenter: false, // deixe true se quiser que o dono avalie o locatário
        },
        updatedAt: TS(),
      });
    });

    return { ok: true };
  }
);

// =====================================================
// === Trigger: agregação ao criar review de item     ===
// =====================================================
export const onItemReviewCreated = onDocumentCreated(
  {
    region: "southamerica-east1",
    document: "items/{itemId}/reviews/{revId}",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const rev = snap.data() as any;
    const { itemId, revId } = event.params as any;

    const rating = Number(rev?.rating) || 0;
    const ownerUid = String(rev?.itemOwnerUid || "");
    const renterUid = String(rev?.renterUid || "");
    const reservationId = String(rev?.reservationId || revId || "");
    if (!itemId || !rating || !ownerUid || !reservationId) return;

    await db.runTransaction(async (trx) => {
      // ---- ITEM: média e contagem
      const itemRef = db.doc(`items/${itemId}`);
      const itemSnap = await trx.get(itemRef);
      const item = itemSnap.exists ? (itemSnap.data() as any) : {};
      const ic = Number(item.ratingCount || 0) + 1;
      const is = Number(item.ratingSum || 0) + rating;
      const ia = Math.round((is / ic) * 10) / 10;
      trx.set(
        itemRef,
        { ratingCount: ic, ratingSum: is, ratingAvg: ia, lastReviewAt: TS() },
        { merge: true }
      );

      // ---- DONO (locador): média e contagem (sem comentários)
      const userRef = db.doc(`users/${ownerUid}`);
      const userSnap = await trx.get(userRef);
      const u = userSnap.exists ? (userSnap.data() as any) : {};
      const uc = Number(u.ratingCount || 0) + 1;
      const us = Number(u.ratingSum || 0) + rating;
      const ua = Math.round((us / uc) * 10) / 10;
      trx.set(
        userRef,
        { ratingCount: uc, ratingSum: us, ratingAvg: ua, updatedAt: TS() },
        { merge: true }
      );

      // ---- Registro curto no perfil do dono (sem comentário)
      const shortRef = db.doc(`users/${ownerUid}/ratingsReceived/${reservationId}`);
      trx.set(
        shortRef,
        {
          rating,
          reservationId,
          itemId,
          renterUid,
          createdAt: TS(),
        },
        { merge: false }
      );
    });
  }
);
