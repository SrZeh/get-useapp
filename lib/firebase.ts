// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  type Firestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import { createAuth } from "./auth"; // 👈 resolve para .native.ts ou .web.ts

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

// ✅ Auth sem require dinâmico no arquivo principal
export const auth = createAuth(app);

// Firestore nomeado "appdb"
export const db: Firestore =
  Platform.OS === "web"
    ? getFirestore(app, "appdb")
    : initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, "appdb");

setLogLevel("error");

export const storage = getStorage(app);
