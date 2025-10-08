// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDgl2Bpk86KmwKvs_z83p5ZADlBaz9LwRk",
  authDomain: "upperreggae.firebaseapp.com",
  projectId: "upperreggae",
  storageBucket: "upperreggae.appspot.com",
  messagingSenderId: "497063452237",
  appId: "1:497063452237:web:9b80a81d703be95fab8604",
  measurementId: "G-X8P30NJSGN",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---------- AUTH (Web vs Nativo) ----------
export const auth: Auth = (() => {
  if (Platform.OS === "web") return getAuth(app);
  const { getReactNativePersistence } = require("firebase/auth");
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
})();

// ---------- FIRESTORE (usar banco nomeado: appdb) ----------
export const db: Firestore = (() => {
  try {
    // 1ª chamada com settings (força long polling no RN) + databaseId "appdb"
    return initializeFirestore(
      app,
      { experimentalForceLongPolling: true },
      "appdb"
    );
  } catch (e) {
    console.warn("initializeFirestore falhou, tentando getFirestore:", e);
    // fallback também apontando para "appdb"
    return getFirestore(app, "appdb");
  }
})();

// ---------- STORAGE ----------
export const storage = getStorage(app);

// (opcional p/ checar em runtime)
// console.log("[client Firestore DB]", (db as any)?._databaseId?.database ?? "(default)");
