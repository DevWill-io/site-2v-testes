// ==========================================
// Firebase Admin SDK — inicialização
// ==========================================
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error("[api] FIREBASE_SERVICE_ACCOUNT não configurada");
  }
  const credenciais = JSON.parse(serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(credenciais),
    databaseURL: "https://muralturmanormal-default-rtdb.firebaseio.com",
  });
}

export const db = admin.database();
export const auth = admin.auth;