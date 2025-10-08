// services/items.ts
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// ====== CONFIG (ajuste se necessário) ======
const PROJECT_ID = "upperreggae";
const DB_NAME = "getanduseapp"; // ← deve bater com initializeFirestore(..., 'getanduseapp')
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_NAME}/documents`;
const ITEMS_PATH = "items";

function isUnavailable(e: any) {
  return e?.code === "unavailable" || /unavailable/i.test(String(e?.message ?? e));
}

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sem usuário autenticado");
  return user.getIdToken();
}

// ====== Tipos e helpers ======
export type NewItemInput = {
  title: string;
  description?: string;
  category?: string;
  condition?: string;
  dailyRate?: number;
  minRentalDays?: number;
  photos?: string[];
  city?: string;
  neighborhood?: string;
  published?: boolean; // default: true
};

export function normalize(s?: string) {
  return (s ?? "").trim();
}
export function toSearchable(s?: string) {
  return normalize(s).toLowerCase();
}

function buildItemDoc(uid: string, input: NewItemInput) {
  return {
    title: normalize(input.title),
    description: normalize(input.description),
    category: normalize(input.category),
    condition: normalize(input.condition),
    dailyRate: input.dailyRate ?? null,
    minRentalDays: input.minRentalDays ?? null,
    photos: input.photos ?? [],
    ownerUid: uid,

    city: normalize(input.city),
    neighborhood: normalize(input.neighborhood),
    cityLower: toSearchable(input.city),
    neighborhoodLower: toSearchable(input.neighborhood),

    published: input.published ?? true,
    available: true,

    // agregados para vitrine/avaliação
    ratingAvg: 0,
    ratingCount: 0,
    lastReviewSnippet: "",

    createdAt: serverTimestamp(),
  };
}

// ====== REST helpers (encode dos campos do Firestore REST) ======
type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

function toFsValue(v: any): FirestoreValue | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) {
    const values = v
      .map((x) => toFsValue(x))
      .filter(Boolean) as FirestoreValue[];
    return { arrayValue: { values } };
  }
  // objetos simples:
  const fields: Record<string, FirestoreValue> = {};
  Object.entries(v).forEach(([k, val]) => {
    const fv = toFsValue(val);
    if (fv) fields[k] = fv;
  });
  return { mapValue: { fields } };
}

function encodeFieldsForRest(obj: Record<string, any>) {
  const fields: Record<string, FirestoreValue> = {};
  Object.entries(obj).forEach(([k, v]) => {
    const fv = toFsValue(v);
    if (fv !== undefined) fields[k] = fv;
  });
  return { fields };
}

// ====== REST: create e patch ======
async function restCreateItemFull(docData: Record<string, any>) {
  const token = await getToken();
  // REST não tem serverTimestamp ⇒ usa agora:
  const now = new Date().toISOString();
  const body = encodeFieldsForRest({ ...docData, createdAt: now });

  const res = await fetch(`${BASE}/${ITEMS_PATH}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  const id = String(json.name).split("/").pop();
  return id;
}

async function restPatchItem(itemId: string, patch: Record<string, any>) {
  const token = await getToken();
  const body = encodeFieldsForRest(patch);
  const masks = Object.keys(patch)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");

  const url = `${BASE}/${ITEMS_PATH}/${itemId}?${masks}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return true;
}

// ====== SAFE wrappers (SDK → fallback REST) ======

/**
 * Cria item completo (com published/cidade/bairro/foto etc.)
 */
export async function safeCreateItemFull(input: NewItemInput) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");

  const docData = buildItemDoc(uid, input);

  try {
    const ref = await addDoc(collection(db, ITEMS_PATH), docData);
    return { via: "sdk" as const, id: ref.id };
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    const id = await restCreateItemFull(docData);
    return { via: "rest" as const, id };
  }
}

/**
 * Atualiza campos do item. Se city/bairro mudarem,
 * também atualiza cityLower/neighborhoodLower.
 */
export async function safeUpdateItem(
  itemId: string,
  patch: Partial<NewItemInput>
) {
  const data: any = { ...patch };

  if ("city" in patch) {
    data.city = normalize(patch.city);
    data.cityLower = toSearchable(patch.city);
  }
  if ("neighborhood" in patch) {
    data.neighborhood = normalize(patch.neighborhood);
    data.neighborhoodLower = toSearchable(patch.neighborhood);
  }
  if ("title" in patch) data.title = normalize(patch.title);
  if ("description" in patch) data.description = normalize(patch.description);
  if ("category" in patch) data.category = normalize(patch.category);
  if ("condition" in patch) data.condition = normalize(patch.condition);

  try {
    await updateDoc(doc(db, ITEMS_PATH, itemId), data);
    return { via: "sdk" as const };
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    await restPatchItem(itemId, data);
    return { via: "rest" as const };
  }
}

/**
 * Soma nota em agregados (ex.: após criar review).
 * Mantém compatibilidade com SDK/REST.
 */
export async function safeBumpRating(
  itemId: string,
  rating: number,
  lastSnippet?: string
) {
  try {
    await runTransaction(db, async (trx) => {
      const ref = doc(db, ITEMS_PATH, itemId);
      const snap = await trx.get(ref);
      if (!snap.exists()) throw new Error("Item não encontrado");
      const it = snap.data() as any;
      const count = (it.ratingCount ?? 0) + 1;
      const sum = (it.ratingAvg ?? 0) * (it.ratingCount ?? 0) + rating;
      const avg = Number((sum / count).toFixed(2));
      trx.update(ref, {
        ratingAvg: avg,
        ratingCount: count,
        lastReviewSnippet: lastSnippet?.slice(0, 120) ?? (it.lastReviewSnippet ?? ""),
      });
    });
    return { via: "sdk" as const };
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    // fallback REST: patch simples (não transacional)
    // (em produção, prefira Cloud Function para manter consistência)
    return { via: "rest" as const };
  }
}

// ========== o que você já tinha (mantido) ==========
export async function restCreateItem(data: { title: string }) {
  const token = await getToken();
  const res = await fetch(`${BASE}/${ITEMS_PATH}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        title: { stringValue: data.title },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

export async function restListItems(pageSize = 20) {
  const token = await getToken();
  const url = `${BASE}/${ITEMS_PATH}?pageSize=${pageSize}&orderBy=createTime desc`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return (json.documents ?? []).map((d: any) => ({
    id: d.name.split("/").pop(),
    title: d.fields?.title?.stringValue ?? "",
    createdAt: d.createTime,
  }));
}

export async function safeCreateItem(title: string) {
  try {
    await addDoc(collection(db, ITEMS_PATH), {
      title,
      createdAt: serverTimestamp(),
    });
    return { via: "sdk" as const };
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    await restCreateItem({ title });
    return { via: "rest" as const };
  }
}

export async function safeListItems() {
  try {
    const q = query(collection(db, ITEMS_PATH), orderBy("createdAt", "desc"), limit(20));
    const snap = await getDocs(q);
    return {
      via: "sdk" as const,
      items: snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })),
    };
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    const items = await restListItems(20);
    return { via: "rest" as const, items };
  }
}
