// lib/messaging.native.ts
export async function registerWebPushToken(): Promise<{ ok: boolean; token?: string }> {
  // no-op em plataformas nativas
  return { ok: false };
}


