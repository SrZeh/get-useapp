// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  initializeFirestore,
  setLogLevel,
  type Firestore,
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

// AUTH
export const auth: Auth = getAuth(app);

// FIRESTORE — agora no DB nomeado "appdb"
export const db: Firestore =
  Platform.OS === "web"
    ? getFirestore(app, "appdb") // ⬅️ web usa getFirestore no banco nomeado
    : initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, "appdb");

// menos ruído
setLogLevel("error");

// STORAGE
export const storage = getStorage(app);
