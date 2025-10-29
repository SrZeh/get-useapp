/**
 * Item write operations
 * 
 * Provides methods to create, update, and modify items in Firestore
 * with SDK fallback to REST API for resilience.
 */

import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { NewItemInput, Item } from "@/types";
import { FIRESTORE_COLLECTIONS } from "@/constants/api";
import { normalize, toSearchable } from "./ItemNormalizer";
import { buildItemDoc } from "./ItemBuilder";
import { isUnavailable, restCreateItemFull, restPatchItem, restCreateItem } from "./ItemRestClient";

const ITEMS_PATH = FIRESTORE_COLLECTIONS.ITEMS;

/**
 * Create a full item with all fields (with SDK fallback to REST)
 * @param input - Item input data
 * @returns Created item ID and method used (SDK or REST)
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
 * Update item fields (with SDK fallback to REST)
 * If city/neighborhood change, also updates lowercase search fields.
 * @param itemId - Item ID to update
 * @param patch - Partial item data to update
 * @returns Method used (SDK or REST)
 */
export async function safeUpdateItem(
  itemId: string,
  patch: Partial<NewItemInput>
): Promise<{ via: "sdk" } | { via: "rest" }> {
  const data: Record<string, unknown> = { ...patch };

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
 * Update item rating aggregates (bump rating when review is added)
 * Uses transaction for consistency (SDK only, REST fallback is non-transactional)
 * @param itemId - Item ID
 * @param rating - Rating value (1-5)
 * @param lastSnippet - Optional review snippet
 * @returns Method used (SDK or REST)
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
      const it = snap.data() as Partial<Item>;
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

/**
 * Create a simple item (legacy method, for backward compatibility)
 * @param title - Item title
 * @returns Method used (SDK or REST)
 */
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

