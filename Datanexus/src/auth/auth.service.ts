
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService implements OnModuleInit {
  onModuleInit() {
    if (admin.apps.length === 0) {
      try {
        // Inicializamos con el nuevo Project ID proporcionado por el usuario
        admin.initializeApp({
          projectId: "datanexus-493420",
        });
        console.log('Firebase Admin inicializado correctamente para el proyecto: datanexus-493420');
      } catch (error) {
        console.error('Error inicializando Firebase Admin:', error.message);
      }
    }
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Error verificando el token de Firebase:', error.message);
      return null;
    }
  }
}
