
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService implements OnModuleInit {
  onModuleInit() {
    // Inicialización de Firebase Admin para el backend sin depender de archivos JSON locales.
    if (admin.apps.length === 0) {
      try {
        admin.initializeApp({
          projectId: "datanexus-proyecto-richard",
        });
        console.log('Firebase Admin inicializado correctamente.');
      } catch (error) {
        console.warn('Advertencia: Firebase Admin no pudo inicializarse con las credenciales por defecto. Esto es normal en entornos locales si no se ha configurado GOOGLE_APPLICATION_CREDENTIALS.', error.message);
      }
    }
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Error verificando el token de Firebase:', error);
      return null;
    }
  }
}
