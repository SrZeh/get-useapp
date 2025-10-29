/**
 * API endpoints and configuration constants
 */

export const API_CONFIG = {
  FUNCTIONS_REGION: "southamerica-east1",
  FUNCTIONS_BASE_URL: process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL ?? "https://southamerica-east1-upperreggae.cloudfunctions.net",
  FIREBASE_PROJECT_ID: "upperreggae",
  FIRESTORE_DB_NAME: "getanduseapp",
} as const;

export const FIRESTORE_COLLECTIONS = {
  ITEMS: "items",
  RESERVATIONS: "reservations",
  TRANSACTIONS: "transactions",
  USERS: "users",
  THREADS: "threads",
  MESSAGES: "messages",
} as const;

export const STORAGE_PATHS = {
  ITEMS: "items",
  RETURNS: "returns",
  USER_IMAGES: "user-images",
} as const;

