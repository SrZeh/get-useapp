import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp();
}

const stripe = new Stripe(process.env.STRIPE_SECRET as string);

export const releasePayoutToOwner = onRequest(
  { region: "southamerica-east1", cors: true },
  async (req, res) => {
    try {
      if (req.method !== "POST") { res.status(405).json({ code: "method_not_allowed" }); return; }

      const authz = req.get("Authorization") || "";
      const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
      if (!token) { res.status(401).json({ code: "unauthenticated" }); return; }

      const decoded = await getAuth().verifyIdToken(token);
      const uid = decoded.uid;

      const { reservationId } = req.body || {};
      if (!reservationId) { res.status(400).json({ code: "missing_param", message: "reservationId ausente" }); return; }

      const db = getFirestore();
      const rRef = db.doc(`reservations/${reservationId}`);
      const rSnap = await rRef.get();
      if (!rSnap.exists) { res.status(404).json({ code: "not_found" }); return; }
      const r = rSnap.data()!;
      if (r.ownerId !== uid) { res.status(403).json({ code: "forbidden" }); return; }

      const ownerStripeAccountId = r.ownerStripeAccountId || (await db.doc(`users/${uid}`).get()).get("ownerStripeAccountId");
      if (!ownerStripeAccountId) { res.status(400).json({ code: "missing_account" }); return; }

      const paymentIntentId = r.paymentIntentId;
      if (!paymentIntentId) { res.status(400).json({ code: "missing_pi" }); return; }

      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!pi.latest_charge) { res.status(400).json({ code: "no_charge" }); return; }
      const chargeId = pi.latest_charge as string;
      const charge = await stripe.charges.retrieve(chargeId);

      const bt = await stripe.balanceTransactions.retrieve(charge.balance_transaction as string);
      const availableOn = (bt.available_on || 0) * 1000;
      if (Date.now() < availableOn) {
        res.status(409).json({ code: "not_available_yet", availableOn, message: "Fundos ainda não disponíveis." }); return;
      }

      const amountCents = r.amount_total_cents as number;
      const feeCents = Math.round(amountCents * 0.10);
      const transferAmount = amountCents - feeCents;
      if (transferAmount <= 0) { res.status(400).json({ code: "zero_amount" }); return; }

      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: "brl",
        destination: ownerStripeAccountId,
        source_transaction: charge.id,
        metadata: { reservationId },
      });

      await rRef.set({ transferId: transfer.id, transferredAt: FieldValue.serverTimestamp(), status: "paid" }, { merge: true });

      res.json({ ok: true, transferId: transfer.id }); return;
    } catch (err: any) {
      console.error("releasePayoutToOwner error:", err);
      res.status(400).json({ code: err?.code || "stripe_error", message: err?.raw?.message || err?.message || "Erro" }); return;
    }
  }
);
