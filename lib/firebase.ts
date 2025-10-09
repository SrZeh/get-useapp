// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, setLogLevel, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// AUTH — simples e compatível com sua versão (sem react-native submódulo)
export const auth: Auth = getAuth(app);

// FIRESTORE — RN/Expo: long-polling para acabar com “Write stream transport errored”
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      // Se ainda spammar, troque pela linha abaixo:
      // experimentalForceLongPolling: true,
    });
  } catch (e) {
    console.warn("initializeFirestore falhou, reutilizando instância existente:", e);
    const { getFirestore } = require("firebase/firestore");
    return getFirestore(app);
  }
})();

// (opcional) reduzir ruído do console
setLogLevel("error");

// STORAGE
export const storage = getStorage(app);
