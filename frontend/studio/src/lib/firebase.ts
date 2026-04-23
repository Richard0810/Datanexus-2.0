import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// CONFIGURACIÓN OFICIAL PROYECTO: studio-9921318265-313d2
const firebaseConfig = {
  apiKey: "AIzaSyDj1kI2I9QVPkdtRadwfVCC-NzablKdQbo",
  authDomain: "studio-9921318265-313d2.firebaseapp.com",
  projectId: "studio-9921318265-313d2",
  storageBucket: "studio-9921318265-313d2.firebasestorage.app",
  messagingSenderId: "674332303466",
  appId: "1:674332303466:web:9aa581777c60fe88bcaa13"
};

let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase inicializado correctamente con el proyecto: studio-9921318265-313d2");
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  throw error;
}

const auth = getAuth(app);

export { app, auth };
