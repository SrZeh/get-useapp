// services/cloudFunctions.ts
import { getAuth } from "firebase/auth";

const BASE =
  process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL ??
  "https://southamerica-east1-upperreggae.cloudfunctions.net";

async function idTokenOrThrow() {
  const auth = getAuth();
  const u = auth.currentUser;
  if (!u) throw new Error("Você precisa estar logado para continuar.");
  return await u.getIdToken(true);
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
