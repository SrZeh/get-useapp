/* eslint-disable import/namespace */
// functions/src/index.ts
import * as admin from "firebase-admin";
import { App as AdminApp, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functionsV1 from "firebase-functions/v1";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { createAsaasCustomer as createAsaasCustomerAPI, createAsaasPayment as createAsaasPaymentAPI, type AsaasPaymentRequest, type AsaasWebhookEvent } from "./asaas";
import { computeFees } from "./fees";
import { createNotification, dispatchExternalNotify, markAsSeenCallable, saveWebPushTokenCallable } from "./notifications";



const adminApp: AdminApp = getApps().length ? getApp() : initializeApp();
setGlobalOptions({ region: "southamerica-east1", maxInstances: 2 });

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


// =====================================================
// === LIMPEZA DE DADOS AO EXCLUIR USUÁRIO (AUTH)    ===
// =====================================================
async function deleteWhere(
  colName: string,
  field: string,
  uid: string
): Promise<number> {
  const qs = await db.collection(colName).where(field, "==", uid).get();
  if (qs.empty) return 0;
  const batch = db.batch();
  qs.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return qs.size;
}

async function cleanupUserData(uid: string) {
  // 1) Perfil (users/{uid})
  try {
    await db.collection("users").doc(uid).delete();
  } catch {
    // Ignore errors during cleanup
  }

  // 2) Coleções relacionadas (ajuste/expanda conforme seu schema)
  // Evita duplicar deleção da mesma doc: (se quiser, pode usar Set de ids)
  const COLS: { name: string; field: string }[] = [
    // Itens do usuário (dono)
    { name: "items", field: "ownerUid" },
    // Reservas em que participou
    { name: "reservations", field: "renterUid" },
    { name: "reservations", field: "itemOwnerUid" },
    // Mensagens enviadas/recebidas (se existir)
    { name: "messages", field: "fromUid" },
    { name: "messages", field: "toUid" },
  ];
  for (const c of COLS) {
    try { await deleteWhere(c.name, c.field, uid); } catch {
      // Ignore errors during cleanup
    }
  }

  // 3) Storage (apagar arquivos do usuário)
  try {
    await admin.storage().bucket().deleteFiles({ prefix: `users/${uid}/` });
  } catch {
    // Ignore errors during cleanup
  }
}



export const authUserDeleted = functionsV1
  .region("southamerica-east1")
  .auth.user()
  .onDelete(async (user: admin.auth.UserRecord) => {
    const uid = user.uid;
    await cleanupUserData(uid);
  });


// =====================================================


// =====================================================
// === Reservas: aceitar / recusar / cancelar etc.    ===
// =====================================================
export const acceptReservation = onCall(
  { 
    region: "southamerica-east1",
    secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"],
  },
  async ({ auth, data }) => {
    console.log('[acceptReservation] Called with auth:', auth?.uid ? 'authenticated' : 'unauthenticated');
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
    const { reservationId } = (data ?? {}) as { reservationId?: string };
    console.log('[acceptReservation] reservationId:', reservationId);
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

      // Calculate total to check if it's free
      const total = Number(r.total) || 0;
      const isFree = total === 0 || r.isFree === true;

      // If free item, automatically block dates and mark as accepted (skip payment)
      if (isFree) {
        const days = eachDateKeysExclusive(r.startDate, r.endDate);
        const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");

        // Check for date conflicts
        for (const d of days) {
          const dRef = bookedCol.doc(d);
          const dSnap = await trx.get(dRef);
          if (dSnap.exists) {
            const curr = dSnap.data() as any;
            if (curr?.resId && curr.resId !== reservationId) {
              throw new HttpsError("already-exists", `Conflito no dia ${d}`);
            }
          }
        }

        // Block dates
        for (const d of days) {
          trx.set(bookedCol.doc(d), {
            resId: reservationId,
            renterUid: r.renterUid,
            itemOwnerUid: r.itemOwnerUid,
            status: "booked",
            createdAt: TS(),
          });
        }

        // For free items, mark as "paid" immediately (no payment needed)
        // This allows the renter to mark as received right away
        trx.update(resRef, {
          status: "paid",
          acceptedAt: TS(),
          paidAt: TS(),
          updatedAt: TS(),
          acceptedBy: uid,
          isFree: true,
        });

        return { ok: true, prevStatus: r.status, newStatus: "paid", isFree: true, blockedDays: days.length };
      }

      // For paid items, just mark as accepted (renter will need to pay)
      trx.update(resRef, { status: "accepted", acceptedAt: TS(), updatedAt: TS(), acceptedBy: uid });

      return { ok: true, prevStatus: r.status, newStatus: "accepted", isFree: false };
      });

      // notifica locatário que foi aceita
      try {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const rs = await resRef.get();
      if (rs.exists) {
        const r = rs.data() as any;
        await createNotification({
          recipientId: String(r.renterUid),
          type: "reservation_status",
          entityType: "reservation",
          entityId: String(reservationId),
          title: "Reserva aceita",
          body: "Sua reserva foi aceita. Continue o processo no app.",
          metadata: { reservationId },
        });
        await dispatchExternalNotify(String(r.renterUid), {
          type: "reservation_status",
          title: "Reserva aceita",
          body: "Sua reserva foi aceita. Continue o processo no app.",
          deepLink: `/reservation/${reservationId}`,
        });
      }
      } catch (e) {
        console.warn("notify(acceptReservation) failed", e);
      }

      return result;
    } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Falha interna ao aceitar: ${err?.message ?? "erro desconhecido"}`);
  }
});

export const rejectReservation = onCall(
  { region: "southamerica-east1", secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"] },
  async ({ auth, data }) => {
    console.log('[rejectReservation] Called with auth:', auth?.uid ? 'authenticated' : 'unauthenticated');
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
    const { reservationId, reason } = (data ?? {}) as { reservationId?: string; reason?: string };
    console.log('[rejectReservation] reservationId:', reservationId, 'reason:', reason);
    assertString(reservationId, "reservationId");

    try {
      const result = await db.runTransaction(async (trx) => {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const snap = await trx.get(resRef);
      if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const r = snap.data() as any;

      assertString(r.itemOwnerUid, "itemOwnerUid");
      
      // Para ofertas de ajuda (isHelpOffer), o itemOwnerUid é quem precisa de ajuda (pode rejeitar)
      // Para reservas normais, o itemOwnerUid é o dono do item (pode rejeitar)
      // Em ambos os casos, apenas o itemOwnerUid pode rejeitar
      if (r.itemOwnerUid !== uid) {
        throw new HttpsError("permission-denied", "Sem permissão para rejeitar esta reserva.");
      }
      
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

      // notifica locatário que foi rejeitada
      try {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const rs = await resRef.get();
      if (rs.exists) {
        const r = rs.data() as any;
        await createNotification({
          recipientId: String(r.renterUid),
          type: "reservation_status",
          entityType: "reservation",
          entityId: String(reservationId),
          title: "Reserva rejeitada",
          body: "Sua reserva foi rejeitada.",
          metadata: { reservationId, reason: reason ?? null },
        });
        await dispatchExternalNotify(String(r.renterUid), {
          type: "reservation_status",
          title: "Reserva rejeitada",
          body: "Sua reserva foi rejeitada.",
          deepLink: `/reservation/${reservationId}`,
        });
      }
      } catch (e) {
        console.warn("notify(rejectReservation) failed", e);
      }

      return result;
    } catch (err: any) {
      if (err instanceof HttpsError) throw err;
      throw new HttpsError("internal", `Falha interna ao recusar: ${err?.message ?? "erro desconhecido"}`);
    }
  }
);

export const closeReservation = onCall(
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

    if (![r.itemOwnerUid, r.renterUid].includes(uid)) throw new HttpsError("permission-denied", "Sem permissão.");

    if (r.status === "paid_out") {
      throw new HttpsError("failed-precondition", "Não é possível fechar uma reserva após o pagamento ser liberado.");
    }

    await resRef.update({ status: "closed", updatedAt: TS() });

    return { ok: true };
  }
);

export const cancelAcceptedReservation = onCall(
  { region: "southamerica-east1", secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"] },
  async ({ auth, data }) => {
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
        return { ok: true, unblockedDays: 0, prevStatus: "accepted" };
      }

      if (r.status === "paid") {
        const days = eachDateKeysExclusive(r.startDate, r.endDate);
        const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");
        for (const d of days) trx.delete(bookedCol.doc(d));
        trx.update(resRef, { status: "canceled", canceledBy: uid, canceledAt: now, updatedAt: now });
        return { ok: true, unblockedDays: days.length, prevStatus: "paid" };
      }

      throw new HttpsError("failed-precondition", `Somente quando 'accepted' ou 'paid'. Atual: '${r.status ?? "?"}'`);
    });

    // Notificar o outro participante sobre o cancelamento
    try {
      const resRef = db.doc(`reservations/${reservationId!}`);
      const rs = await resRef.get();
      if (rs.exists) {
        const r = rs.data() as any;
        const otherUid = uid === r.itemOwnerUid ? r.renterUid : r.itemOwnerUid;
        const role = uid === r.itemOwnerUid ? "dono" : "locatário";
        
        await createNotification({
          recipientId: String(otherUid),
          type: "reservation_status",
          entityType: "reservation",
          entityId: String(reservationId),
          title: "Reserva cancelada",
          body: `A reserva foi cancelada pelo ${role}.`,
          metadata: { reservationId, canceledBy: uid },
        });
        await dispatchExternalNotify(String(otherUid), {
          type: "reservation_status",
          title: "Reserva cancelada",
          body: `A reserva foi cancelada pelo ${role}.`,
          deepLink: `/reservation/${reservationId}`,
        });
      }
    } catch (e) {
      console.warn("notify(cancel) failed", e);
    }

    return result;
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Falha interna ao cancelar: ${err?.message ?? "erro desconhecido"}`);
  }
});

// =====================================================
// === Asaas Payment                                    ===
// =====================================================
export const createAsaasPayment = onCall(
  { region: "southamerica-east1", secrets: ["ASAAS_API_KEY"] },
  async ({ auth, data }) => {
    console.log("[createAsaasPayment] ========== FUNCTION CHAMADA ==========");
    console.log("[createAsaasPayment] Auth:", auth?.uid ? "autenticado" : "não autenticado");
    console.log("[createAsaasPayment] Data recebida:", JSON.stringify(data));
    
    try {
      const uid = auth?.uid;
      if (!uid) {
        console.log("[createAsaasPayment] ❌ Usuário não autenticado");
        throw new HttpsError("unauthenticated", "Faça login.");
      }

      const { reservationId, successUrl, cancelUrl } = (data ?? {}) as {
        reservationId?: string;
        successUrl?: string;
        cancelUrl?: string;
      };

      console.log("[createAsaasPayment] Parâmetros:", { reservationId, successUrl, cancelUrl });

      assertString(reservationId, "reservationId");
      assertString(successUrl, "successUrl");
      assertString(cancelUrl, "cancelUrl");

      const isHttp = (u: string) => /^https?:\/\//i.test(u);
      if (!isHttp(successUrl) || !isHttp(cancelUrl)) {
        throw new HttpsError("failed-precondition", "successUrl/cancelUrl devem ser http(s).");
      }

      // Log das URLs para debug
      console.log("[createAsaasPayment] URLs de callback:", {
        successUrl,
        cancelUrl,
        successDomain: new URL(successUrl).hostname,
        cancelDomain: new URL(cancelUrl).hostname,
      });
      
      // Verificar se o domínio está usando HTTPS (Asaas exige HTTPS)
      if (!successUrl.startsWith('https://') || !cancelUrl.startsWith('https://')) {
        throw new HttpsError("failed-precondition", "As URLs de callback devem usar HTTPS.");
      }

      const resRef = db.doc(`reservations/${reservationId}`);
      const snap = await resRef.get();
      if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const r = snap.data() as any;

      if (r.renterUid !== uid) {
        throw new HttpsError("permission-denied", "Somente o locatário pode pagar.");
      }
      if (r.status !== "accepted") {
        throw new HttpsError("failed-precondition", "Reserva não está 'accepted'.");
      }

      // === cálculo do valor base (anúncio) ===
      const daysCount = (() => {
        try {
          return eachDateKeysExclusive(r.startDate, r.endDate).length;
        } catch {
          return Number(r.days) || 1;
        }
      })();

      console.log("[createAsaasPayment] Dados da reserva:", {
        baseAmountCents: r.baseAmountCents,
        priceCents: r.priceCents,
        total: r.total,
        days: r.days,
        daysCount,
      });

      let baseCents = Number(r.baseAmountCents);
      if (!Number.isInteger(baseCents) || baseCents <= 0) {
        const totalCents = Number(r.priceCents) || toCents(r.total) || 0;
        
        if (totalCents > 0 && Number.isFinite(daysCount) && daysCount > 0) {
          baseCents = totalCents;
          console.log("[createAsaasPayment] Calculado baseCents a partir do total:", {
            totalCents,
            daysCount,
            baseCents,
          });
        } else {
          throw new HttpsError("failed-precondition", "Não foi possível calcular o valor base da reserva.");
        }
      }
      
      if (!Number.isInteger(baseCents) || baseCents <= 0) {
        throw new HttpsError("failed-precondition", "Valor base inválido.");
      }
      
      console.log("[createAsaasPayment] Valor base final (centavos):", baseCents);
      console.log("[createAsaasPayment] Valor base final (reais):", baseCents / 100);

      // Calcular taxas (Asaas) - usar PIX como padrão (mais barato)
      const { serviceFee, surcharge, appFeeFromBase, ownerPayout, totalToCustomer } = computeFees(
        baseCents,
        { paymentProvider: "asaas", paymentMethod: "pix" }
      );

      console.log("[createAsaasPayment] Calculando taxas...");
      console.log("[createAsaasPayment] Base (centavos):", baseCents);
      console.log("[createAsaasPayment] Base (reais):", baseCents / 100);
      console.log("[createAsaasPayment] Taxas calculadas:", { 
        serviceFee, 
        surcharge, 
        totalToCustomer,
        serviceFeeReais: serviceFee / 100,
        surchargeReais: surcharge / 100,
        totalToCustomerReais: totalToCustomer / 100,
        appFeeFromBase,
        ownerPayout,
      });

      // Buscar ou criar cliente Asaas do locatário
      const renterRef = db.collection("users").doc(uid);
      const renterSnap = await renterRef.get();
      const renterData = renterSnap.exists ? renterSnap.data() as any : null;
      
      let customerId: string;
      if (renterData?.asaasCustomerId) {
        customerId = renterData.asaasCustomerId;
        console.log("[createAsaasPayment] Usando cliente Asaas existente:", customerId);
      } else {
        // Criar cliente no Asaas (dados básicos)
        // Nota: Cliente precisa completar cadastro depois para receber, mas pode pagar
        const renterName = renterData?.name || renterData?.displayName || "Cliente";
        const renterEmail = renterData?.email || "";
        const renterCpf = renterData?.cpf || "";
        
        try {
          const customer = await createAsaasCustomerAPI({
            name: renterName,
            email: renterEmail || undefined,
            cpfCnpj: renterCpf ? renterCpf.replace(/\D/g, '') : undefined,
            externalReference: uid,
          });
          customerId = customer.id;
          
          // Salvar customerId no Firestore
          await renterRef.set({
            asaasCustomerId: customerId,
            updatedAt: TS(),
          }, { merge: true });
          
          console.log("[createAsaasPayment] ✅ Cliente Asaas criado:", customerId);
        } catch (customerError: any) {
          console.error("[createAsaasPayment] Erro ao criar cliente:", customerError);
          throw new HttpsError("failed-precondition", `Erro ao criar cliente no Asaas: ${customerError?.message || "Erro desconhecido"}`);
        }
      }

      // Buscar wallet do dono do item
      const ownerRef = db.collection("users").doc(r.itemOwnerUid);
      const ownerSnap = await ownerRef.get();
      const ownerData = ownerSnap.exists ? ownerSnap.data() as any : null;
      
      const ownerWalletId = ownerData?.asaasWalletId;
      const platformWalletId = process.env.ASAAS_PLATFORM_WALLET_ID || "4881db74-e297-4a8b-9c05-ebb9508c03dd";
      
      if (!ownerWalletId) {
        console.warn("[createAsaasPayment] ⚠️ Dono não tem wallet Asaas. Pagamento será criado sem split.");
        console.warn("[createAsaasPayment] ⚠️ Dono precisa criar conta Asaas para receber valores.");
      }

      // Criar pagamento no Asaas
      const totalReais = totalToCustomer / 100;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias
      const dueDateStr = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log("[createAsaasPayment] Criando pagamento no Asaas...");
      console.log("[createAsaasPayment] Valor total (reais):", totalReais);
      console.log("[createAsaasPayment] Vencimento:", dueDateStr);
      
      const paymentData: AsaasPaymentRequest = {
        customer: customerId,
        billingType: "UNDEFINED", // Cliente escolhe no checkout
        value: totalReais,
        dueDate: dueDateStr,
        description: `Aluguel de item - ${r.itemTitle || "Reserva"}`,
        externalReference: reservationId,
        callback: {
          successUrl: `${successUrl}?res=${reservationId}&status=success`,
          autoRedirect: true,
        },
      };

      // Adicionar split se dono tem wallet
      if (ownerWalletId) {
        paymentData.split = [
          {
            walletId: ownerWalletId,
            fixedValue: ownerPayout / 100,
            description: "Repasse para dono do item",
          },
          {
            walletId: platformWalletId,
            fixedValue: appFeeFromBase / 100,
            description: "Taxa da plataforma",
          },
        ];
        console.log("[createAsaasPayment] ✅ Split configurado:", paymentData.split);
      } else {
        console.log("[createAsaasPayment] ⚠️ Split não configurado - dono não tem wallet");
      }

      // Log final antes de criar pagamento
      console.log("[createAsaasPayment] 📋 Dados do pagamento que serão enviados ao Asaas:", {
        customer: customerId,
        value: totalReais,
        dueDate: dueDateStr,
        externalReference: reservationId,
        callback: paymentData.callback,
        split: paymentData.split ? `${paymentData.split.length} wallets` : 'sem split',
      });

      let payment;
      try {
        payment = await createAsaasPaymentAPI(paymentData);
        console.log("[createAsaasPayment] ✅ Pagamento criado:", payment.id);
        console.log("[createAsaasPayment] Status:", payment.status);
        console.log("[createAsaasPayment] Payment Link:", payment.paymentLink);
        console.log("[createAsaasPayment] Invoice URL:", payment.invoiceUrl);
      } catch (asaasError: any) {
        console.error("[createAsaasPayment] ❌ Erro ao criar pagamento no Asaas:", asaasError);
        console.error("[createAsaasPayment] Erro completo:", JSON.stringify(asaasError?.response?.data || asaasError, null, 2));
        console.error("[createAsaasPayment] URL de callback usada:", paymentData.callback?.successUrl);
        console.error("[createAsaasPayment] ⚠️ IMPORTANTE: Verifique se o domínio está cadastrado no Asaas:");
        console.error("[createAsaasPayment] 1. Acesse: https://app.asaas.com/");
        console.error("[createAsaasPayment] 2. Vá em: Minha Conta > Informações");
        console.error("[createAsaasPayment] 3. Cadastre o domínio:", new URL(successUrl).hostname);
        console.error("[createAsaasPayment] 4. O domínio deve ser cadastrado EXATAMENTE como:", new URL(successUrl).hostname);
        
        const errorMessage = asaasError?.response?.data?.errors?.[0]?.description || asaasError?.message || "Erro desconhecido";
        throw new HttpsError(
          "failed-precondition",
          `Erro ao criar pagamento no Asaas: ${errorMessage}`
        );
      }

      // Salvar dados do pagamento na reserva
      console.log("[createAsaasPayment] Salvando dados na reserva...");
      await resRef.set(
        {
          asaasPaymentId: payment.id,
          asaasPaymentLink: payment.paymentLink,
          asaasInvoiceUrl: payment.invoiceUrl,
          asaasBankSlipUrl: payment.bankSlipUrl,
          totalCents: totalToCustomer,
          baseAmountCents: baseCents,
          serviceFeeCents: serviceFee,
          asaasSurchargeCents: surcharge,
          appFeeFromBaseCents: appFeeFromBase,
          expectedOwnerPayoutCents: ownerPayout,
          updatedAt: TS(),
        },
        { merge: true }
      );

      // Retornar URL do checkout
      const checkoutUrl = payment.paymentLink || payment.invoiceUrl;
      
      if (!checkoutUrl) {
        throw new HttpsError("failed-precondition", "URL do checkout não foi retornada pelo Asaas");
      }

      console.log("[createAsaasPayment] ✅ Retornando resultado:", { url: checkoutUrl, paymentId: payment.id });
      return { url: checkoutUrl, paymentId: payment.id };
    } catch (err: any) {
      console.error("[createAsaasPayment] ❌ ERRO:", err);
      console.error("[createAsaasPayment] Stack:", err?.stack);
      const msg = err?.message || err?.cause?.message || err?.toString() || "Falha ao criar pagamento.";
      console.error("[createAsaasPayment] Mensagem de erro:", msg);
      throw new HttpsError("failed-precondition", msg);
    }
  }
);

// =====================================================
// === Notificações: nova reserva criada (trigger)    ===
// =====================================================
export const onReservationCreated = onDocumentCreated(
  {
    region: "southamerica-east1",
    database: "appdb",
    document: "reservations/{reservationId}",
    secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"],
  },
  async (event) => {
    console.log("[onReservationCreated] ========== FUNCTION DISPARADA ==========");
    console.log("[onReservationCreated] Event params:", JSON.stringify(event.params));
    
    const snap = event.data;
    if (!snap) {
      console.log("[onReservationCreated] ❌ Snap não existe, retornando");
      return;
    }
    
    const r = snap.data() as any;
    const { reservationId } = event.params as any;

    console.log(`[onReservationCreated] ✅ Reserva criada: ${reservationId}`);
    console.log(`[onReservationCreated] Status: ${r.status}`);
    console.log(`[onReservationCreated] Dados completos:`, JSON.stringify(r, null, 2));

    // Notificar apenas se for status "requested" (nova reserva)
    if (r.status !== "requested") {
      console.log(`[onReservationCreated] Status não é "requested" (é "${r.status}"), retornando`);
      return;
    }

    const ownerUid = String(r.itemOwnerUid || "");
    const renterUid = String(r.renterUid || "");
    const itemTitle = String(r.itemTitle || "Item");

    console.log(`[onReservationCreated] OwnerUid: ${ownerUid}, RenterUid: ${renterUid}, Item: ${itemTitle}`);

    if (!ownerUid) {
      console.warn("[onReservationCreated] OwnerUid não encontrado, retornando");
      return;
    }

    try {
      console.log(`[onReservationCreated] Criando notificação in-app para ${ownerUid}`);
      await createNotification({
        recipientId: ownerUid,
        type: "reservation_request",
        entityType: "reservation",
        entityId: String(reservationId),
        title: "Nova solicitação de reserva",
        body: `Você recebeu uma nova solicitação de reserva para "${itemTitle}".`,
        metadata: { reservationId, itemTitle, renterUid },
      });

      console.log(`[onReservationCreated] Disparando notificação externa (email/webpush) para ${ownerUid}`);
      await dispatchExternalNotify(ownerUid, {
        type: "reservation_request",
        title: "Nova solicitação de reserva",
        body: `Você recebeu uma nova solicitação de reserva para "${itemTitle}".`,
        deepLink: `/reservation/${reservationId}`,
      });
      console.log(`[onReservationCreated] Notificações enviadas com sucesso para ${ownerUid}`);
    } catch (e) {
      console.error("[onReservationCreated] Erro ao enviar notificações:", e);
    }
  }
);

// 🔔 quando cria uma mensagem, incrementa contador do outro participante
export const onMessageCreated = onDocumentCreated(
  {
    region: "southamerica-east1",
    database: "appdb",
    document: "threads/{threadId}/messages/{msgId}",
    secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"],
  },
  async (event) => {
    const snap = event.data; if (!snap) return;
    const msg = snap.data() as any;
    const { threadId } = event.params as any;

    const threadRef = db.collection("threads").doc(threadId);
    const threadSnap = await threadRef.get();
    if (!threadSnap.exists) return;

    const t = threadSnap.data() as any;
    const fromUid = String(msg?.fromUid || "");
    const participants: string[] = Array.isArray(t?.participants) ? t.participants : [];
    const others = participants.filter((u) => u && u !== fromUid);

    // atualiza lastMsgAt no thread
    await threadRef.set({ lastMsgAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    // incrementa unread do(s) outro(s)
    const batch = db.batch();
    for (const uid of others) {
      const pRef = threadRef.collection("participants").doc(uid);
      batch.set(
        pRef,
        {
          unreadCount: admin.firestore.FieldValue.increment(1),
          // não mexe em lastReadAt aqui
        },
        { merge: true }
      );
    }
    await batch.commit();

    // cria notificação + envia e-mail / web push
    await Promise.all(
      others.map(async (recipientId) => {
        try {
          await createNotification({
            recipientId,
            type: "message",
            entityType: "thread",
            entityId: threadId,
            title: "Nova mensagem",
            body: typeof msg?.text === "string" ? String(msg.text).slice(0, 120) : "Você recebeu uma nova mensagem",
            metadata: { threadId, fromUid, preview: msg?.text ?? null },
          });
          await dispatchExternalNotify(recipientId, {
            type: "message",
            title: "Nova mensagem",
            body: "Você recebeu uma nova mensagem",
            deepLink: `/messages/${threadId}`,
          });
        } catch (e) {
          console.warn("notify(message) failed", e);
        }
      })
    );
  }
);


// callable para marcar thread como lida
export const markThreadRead = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { threadId } = (data ?? {}) as { threadId?: string };
  assertString(threadId, "threadId");

  const pRef = db.collection("threads").doc(threadId).collection("participants").doc(uid);
  await pRef.set(
    {
      unreadCount: 0,
      lastReadAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  return { ok: true };
});

//---------------------------------------------------------

export const getOrCreateThread = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { itemId, ownerUid } = (data ?? {}) as { itemId?: string; ownerUid?: string };
  assertString(itemId, "itemId");
  assertString(ownerUid, "ownerUid");
  if (uid === ownerUid) throw new HttpsError("failed-precondition", "Não é possível conversar consigo mesmo.");

  const participants = [uid, ownerUid].sort();
  const threadId = `${itemId}_${participants[0]}_${participants[1]}`;
  const tRef = db.doc(`threads/${threadId}`);
  const tSnap = await tRef.get();

  if (!tSnap.exists) {
    await tRef.set({
      itemId,
      ownerUid,
      renterUid: uid, // iniciador (tanto faz aqui, só não confundir com reserva)
      participants,
      createdAt: TS(),
      lastMsgAt: TS(),
    }, { merge: true });

    // zera unread do criador e cria doc do outro
    await Promise.all([
      tRef.collection("participants").doc(uid).set({ unreadCount: 0, lastReadAt: TS() }, { merge: true }),
      tRef.collection("participants").doc(ownerUid).set({ unreadCount: 0 }, { merge: true }),
    ]);
  }

  return { threadId };
});

// =====================================================
// === getOrCreateProfileThread (conversas de perfil) ===
// =====================================================
export const getOrCreateProfileThread = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { targetUid } = (data ?? {}) as { targetUid?: string };
  assertString(targetUid, "targetUid");
  if (uid === targetUid) throw new HttpsError("failed-precondition", "Não é possível conversar consigo mesmo.");

  const participants = [uid, targetUid].sort();
  const threadId = `profile_chat_${participants[0]}_${participants[1]}`;
  const tRef = db.doc(`threads/${threadId}`);
  const tSnap = await tRef.get();

  if (!tSnap.exists) {
    await tRef.set({
      itemId: 'profile_chat',
      ownerUid: targetUid,
      renterUid: uid, // iniciador
      participants,
      createdAt: TS(),
      lastMsgAt: TS(),
    }, { merge: true });

    // zera unread do criador e cria doc do outro
    await Promise.all([
      tRef.collection("participants").doc(uid).set({ unreadCount: 0, lastReadAt: TS() }, { merge: true }),
      tRef.collection("participants").doc(targetUid).set({ unreadCount: 0 }, { merge: true }),
    ]);
  }

  return { threadId };
});

// =====================================================
// === deleteReservationMessages (deletar mensagens do usuário) ===
// =====================================================
export const deleteReservationMessages = onCall({ region: "southamerica-east1" }, async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  const { reservationId } = (data ?? {}) as { reservationId?: string };
  assertString(reservationId, "reservationId");

  try {
    // Verificar se o usuário é participante da reserva
    const resRef = db.doc(`reservations/${reservationId}`);
    const resSnap = await resRef.get();
    if (!resSnap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = resSnap.data() as any;
    
    if (r.itemOwnerUid !== uid && r.renterUid !== uid) {
      throw new HttpsError("permission-denied", "Você não é participante desta reserva.");
    }

    // Buscar todas as mensagens da reserva
    const messagesRef = resRef.collection("messages");
    const messagesSnap = await messagesRef.get();
    
    let deletedCount = 0;
    const batch = db.batch();
    
    messagesSnap.forEach((msgDoc) => {
      const msgData = msgDoc.data();
      // Só deleta mensagens do próprio usuário
      if (msgData.senderUid === uid) {
        batch.delete(msgDoc.ref);
        deletedCount++;
      }
    });
    
    if (deletedCount === 0) {
      return { deletedCount: 0, message: "Nenhuma mensagem para deletar." };
    }
    
    await batch.commit();
    
    return { deletedCount, message: `${deletedCount} mensagem(ns) deletada(s).` };
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Erro ao deletar mensagens: ${err?.message ?? "erro desconhecido"}`);
  }
});

// =====================================================
// === Cancelar reserva paga com estorno (até 7 dias) ===
// =====================================================
// TODO: Implementar estorno via Asaas quando necessário

// ==== Callable: markAsSeen (counters + lastSeenAt) ====
export const markAsSeen = markAsSeenCallable;

// ==== Callable: save web push token (FCM) ==============
export const saveWebPushToken = saveWebPushTokenCallable;

// ==== Callable: getPublicUserProfile (buscar perfil público) ==============
export const getPublicUserProfile = onCall(
  { region: "southamerica-east1" },
  async ({ data }) => {
    const { uid } = (data ?? {}) as { uid?: string };
    if (!uid || typeof uid !== "string" || uid.trim() === "") {
      throw new HttpsError("invalid-argument", "UID inválido ou ausente.");
    }

    try {
      const userRef = db.doc(`users/${uid}`);
      const snap = await userRef.get();
      
      if (!snap.exists) {
        return null;
      }

      const userData = snap.data() as any;
      
      // Determinar nome público: displayName > primeiro nome > email prefix
      let publicName: string | null = null;
      if (userData.displayName) {
        publicName = userData.displayName;
      } else if (userData.name) {
        // Pegar apenas o primeiro nome
        const firstName = userData.name.trim().split(/\s+/)[0];
        publicName = firstName || null;
      } else if (userData.email) {
        // Fallback: prefixo do email
        publicName = userData.email.split('@')[0];
      }
      
      // Retornar apenas dados públicos (sem informações sensíveis)
      return {
        uid: snap.id,
        name: publicName,
        email: null, // Não expor email no perfil público
        photoURL: userData.photoURL || null,
        ratingAvg: userData.ratingAvg || null,
        ratingCount: userData.ratingCount || null,
        transactionsTotal: userData.transactionsTotal || null,
      };
    } catch (err: any) {
      console.error("[getPublicUserProfile] Error:", err);
      throw new HttpsError("internal", `Erro ao buscar perfil: ${err?.message ?? "erro desconhecido"}`);
    }
  }
);

// ==== Callable: getUserThreads (buscar threads do usuário) ==============
export const getUserThreads = onCall(
  { region: "southamerica-east1" },
  async ({ auth }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    try {
      // Buscar threads onde o usuário é participante
      // Como threads têm participants array, vamos buscar todas e filtrar
      const threadsRef = db.collection("threads");
      const threadsSnap = await threadsRef.get();
      
      const userThreads: {
        threadId: string;
        otherUserUid: string;
        lastMessage?: { text: string; createdAt: any };
        unreadCount: number;
        itemId?: string;
      }[] = [];

      for (const threadDoc of threadsSnap.docs) {
        const threadData = threadDoc.data();
        const participants = threadData.participants || [];
        
        // Verificar se o usuário é participante
        if (!participants.includes(uid)) continue;

        const otherUserUid = participants.find((p: string) => p !== uid);
        if (!otherUserUid) continue;

        // Buscar última mensagem
        const messagesRef = threadDoc.ref.collection("messages");
        const lastMsgQuery = messagesRef.orderBy("createdAt", "desc").limit(1);
        const lastMsgSnap = await lastMsgQuery.get();
        const lastMsg = lastMsgSnap.docs[0]?.data();

        // Buscar unreadCount do participante
        const participantRef = threadDoc.ref.collection("participants").doc(uid);
        const participantSnap = await participantRef.get();
        const unreadCount = participantSnap.exists ? (participantSnap.data()?.unreadCount || 0) : 0;

        userThreads.push({
          threadId: threadDoc.id,
          otherUserUid,
          lastMessage: lastMsg ? { text: lastMsg.text || '', createdAt: lastMsg.createdAt } : undefined,
          unreadCount,
          itemId: threadData.itemId,
        });
      }

      // Ordenar por última mensagem
      userThreads.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt?.toMillis?.() || 0;
        const bTime = b.lastMessage?.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      return userThreads;
    } catch (err: any) {
      console.error("[getUserThreads] Error:", err);
      throw new HttpsError("internal", `Erro ao buscar threads: ${err?.message ?? "erro desconhecido"}`);
    }
  }
);
// =====================================================
// === Webhook Stripe: REMOVIDO - usando Asaas agora ===
// =====================================================

// =====================================================
// === Webhook Asaas: marca paid e bloqueia datas ===
// =====================================================
export const asaasWebhook = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
    maxInstances: 10,
    secrets: ["ASAAS_API_KEY", "SENDGRID_API_KEY", "SENDGRID_FROM"],
  },
  async (req, res) => {
    try {
      const event = req.body as AsaasWebhookEvent;
      const { event: eventType, payment } = event;

      console.log("[AsaasWebhook] Recebido:", { eventType, paymentId: payment?.id });

      // Apenas processar eventos de pagamento
      if (!payment || !eventType?.includes('PAYMENT')) {
        console.log("[AsaasWebhook] Ignorando evento:", eventType);
        res.json({ received: true });
        return;
      }

      // Apenas processar pagamentos confirmados
      if (payment.status !== "RECEIVED" && payment.status !== "CONFIRMED") {
        console.log("[AsaasWebhook] Pagamento não confirmado:", payment.status);
        res.json({ received: true });
        return;
      }

      const reservationId = payment.externalReference;
      if (!reservationId || typeof reservationId !== "string") {
        console.warn("[AsaasWebhook] Sem reservationId no externalReference");
        res.json({ received: true });
        return;
      }

      const resRef = db.doc(`reservations/${reservationId}`);
      const snap = await resRef.get();
      if (!snap.exists) {
        console.warn("[AsaasWebhook] Reserva não encontrada:", reservationId);
        res.json({ received: true });
        return;
      }

      const r = snap.data() as any;
      if (r.status === "paid") {
        console.log("[AsaasWebhook] Reserva já está paga");
        res.json({ received: true });
        return;
      }

      // Obter método de pagamento
      const paymentMethodType = payment.billingType?.toLowerCase() || "unknown";

      const days = eachDateKeysExclusive(r.startDate, r.endDate);
      const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");

      await db.runTransaction(async (trx) => {
        // Verificar conflitos
        for (const d of days) {
          const dRef = bookedCol.doc(d);
          const dSnap = await trx.get(dRef);
          if (dSnap.exists) {
            const curr = dSnap.data() as any;
            if (curr.resId && curr.resId !== reservationId) {
              throw new Error(`Conflito de data ${d}`);
            }
          }
        }
        // Bloquear datas
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
        // Atualizar reserva
        trx.update(resRef, {
          status: "paid",
          paidAt: TS(),
          asaasPaymentId: payment.id,
          paymentMethodType: paymentMethodType,
          updatedAt: TS(),
        });
      });

      // Notificar dono e locatário
      try {
        await Promise.all([
          createNotification({
            recipientId: String(r.itemOwnerUid),
            type: "payment_update",
            entityType: "reservation",
            entityId: String(reservationId),
            title: "Pagamento confirmado",
            body: "Uma reserva sua foi paga. Prepare-se para a entrega/retirada.",
            metadata: { reservationId },
          }).then(() =>
            dispatchExternalNotify(String(r.itemOwnerUid), {
              type: "payment_update",
              title: "Pagamento confirmado",
              body: "Uma reserva sua foi paga.",
              deepLink: `/reservation/${reservationId}`,
            })
          ),
          createNotification({
            recipientId: String(r.renterUid),
            type: "payment_update",
            entityType: "reservation",
            entityId: String(reservationId),
            title: "Pagamento aprovado",
            body: "Seu pagamento foi aprovado. Confira os próximos passos.",
            metadata: { reservationId },
          }).then(() =>
            dispatchExternalNotify(String(r.renterUid), {
              type: "payment_update",
              title: "Pagamento aprovado",
              body: "Seu pagamento foi aprovado.",
              deepLink: `/reservation/${reservationId}`,
            })
          ),
        ]);
      } catch (e) {
        console.warn("[AsaasWebhook] notify(paid) failed", e);
      }

      res.json({ received: true });
    } catch (e: any) {
      console.error("[AsaasWebhook] Handler error:", e?.message, e);
      res.status(500).send("Webhook handler error");
    }
  }
);

// =====================================================
// === Repasse para o dono: REMOVIDO - Asaas faz split automático ===
// =====================================================

// =====================================================
// === Locatário marca "Recebido!" (picked_up)        ===
// =====================================================
export const markPickup = onCall({ region: "southamerica-east1", secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"] }, async ({ auth, data }) => {
  console.log('[markPickup] Called with auth:', auth?.uid ? 'authenticated' : 'unauthenticated');
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

  const { reservationId } = (data ?? {}) as { reservationId?: string };
  console.log('[markPickup] reservationId:', reservationId);
  assertString(reservationId, "reservationId");

  const resRef = db.doc(`reservations/${reservationId}`);
  const snap = await resRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
  const r = snap.data() as any;
  console.log('[markPickup] Reservation status:', r.status, 'isFree:', r.isFree);

  if (r.renterUid !== uid) {
    throw new HttpsError("permission-denied", "Somente o locatário pode confirmar recebimento.");
  }
  if (r.status === "picked_up") {
    console.log('[markPickup] Already picked up');
    return { ok: true, already: true };
  }

  // ===== Fluxo GRÁTIS =====
  if (r.isFree === true) {
    console.log('[markPickup] Processing free item');
    // Free items can be marked as picked up if status is "paid" (after acceptance)
    if (r.status !== "paid") {
      console.log('[markPickup] Free item status check failed:', r.status);
      throw new HttpsError("failed-precondition", `Reserva (grátis) precisa estar 'paid'. Status atual: '${r.status ?? "?"}'`);
    }

    assertString(r.itemId, "itemId");

    // For free items, dates were already blocked when reservation was accepted
    // Just update the reservation status to picked_up
    await db.runTransaction(async (trx) => {
      // Verify reservation still exists and is in correct state
      const currentSnap = await trx.get(resRef);
      if (!currentSnap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
      const current = currentSnap.data() as any;
      if (current.status !== "paid") {
        throw new HttpsError("failed-precondition", `Status mudou. Esperado 'paid', atual: '${current.status ?? "?"}'`);
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

    // Notificar dono que item foi recebido (free item)
    try {
      await createNotification({
        recipientId: String(r.itemOwnerUid),
        type: "reservation_status",
        entityType: "reservation",
        entityId: String(reservationId),
        title: "Item recebido",
        body: "O locatário confirmou o recebimento do item.",
        metadata: { reservationId },
      });
      await dispatchExternalNotify(String(r.itemOwnerUid), {
        type: "reservation_status",
        title: "Item recebido",
        body: "O locatário confirmou o recebimento do item.",
        deepLink: `/reservation/${reservationId}`,
      });
    } catch (e) {
      console.warn("notify(picked_up free) failed", e);
    }

    console.log('[markPickup] Free item pickup marked successfully');
    return { ok: true, flow: "free" };
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

  // Notificar dono que item foi recebido
  try {
    await createNotification({
      recipientId: String(r.itemOwnerUid),
      type: "reservation_status",
      entityType: "reservation",
      entityId: String(reservationId),
      title: "Item recebido",
      body: "O locatário confirmou o recebimento do item.",
      metadata: { reservationId },
    });
    await dispatchExternalNotify(String(r.itemOwnerUid), {
      type: "reservation_status",
      title: "Item recebido",
      body: "O locatário confirmou o recebimento do item.",
      deepLink: `/reservation/${reservationId}`,
    });
  } catch (e) {
    console.warn("notify(picked_up) failed", e);
  }

  return { ok: true, flow: "paid" };
});

// =====================================================
// === Liberar pagamento para o dono (marcar paid_out) ===
// =====================================================
// Nota: O Asaas já faz split automático no momento do pagamento.
// Esta função apenas marca a reserva como paid_out para indicar
// que o locatário confirmou o recebimento e liberou o pagamento.
export const releasePayoutToOwner = onCall(
  { region: "southamerica-east1", secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { reservationId } = (data ?? {}) as { reservationId?: string };
    assertString(reservationId, "reservationId");

    const resRef = db.doc(`reservations/${reservationId}`);
    const snap = await resRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = snap.data() as any;

    // Apenas o locatário pode liberar o pagamento
    if (r.renterUid !== uid) {
      throw new HttpsError("permission-denied", "Somente o locatário pode liberar o pagamento.");
    }

    // Deve estar picked_up para liberar
    if (r.status !== "picked_up") {
      throw new HttpsError("failed-precondition", `Reserva precisa estar 'picked_up'. Status atual: '${r.status ?? "?"}'`);
    }

    // Marcar como paid_out
    await resRef.update({
      status: "paid_out",
      paidOutAt: TS(),
      updatedAt: TS(),
    });

    // Notificar dono que o pagamento foi liberado
    try {
      await createNotification({
        recipientId: String(r.itemOwnerUid),
        type: "reservation_status",
        entityType: "reservation",
        entityId: String(reservationId),
        title: "Pagamento liberado",
        body: "O locatário liberou o pagamento. Você pode sacar no Asaas.",
        metadata: { reservationId },
      });
      await dispatchExternalNotify(String(r.itemOwnerUid), {
        type: "reservation_status",
        title: "Pagamento liberado",
        body: "O locatário liberou o pagamento. Você pode sacar no Asaas.",
        deepLink: `/reservation/${reservationId}`,
      });
    } catch (e) {
      console.warn("notify(paid_out) failed", e);
    }

    return { ok: true };
  }
);

// =====================================================
// === Confirmar devolução (sem foto)                 ===
// =====================================================
export const confirmReturn = onCall(
  { region: "southamerica-east1", secrets: ["SENDGRID_API_KEY", "SENDGRID_FROM"] },
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
          renterCanReviewItem: true,
          renterCanReviewOwner: true,
          ownerCanReviewRenter: true,
        },
        updatedAt: TS(),
      });
    });

    // Notificar locatário que item foi devolvido
    try {
      await createNotification({
        recipientId: String(r.renterUid),
        type: "reservation_status",
        entityType: "reservation",
        entityId: String(reservationId),
        title: "Item devolvido",
        body: "O dono confirmou a devolução do item. Você pode avaliar agora.",
        metadata: { reservationId },
      });
      await dispatchExternalNotify(String(r.renterUid), {
        type: "reservation_status",
        title: "Item devolvido",
        body: "O dono confirmou a devolução do item. Você pode avaliar agora.",
        deepLink: `/reservation/${reservationId}`,
      });
    } catch (e) {
      console.warn("notify(returned) failed", e);
    }

    return { ok: true };
  }
);

// =====================================================
// === Criar avaliação de usuário (bypass regras)    ===
// =====================================================
export const createUserReview = onCall(
  { region: "southamerica-east1" },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const {
      reservationId,
      reviewerRole,
      targetUid,
      targetRole,
      rating,
      comment,
    } = (data ?? {}) as {
      reservationId?: string;
      reviewerRole?: "owner" | "renter";
      targetUid?: string;
      targetRole?: "owner" | "renter";
      rating?: number;
      comment?: string;
    };

    assertString(reservationId, "reservationId");
    assertString(targetUid, "targetUid");
    if (!reviewerRole || !["owner", "renter"].includes(reviewerRole))
      throw new HttpsError("invalid-argument", "reviewerRole inválido.");
    if (!targetRole || !["owner", "renter"].includes(targetRole))
      throw new HttpsError("invalid-argument", "targetRole inválido.");
    if (!rating || rating < 1 || rating > 5)
      throw new HttpsError("invalid-argument", "Rating deve ser entre 1 e 5.");

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    if (rating <= 2 && (!trimmedComment || trimmedComment.length === 0)) {
      throw new HttpsError(
        "invalid-argument",
        "Para notas 1 ou 2, explique o motivo no comentário."
      );
    }

    // Verificar reserva
    const resRef = db.doc(`reservations/${reservationId}`);
    const resSnap = await resRef.get();
    if (!resSnap.exists)
      throw new HttpsError("not-found", "Reserva não encontrada.");
    const r = resSnap.data() as any;

    // Verificar status
    if (r.status !== "returned" && r.status !== "closed") {
      throw new HttpsError(
        "failed-precondition",
        `Reserva precisa estar devolvida para avaliar. Status atual: ${r.status ?? "desconhecido"}`
      );
    }

    // Verificar permissões
    if (reviewerRole === "renter") {
      if (r.renterUid !== uid)
        throw new HttpsError(
          "permission-denied",
          "Você não é o locatário desta reserva."
        );
      if (r.itemOwnerUid !== targetUid)
        throw new HttpsError(
          "permission-denied",
          "Usuário alvo não corresponde ao dono do item desta reserva."
        );
    } else if (reviewerRole === "owner") {
      if (r.itemOwnerUid !== uid)
        throw new HttpsError(
          "permission-denied",
          "Você não é o dono do item desta reserva."
        );
      if (r.renterUid !== targetUid)
        throw new HttpsError(
          "permission-denied",
          "Usuário alvo não corresponde ao locatário desta reserva."
        );
    }

    // Verificar se já existe avaliação
    const reviewRef = db
      .doc(`users/${targetUid}`)
      .collection("reviewsReceived")
      .doc(reservationId);
    const existingReview = await reviewRef.get();
    if (existingReview.exists)
      throw new HttpsError("already-exists", "Você já avaliou esta reserva.");

    // Criar avaliação (com privilégios de admin, bypass das regras)
    await reviewRef.set({
      reservationId,
      reviewerUid: uid,
      reviewerRole,
      targetUid,
      targetRole,
      rating,
      comment: trimmedComment,
      createdAt: TS(),
    });

    // Atualizar reserva
    const reservationUpdate: Record<string, unknown> = {
      updatedAt: TS(),
    };
    if (reviewerRole === "renter" && targetRole === "owner") {
      reservationUpdate["reviewsOpen.renterCanReviewOwner"] = false;
    }
    if (reviewerRole === "owner" && targetRole === "renter") {
      reservationUpdate["reviewsOpen.ownerCanReviewRenter"] = false;
    }
    
    // Verificar se todas as avaliações foram feitas e fechar automaticamente
    const updatedR = { ...r };
    if (reviewerRole === "renter" && targetRole === "owner") {
      updatedR.reviewsOpen = { ...(updatedR.reviewsOpen || {}), renterCanReviewOwner: false };
    }
    if (reviewerRole === "owner" && targetRole === "renter") {
      updatedR.reviewsOpen = { ...(updatedR.reviewsOpen || {}), ownerCanReviewRenter: false };
    }
    
    const reviewsOpen = updatedR.reviewsOpen || {};
    const allReviewsDone = 
      (reviewsOpen.renterCanReviewOwner === false || reviewsOpen.renterCanReviewOwner === undefined) &&
      (reviewsOpen.renterCanReviewItem === false || reviewsOpen.renterCanReviewItem === undefined) &&
      (reviewsOpen.ownerCanReviewRenter === false || reviewsOpen.ownerCanReviewRenter === undefined);
    
    // Se todas as avaliações foram feitas, fechar a reserva automaticamente
    if (allReviewsDone && updatedR.status === "returned") {
      reservationUpdate.status = "closed";
    }
    
    await resRef.update(reservationUpdate);

    return { ok: true, reviewId: reservationId };
  }
);

// =====================================================
// === Trigger: agregação ao criar review de item     ===
// =====================================================
export const onItemReviewCreatedV3 = onDocumentCreated(
  {
    region: "southamerica-east1",
    database: "appdb",
    document: "items/{itemId}/reviews/{revId}",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const rev = snap.data() as any;
    const { itemId, revId } = event.params as any;

    const rating = Number(rev?.rating) || 0;
    const ownerUid = String(rev?.itemOwnerUid || "");
    const reservationId = String(rev?.reservationId || revId || "");
    const comment = typeof rev?.comment === "string" ? String(rev.comment).slice(0, 500) : "";
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
        {
          ratingCount: ic,
          ratingSum: is,
          ratingAvg: ia,
          lastReviewAt: TS(),
          lastReviewSnippet: comment,
        },
        { merge: true }
      );
    });
  }
);

// =====================================================
// === Trigger: agregação ao criar review de usuário  ===
// =====================================================
export const onUserReviewCreatedV3 = onDocumentCreated(
  {
    region: "southamerica-east1",
    database: "appdb",
    document: "users/{targetUid}/reviewsReceived/{revId}",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const rev = snap.data() as any;
    const { targetUid } = event.params as any;
    const rating = Number(rev?.rating) || 0;
    if (!targetUid || !rating) return;

    await db.runTransaction(async (trx) => {
      const userRef = db.doc(`users/${targetUid}`);
      const userSnap = await trx.get(userRef);
      const data = userSnap.exists ? (userSnap.data() as any) : {};
      const count = Number(data.ratingCount || 0) + 1;
      const sum = Number(data.ratingSum || 0) + rating;
      const avg = Math.round((sum / count) * 10) / 10;
      trx.set(
        userRef,
        {
          ratingCount: count,
          ratingSum: sum,
          ratingAvg: avg,
          updatedAt: TS(),
        },
        { merge: true }
      );
    });
  }
);

// =====================================================
// === Expire Request Items (Scheduled)                ===
// =====================================================
// Runs every hour to unpublish expired request items
export const expireRequestItems = onSchedule(
  {
    schedule: "0 * * * *", // Every hour at minute 0
    timeZone: "America/Sao_Paulo",
    region: "southamerica-east1",
  },
  async (event) => {
    console.log("[expireRequestItems] ========== FUNCTION CHAMADA ==========");
    
    try {
      const db = getFirestore(adminApp, "appdb");
      const now = admin.firestore.Timestamp.now();
      
      // Find all published request items that have expired
      const expiredQuery = db
        .collection("items")
        .where("itemType", "==", "request")
        .where("published", "==", true)
        .where("expiresAt", "<=", now);
      
      const snapshot = await expiredQuery.get();
      console.log(`[expireRequestItems] Encontrados ${snapshot.size} pedidos expirados`);
      
      const batch = db.batch();
      let count = 0;
      
      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          published: false,
          available: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        count++;
      });
      
      if (count > 0) {
        await batch.commit();
        console.log(`[expireRequestItems] ✅ ${count} pedidos marcados como expirados (unpublished)`);
      } else {
        console.log("[expireRequestItems] Nenhum pedido para expirar");
      }
      
      // Scheduled functions must return void
    } catch (error) {
      console.error("[expireRequestItems] ❌ ERRO:", error);
      throw error;
    }
  }
);

// =====================================================
// === Oferecer item para pedido de ajuda (socorro) ===
// =====================================================
export const offerItemToRequest = onCall(
  { region: "southamerica-east1" },
  async ({ auth, data }) => {
  const uid = auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
  
  const { requestItemId, offeredItemId } = (data ?? {}) as { requestItemId?: string; offeredItemId?: string };
  assertString(requestItemId, "requestItemId");
  assertString(offeredItemId, "offeredItemId");

  // Verify that the offered item belongs to the current user
  const offeredItemRef = db.collection("items").doc(offeredItemId);
  const offeredItemDoc = await offeredItemRef.get();
  
  if (!offeredItemDoc.exists) {
    throw new HttpsError("not-found", "Item oferecido não encontrado");
  }
  
  const offeredItemData = offeredItemDoc.data();
  if (offeredItemData?.ownerUid !== uid) {
    throw new HttpsError("permission-denied", "Você só pode oferecer seus próprios itens");
  }

  // Verify that the request item is actually a request
  const requestItemRef = db.collection("items").doc(requestItemId);
  const requestItemDoc = await requestItemRef.get();
  
  if (!requestItemDoc.exists) {
    throw new HttpsError("not-found", "Pedido de ajuda não encontrado");
  }
  
  const requestItemData = requestItemDoc.data();
  if (requestItemData?.itemType !== "request") {
    throw new HttpsError("failed-precondition", "Este item não é um pedido de ajuda");
  }

  // Check if item is already offered
  const currentOfferedItems = (requestItemData.offeredItems as string[]) || [];
  if (currentOfferedItems.includes(offeredItemId)) {
    throw new HttpsError("already-exists", "Este item já foi oferecido para este pedido");
  }

  // Update the request item to add the offered item ID
  await requestItemRef.update({
    offeredItems: admin.firestore.FieldValue.arrayUnion(offeredItemId),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create a special reservation so it appears in "Ajuda Recebida!" section
  // Para reservas de socorro: itemOwnerUid = quem precisa de ajuda (quem recebe a oferta)
  // renterUid = quem oferece (quem está oferecendo o item)
  const requestOwnerUid = requestItemData.ownerUid;
  const offeredItemTitle = offeredItemData?.title || "Item oferecido";
  
  const reservationData = {
    itemId: offeredItemId,
    itemTitle: offeredItemTitle,
    itemOwnerUid: requestOwnerUid, // Person who needs help (will receive the item)
    renterUid: uid, // Person offering the item (owner of the item)
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    days: 1,
    total: 0,
    isFree: true,
    helpRequestId: requestItemId,
    isHelpOffer: true,
    status: "requested" as const,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const reservationRef = await db.collection("reservations").add(reservationData);

    return { 
      ok: true, 
      reservationId: reservationRef.id,
      requestItemId,
      offeredItemId,
    };
  }
);

// =====================================================
// === Remover item oferecido de pedido de ajuda ===
// =====================================================
export const removeOfferedItemFromRequest = onCall(
  { region: "southamerica-east1" },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
    
    const { requestItemId, offeredItemId } = (data ?? {}) as { requestItemId?: string; offeredItemId?: string };
    assertString(requestItemId, "requestItemId");
    assertString(offeredItemId, "offeredItemId");

    // Verify that the request item exists and is a request
    const requestItemRef = db.collection("items").doc(requestItemId);
    const requestItemDoc = await requestItemRef.get();
    
    if (!requestItemDoc.exists) {
      throw new HttpsError("not-found", "Pedido de ajuda não encontrado");
    }
    
    const requestItemData = requestItemDoc.data();
    if (requestItemData?.itemType !== "request") {
      throw new HttpsError("failed-precondition", "Este item não é um pedido de ajuda");
    }

    // Verify that the user is the owner of the request (only the person who needs help can remove offers)
    if (requestItemData.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "Você só pode remover ofertas dos seus próprios pedidos");
    }

    // Remove the item from the offeredItems array
    await requestItemRef.update({
      offeredItems: admin.firestore.FieldValue.arrayRemove(offeredItemId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      ok: true, 
      requestItemId,
      offeredItemId,
    };
  }
);
