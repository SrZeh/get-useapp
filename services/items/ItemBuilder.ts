/**
 * Item document builder
 * 
 * Transforms item input data into Firestore document format
 * with proper normalization and default values.
 */

import { serverTimestamp } from "firebase/firestore";
import type { NewItemInput } from "@/types";
import { TERMS_VERSION } from "@/constants/terms";
import { normalize, toSearchable } from "./ItemNormalizer";

/**
 * Build a Firestore document from item input
 * @param uid - Owner user ID
 * @param input - Item input data
 * @returns Firestore document data
 */
export function buildItemDoc(uid: string, input: NewItemInput) {
  // Calculate isFree from dailyRate (0 means free)
  const dailyRate = input.dailyRate ?? 0;
  const isFree = dailyRate === 0;
  const termsAccepted = Boolean(input.termsAccepted);
  const termsVersion = input.termsAcceptedVersion?.trim();

  return {
    title: normalize(input.title),
    description: normalize(input.description),
    category: normalize(input.category),
    condition: normalize(input.condition),
    dailyRate: dailyRate,
    minRentalDays: input.minRentalDays ?? null,
    photos: input.photos ?? [],
    ownerUid: uid,

    city: normalize(input.city),
    neighborhood: normalize(input.neighborhood),
    cityLower: toSearchable(input.city),
    neighborhoodLower: toSearchable(input.neighborhood),

    published: input.published ?? true,
    available: true,
    isFree: isFree,
    termsAccepted: termsAccepted,
    termsAcceptedAt: termsAccepted ? serverTimestamp() : null,
    termsAcceptedVersion: termsAccepted ? (termsVersion && termsVersion.length > 0 ? termsVersion : TERMS_VERSION) : null,

    // agregados para vitrine/avaliação
    ratingAvg: 0,
    ratingCount: 0,
    lastReviewSnippet: "",

    createdAt: serverTimestamp(),
  };
}


