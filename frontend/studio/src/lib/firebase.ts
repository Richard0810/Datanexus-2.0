import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración cargada desde variables de entorno para mayor seguridad en el despliegue
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDj1kI2I9QVPkdtRadwfVCC-NzablKdQbo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-9921318265-313d2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-9921318265-313d2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-9921318265-313d2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "674332303466",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:674332303466:web:9aa581777c60fe88bcaa13"
};

let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase inicializado correctamente.");
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  throw error;
}

const auth = getAuth(app);

export { app, auth };
