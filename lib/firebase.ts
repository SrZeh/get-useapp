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
// SOLUÇÃO: Na web, usar getFirestore com "appdb" explicitamente
// No mobile, usar initializeFirestore para garantir inicialização correta
export const db: Firestore = (() => {
  if (Platform.OS === "web") {
    // Na web, getFirestore com "appdb" deve funcionar corretamente
    // Se já existe uma instância [DEFAULT], getFirestore(app, "appdb") criará uma nova instância "appdb"
    try {
      const firestore = getFirestore(app, "appdb");
      console.log("✅ Firestore web inicializado com 'appdb'");
      // Tentar verificar o database ID na web também
      try {
        const dbInternal = firestore as any;
        const dbId = dbInternal._databaseId?.databaseId 
          || dbInternal._delegate?._databaseId?.databaseId
          || dbInternal._settings?.databaseId
          || "unknown";
        console.log("🔍 Database ID detectado na web:", dbId);
        if (dbId !== "appdb" && dbId !== "unknown") {
          console.warn("⚠️ ATENÇÃO: Database ID na web é:", dbId, "- esperado: appdb");
        }
      } catch (e) {
        console.log("ℹ️ Não foi possível verificar database ID na web (normal)");
      }
      return firestore;
    } catch (error: any) {
      console.error("❌ Erro ao obter Firestore na web:", error);
      // Fallback: tentar sem nome (não ideal, mas melhor que falhar)
      return getFirestore(app);
    }
  } else {
    // Mobile: usar initializeFirestore para garantir inicialização correta
    try {
      return initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, "appdb");
    } catch (error: any) {
      // Se já foi inicializado, obter explicitamente com appdb
      if (error?.code === "failed-precondition" || error?.message?.includes("already been called")) {
        console.warn("⚠️ Firestore já inicializado, obtendo instância existente...");
        return getFirestore(app, "appdb");
      }
      // Se outro erro, tentar getFirestore como fallback
      console.warn("⚠️ Erro ao inicializar Firestore, tentando getFirestore...", error);
      return getFirestore(app, "appdb");
    }
  }
})();

// Verificar se realmente está usando "appdb" (não [DEFAULT])
// Na web, a verificação do database ID pode não funcionar corretamente
// Mas confiamos que getFirestore(app, "appdb") está funcionando
if (Platform.OS !== "web") {
  // @ts-ignore - _databaseId é uma propriedade interna
  const dbInternal = db as any;
  const dbId = dbInternal._databaseId?.databaseId 
    || dbInternal._delegate?._databaseId?.databaseId
    || "unknown";
  
  if (dbId !== "appdb") {
    console.error(`❌ ERRO CRÍTICO: Firestore está usando database "${dbId}" ao invés de "appdb"!`);
    console.error("Isso causará problemas com as regras de segurança.");
  } else {
    console.log("✅ Firestore usando database 'appdb' corretamente");
  }
} else {
  // Na web, assumimos que está correto (a verificação do ID não é confiável)
  console.log("✅ Firestore inicializado (web - database ID não verificável)");
}

setLogLevel("error");

export const storage = getStorage(app);
