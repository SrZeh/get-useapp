// services/cloudFunctions.ts
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { API_CONFIG } from "@/constants/api";

const BASE = API_CONFIG.FUNCTIONS_BASE_URL;
const FUNCTIONS_REGION = API_CONFIG.FUNCTIONS_REGION;

async function idTokenOrThrow() {
  const auth = getAuth();
  const u = auth.currentUser;
  if (!u) throw new Error("Você precisa estar logado para continuar.");
  return await u.getIdToken(true);
}

/**
 * Generic helper to call Firebase Cloud Functions
 * Consolidates duplicate callFn helpers from across the codebase
 */
export async function callCloudFunction<TReq, TRes>(
  name: string,
  data: TReq
): Promise<TRes> {
  const fns = getFunctions(undefined, FUNCTIONS_REGION);
  const fn = httpsCallable<TReq, TRes>(fns, name);
  const res = await fn(data);
  return res.data;
}

export async function releasePayoutToOwner(reservationId: string) {
  const token = await idTokenOrThrow();
  const res = await fetch(`${BASE}/releasePayoutToOwner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reservationId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Falha ao liberar transferência");
  }
  return data; // { ok: true, transferId }
}

export async function createExpressLoginLink() {
  const token = await idTokenOrThrow();
  const res = await fetch(`${BASE}/createExpressLoginLink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}), // se sua função aceitar body vazio
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Falha ao abrir painel Stripe");
  }
  return data as { url: string };
}

export async function createCheckoutSession(reservationId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
  return callCloudFunction<
    { reservationId: string; successUrl: string; cancelUrl: string },
    { url: string }
  >("createCheckoutSession", { reservationId, successUrl, cancelUrl });
}

export async function confirmCheckoutSession(reservationId: string): Promise<{ ok: boolean }> {
  return callCloudFunction<
    { reservationId: string },
    { ok: boolean }
  >("confirmCheckoutSession", { reservationId });
}

export async function confirmReturn(reservationId: string, photoUrl: string): Promise<{ ok: boolean }> {
  return callCloudFunction<
    { reservationId: string; photoUrl: string },
    { ok: boolean }
  >("confirmReturn", { reservationId, photoUrl });
}

export async function cancelWithRefund(reservationId: string): Promise<{ ok: boolean }> {
  return callCloudFunction<
    { reservationId: string },
    { ok: boolean }
  >("cancelWithRefund", { reservationId });
}

export async function markPickup(reservationId: string): Promise<{ ok: boolean }> {
  return callCloudFunction<
    { reservationId: string },
    { ok: boolean }
  >("markPickup", { reservationId });
}

export async function getAccountStatus(): Promise<{ hasAccount: boolean; charges_enabled: boolean; payouts_enabled: boolean }> {
  return callCloudFunction<
    {},
    { hasAccount: boolean; charges_enabled: boolean; payouts_enabled: boolean }
  >("getAccountStatus", {});
}

export async function createAccountLink(refreshUrl: string, returnUrl: string): Promise<{ url: string }> {
  return callCloudFunction<
    { refreshUrl: string; returnUrl: string },
    { url: string }
  >("createAccountLink", { refreshUrl, returnUrl });
}
