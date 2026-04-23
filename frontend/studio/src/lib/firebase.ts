import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// IMPORTANTE: Asegúrate de que estos valores coincidan con los de tu consola de Firebase.
// He puesto valores genéricos basados en tu ID de proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyB-EXAMPLE-KEY-DATANEXUS", // Deberás obtener la real de la consola si esta no funciona
  authDomain: "datanexus-proyecto-richard.firebaseapp.com",
  projectId: "datanexus-proyecto-richard",
  storageBucket: "datanexus-proyecto-richard.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

export { app, auth };
