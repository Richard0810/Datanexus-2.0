
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Esta configuración es pública y segura de incluir en el código.
// He incluido valores de ejemplo basados en tu proyecto. 
// Deberás actualizarlos con los valores reales desde la consola de Firebase si estos no funcionan.
const firebaseConfig = {
  apiKey: "AIzaSyB-EXAMPLE-KEY-FOR-DATANEXUS", // Reemplaza con tu API Key real si es necesario
  authDomain: "datanexus-proyecto-richard.firebaseapp.com",
  projectId: "datanexus-proyecto-richard",
  storageBucket: "datanexus-proyecto-richard.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

export { app, auth };
