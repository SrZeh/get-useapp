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

export const firebaseConfig = {
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
// IMPORTANTE: Sempre usar "appdb" (não [DEFAULT])
// PROBLEMA: Na web, initializeFirestore pode não funcionar corretamente
// SOLUÇÃO: Sempre usar getFirestore(app, "appdb") explicitamente
export const db: Firestore = (() => {
  // Na web, sempre usar getFirestore com "appdb" explicitamente
  // Isso garante que sempre obtemos/criamos o database "appdb"
  if (Platform.OS === "web") {
    // IMPORTANTE: NUNCA chamar getFirestore(app) sem o segundo parâmetro
    // Sempre passar "appdb" como segundo parâmetro
    return getFirestore(app, "appdb");
  } else {
    // Mobile: usar initializeFirestore para garantir inicialização correta
    try {
      return initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, "appdb");
    } catch (error: any) {
      // Se já foi inicializado, obter explicitamente com appdb
      if (error?.code === "failed-precondition") {
        return getFirestore(app, "appdb");
      }
      throw error;
    }
  }
})();

// Verificar se realmente está usando "appdb" (não [DEFAULT])
// @ts-ignore - _databaseId é uma propriedade interna
const dbId = db._databaseId?.databaseId || "unknown";
if (dbId !== "appdb") {
  console.error(`❌ ERRO CRÍTICO: Firestore está usando database "${dbId}" ao invés de "appdb"!`);
  console.error("Isso causará problemas com as regras de segurança.");
  console.error("Possíveis causas:");
  console.error("1. Algum código está chamando getFirestore(app) sem o segundo parâmetro");
  console.error("2. initializeFirestore na web não está funcionando corretamente");
  console.error("3. Há uma inicialização anterior do Firestore como [DEFAULT]");
  console.error("SOLUÇÃO: Recarregue a página completamente (Ctrl+Shift+R ou Cmd+Shift+R)");
  
  // Tentar forçar a criação de appdb se ainda não existe
  if (Platform.OS === "web") {
    console.warn("⚠️ Tentando forçar criação de appdb...");
    try {
      // @ts-ignore - Tentar acessar diretamente
      const appDatabases = app._delegate?._services?._firestoreInstances;
      if (appDatabases) {
        console.log("Databases disponíveis:", Object.keys(appDatabases));
      }
    } catch (e) {
      console.error("Não foi possível verificar databases:", e);
    }
  }
} else {
  console.log("✅ Firestore usando database 'appdb' corretamente");
}

setLogLevel("error");

export const storage = getStorage(app);
