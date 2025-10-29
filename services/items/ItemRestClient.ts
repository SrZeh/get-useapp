/**
 * Firestore REST API client for items
 * 
 * Provides fallback REST API methods when Firestore SDK is unavailable.
 * This maintains backward compatibility and handles network issues gracefully.
 */

import { auth } from "@/lib/firebase";
import { API_CONFIG, FIRESTORE_COLLECTIONS } from "@/constants/api";

const PROJECT_ID = API_CONFIG.FIREBASE_PROJECT_ID;
const DB_NAME = API_CONFIG.FIRESTORE_DB_NAME;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_NAME}/documents`;
const ITEMS_PATH = FIRESTORE_COLLECTIONS.ITEMS;

/**
 * Check if an error indicates Firestore is unavailable
 */
export function isUnavailable(e: unknown): boolean {
  if (typeof e === 'object' && e !== null) {
    const error = e as { code?: unknown; message?: unknown };
    return error.code === "unavailable" || /unavailable/i.test(String(error.message ?? e));
  }
  return /unavailable/i.test(String(e));
}

/**
 * Get authentication token for REST API calls
 */
async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sem usuário autenticado");
  return user.getIdToken();
}

// ====== REST value encoding ======
type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

function toFsValue(v: unknown): FirestoreValue | undefined {
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

function encodeFieldsForRest(obj: Record<string, unknown>) {
  const fields: Record<string, FirestoreValue> = {};
  Object.entries(obj).forEach(([k, v]) => {
    const fv = toFsValue(v);
    if (fv !== undefined) fields[k] = fv;
  });
  return { fields };
}

// ====== REST API methods ======

/**
 * Create an item via REST API
 * @param docData - Item document data
 * @returns Created item ID
 */
export async function restCreateItemFull(docData: Record<string, unknown>): Promise<string> {
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
  return id ?? "";
}

/**
 * Update an item via REST API (partial update)
 * @param itemId - Item ID to update
 * @param patch - Fields to update
 * @returns Success status
 */
export async function restPatchItem(itemId: string, patch: Record<string, unknown>): Promise<boolean> {
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

/**
 * Create a simple item via REST API (legacy method)
 * @param data - Item data with title
 * @returns Created document response
 */
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

interface RestDocument {
  name: string;
  fields?: {
    title?: { stringValue?: string };
  };
  createTime?: string;
}

/**
 * List items via REST API
 * @param pageSize - Number of items to fetch
 * @returns Array of items with id, title, and createdAt
 */
export async function restListItems(pageSize = 20): Promise<Array<{ id: string; title: string; createdAt?: string }>> {
  const token = await getToken();
  const url = `${BASE}/${ITEMS_PATH}?pageSize=${pageSize}&orderBy=createTime desc`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json() as { documents?: RestDocument[] };
  if (!res.ok) throw new Error(JSON.stringify(json));
  return (json.documents ?? []).map((d: RestDocument) => ({
    id: d.name.split("/").pop() ?? "",
    title: d.fields?.title?.stringValue ?? "",
    createdAt: d.createTime,
  }));
}

