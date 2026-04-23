import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// IMPORTANTE: Estos valores deben ser los reales de tu consola de Firebase.
// Si el registro falla con "invalid-api-key", verifica que el apiKey sea el correcto.
const firebaseConfig = {
  apiKey: "AIzaSyB-EXAMPLE-KEY-DATANEXUS", // REEMPLAZA ESTO con tu API Key real de Firebase Console
  authDomain: "datanexus-proyecto-richard.firebaseapp.com",
  projectId: "datanexus-proyecto-richard",
  storageBucket: "datanexus-proyecto-richard.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

let app: FirebaseApp;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Error al inicializar Firebase. Revisa tu configuración en src/lib/firebase.ts", error);
  throw error;
}

const auth = getAuth(app);

export { app, auth };
