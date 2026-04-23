import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// CONFIGURACIÓN OFICIAL PROYECTO: datanexus-493420
// Se hardcodea para evitar conflictos con proyectos anteriores o variables de entorno cacheadas
const firebaseConfig = {
  apiKey: "AIzaSyCFRbmjKDpcN1ZrQwC-kR9jTp0pwYg4pu4",
  authDomain: "datanexus-493420.firebaseapp.com",
  projectId: "datanexus-493420",
  storageBucket: "datanexus-493420.firebasestorage.app",
  messagingSenderId: "751901670026",
  appId: "1:751901670026:web:0a4502d42a429ac7a1cb73",
  measurementId: "G-EGLTRZ31YF"
};

let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase inicializado correctamente con el proyecto: datanexus-493420");
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  throw error;
}

const auth = getAuth(app);

export { app, auth };
