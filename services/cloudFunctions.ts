// services/cloudFunctions.ts
import { getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { API_CONFIG } from "@/constants/api";
import { app } from "@/lib/firebase";

const BASE = API_CONFIG.FUNCTIONS_BASE_URL;
const FUNCTIONS_REGION = API_CONFIG.FUNCTIONS_REGION;

// Configure Functions - NEVER connect to emulator automatically
// Only use production functions to avoid CORS errors
// To use emulator: Set EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR=true in .env file
const functions = getFunctions(app, FUNCTIONS_REGION);

// IMPORTANT: Do NOT connect to emulator unless explicitly enabled
// This prevents CORS errors when emulator is not running
// Check environment variable - must be exactly 'true' (string)
const useEmulatorEnv = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR;
const useEmulator = useEmulatorEnv === 'true';

// NEVER connect to emulator automatically - only if explicitly enabled
if (useEmulator) {
  console.log('[cloudFunctions] Emulator mode ENABLED via EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR=true');
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('[cloudFunctions] ✅ Connected to Functions emulator at localhost:5001');
    console.log('[cloudFunctions] Make sure emulator is running: cd functions && npm run serve');
  } catch (error: any) {
    // Emulator already connected or error connecting
    if (error?.message?.includes('already been called') || error?.message?.includes('already connected')) {
      console.log('[cloudFunctions] Functions emulator already connected');
    } else {
      console.warn('[cloudFunctions] Could not connect to Functions emulator:', error?.message || error);
      console.warn('[cloudFunctions] Falling back to production functions');
    }
  }
} else {
  // Using production - this is the default
  console.log('[cloudFunctions] ✅ Using PRODUCTION Functions (southamerica-east1)');
  console.log('[cloudFunctions] Emulator NOT enabled (EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR:', useEmulatorEnv || 'not set', ')');
}

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
  console.log('[cloudFunctions] Calling function:', name, 'with data:', data);
  
  // Verify user is authenticated before calling
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to call Cloud Functions');
  }
  console.log('[cloudFunctions] User authenticated:', user.uid);
  
  // Force token refresh to ensure we have a valid token
  try {
    const token = await user.getIdToken(true);
    console.log('[cloudFunctions] Token obtained, length:', token.length);
  } catch (tokenError) {
    console.error('[cloudFunctions] Failed to get token:', tokenError);
    throw new Error('Failed to get authentication token');
  }
  
  try {
    const fn = httpsCallable<TReq, TRes>(functions, name);
    console.log('[cloudFunctions] Function created, calling...');
    
    // Add timeout to prevent infinite waiting
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Function ${name} timed out after 30 seconds`));
      }, 30000);
    });
    
    const functionPromise = fn(data);
    console.log('[cloudFunctions] Promise criada, aguardando resposta...');
    
    const res = await Promise.race([functionPromise, timeoutPromise]);
    
    console.log('[cloudFunctions] ✅ Function response received:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[cloudFunctions] Function call failed:', {
      name,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      stack: error?.stack
    });
    // Better error messages for debugging
    if (error?.code === 'functions/internal' || error?.message?.includes('CORS')) {
      console.error('[cloudFunctions] CORS or internal error. Make sure:');
      console.error('1. Firebase emulator is running: cd functions && npm run serve');
      console.error('2. Or use production: firebase deploy --only functions');
      console.error('Error details:', error);
    }
    if (error?.message?.includes('not authenticated') || error?.code === 'unauthenticated') {
      console.error('[cloudFunctions] Authentication error. User may need to re-login.');
    }
    throw error;
  }
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

// REMOVIDO: Stripe - usar createMercadoPagoPayment
// export async function createCheckoutSession(reservationId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
//   return callCloudFunction<
//     { reservationId: string; successUrl: string; cancelUrl: string },
//     { url: string }
//   >("createCheckoutSession", { reservationId, successUrl, cancelUrl });
// }

// REMOVIDO: Stripe - webhook do Mercado Pago faz isso automaticamente
// export async function confirmCheckoutSession(reservationId: string): Promise<{ ok: boolean }> {
//   return callCloudFunction<
//     { reservationId: string },
//     { ok: boolean }
//   >("confirmCheckoutSession", { reservationId });
// }

export async function createMercadoPagoPayment(
  reservationId: string,
  successUrl: string,
  cancelUrl: string,
  paymentMethod?: "card" | "pix"
): Promise<{ url: string; preferenceId: string }> {
  return callCloudFunction<
    { reservationId: string; successUrl: string; cancelUrl: string; paymentMethod?: "card" | "pix" },
    { url: string; preferenceId: string }
  >("createMercadoPagoPayment", { reservationId, successUrl, cancelUrl, paymentMethod });
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

export async function acceptReservation(reservationId: string): Promise<{ ok: boolean; prevStatus: string; newStatus: string; isFree?: boolean; blockedDays?: number }> {
  return callCloudFunction<
    { reservationId: string },
    { ok: boolean; prevStatus: string; newStatus: string; isFree?: boolean; blockedDays?: number }
  >("acceptReservation", { reservationId });
}

export async function rejectReservation(reservationId: string, reason?: string): Promise<{ ok: boolean; prevStatus: string; newStatus: string }> {
  return callCloudFunction<
    { reservationId: string; reason?: string },
    { ok: boolean; prevStatus: string; newStatus: string }
  >("rejectReservation", { reservationId, reason });
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

export async function createUserReview(input: {
  reservationId: string;
  reviewerRole: "owner" | "renter";
  targetUid: string;
  targetRole: "owner" | "renter";
  rating: number;
  comment?: string;
}): Promise<{ ok: boolean; reviewId: string }> {
  console.log('[cloudFunctions] createUserReview called with:', input);
  try {
    const result = await callCloudFunction<
      {
        reservationId: string;
        reviewerRole: "owner" | "renter";
        targetUid: string;
        targetRole: "owner" | "renter";
        rating: number;
        comment?: string;
      },
      { ok: boolean; reviewId: string }
    >("createUserReview", input);
    console.log('[cloudFunctions] createUserReview success:', result);
    return result;
  } catch (error: any) {
    console.error('[cloudFunctions] createUserReview error:', {
      error,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      stack: error?.stack,
    });
    throw error;
  }
}
