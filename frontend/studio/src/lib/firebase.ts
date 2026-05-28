import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Usamos variables de entorno para que el despliegue sea dinámico y seguro
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

/**
 * Protección de Inicialización (Initialization Guarding):
 * Solo inicializamos Firebase si estamos en el cliente o si tenemos la API Key.
 * Esto evita que el build de Vercel falle si las variables de entorno no están presentes en ese paso.
 */
if (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase inicializado correctamente.");
    } else {
      app = getApp();
    }
    auth = getAuth(app);
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
  }
}

export { app, auth };