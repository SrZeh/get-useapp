// src/types/firebase-auth-rn.d.ts
import type { Persistence, ReactNativeAsyncStorage } from "firebase/auth";

declare module "firebase/auth" {
  // Augmenta o módulo para o TS "enxergar" no RN
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage
  ): Persistence;
}
