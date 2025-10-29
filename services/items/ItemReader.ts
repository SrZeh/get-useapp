/**
 * Item read operations
 * 
 * Provides methods to read items from Firestore with SDK fallback to REST API.
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import type { Item } from "@/types";
import { FIRESTORE_COLLECTIONS } from "@/constants/api";
import { isUnavailable, restListItems } from "./ItemRestClient";

const ITEMS_PATH = FIRESTORE_COLLECTIONS.ITEMS;

/**
 * Get a single item by ID (SDK only, no REST fallback for single item)
 * @param itemId - Item ID
 * @returns Item or null if not found
 */
export async function safeGetItem(itemId: string): Promise<Item | null> {
  try {
    const snap = await getDoc(doc(db, ITEMS_PATH, itemId));
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...(snap.data() as Partial<Item>) } as Item;
  } catch (e) {
    throw e; // No REST fallback for single item fetch
  }
}

/**
 * List items with SDK fallback to REST API
 * @returns Items list with source indicator (SDK or REST)
 */
export async function safeListItems(): Promise<
  | { via: "sdk"; items: Item[] }
  | { via: "rest"; items: Array<{ id: string; title: string; createdAt?: string }> }
> {
  try {
    const q = query(collection(db, ITEMS_PATH), orderBy("createdAt", "desc"), limit(20));
    const snap = await getDocs(q);
    return {
      via: "sdk" as const,
      items: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<Item>) } as Item)),
    };
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    const items = await restListItems(20);
    return { via: "rest" as const, items };
  }
}


