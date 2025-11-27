import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp();
}

const stripe = new Stripe(process.env.STRIPE_SECRET as string);

export const createExpressLoginLink = onRequest(
  { region: "southamerica-east1", cors: true }, // pode pôr ["http://localhost:8081"] se quiser
  async (req, res) => {
    try {
      if (req.method !== "POST") { res.status(405).json({ code: "method_not_allowed" }); return; }

      const authz = req.get("Authorization") || "";
      const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
      if (!token) { res.status(401).json({ code: "unauthenticated", message: "Missing bearer token" }); return; }

      const decoded = await getAuth().verifyIdToken(token);
      const uid = decoded.uid;

      const userSnap = await getFirestore().doc(`users/${uid}`).get();
      const ownerStripeAccountId = userSnap.get("ownerStripeAccountId");
      if (!ownerStripeAccountId) { res.status(400).json({ code: "missing_account", message: "Conecte sua conta Stripe." }); return; }

      const account = await stripe.accounts.retrieve(ownerStripeAccountId);
      if (account.type !== "express") { res.status(400).json({ code: "not_express" }); return; }

      const link = await stripe.accounts.createLoginLink(ownerStripeAccountId);
      res.json({ url: link.url }); return;
    } catch (err: any) {
      console.error("createExpressLoginLink error:", err);
      res.status(400).json({ code: err?.code || "stripe_error", message: err?.raw?.message || err?.message || "Erro" }); return;
    }
  }
);
