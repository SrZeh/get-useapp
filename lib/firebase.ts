// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import {
  getFirestore, initializeFirestore,
  setLogLevel, type Firestore
} from "firebase/firestore";
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

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// === AUTH ===
// Web: getAuth(app)
// Nativo: initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
let authInstance: Auth;
if (Platform.OS === "web") {
  authInstance = getAuth(app);
} else {
  // Importantíssimo: não importe 'firebase/auth/react-native' no topo.
  const { getReactNativePersistence } = require("firebase/auth/react-native");
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
export const auth = authInstance;

// === FIRESTORE — DB nomeado "appdb" ===
export const db: Firestore =
  Platform.OS === "web"
    ? getFirestore(app, "appdb")
    : initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, "appdb");

// menos ruído no console
setLogLevel("error");

// === STORAGE ===
export const storage = getStorage(app);
