import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Usamos variables de entorno con el prefijo NEXT_PUBLIC para que sean accesibles en el navegador
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;

// Verificamos que el apiKey esté presente para evitar errores silenciosos
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('EXAMPLE')) {
  console.warn("⚠️ Firebase: El API Key es inválido o no se ha configurado en el archivo .env");
}

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  throw error;
}

const auth = getAuth(app);

export { app, auth };
