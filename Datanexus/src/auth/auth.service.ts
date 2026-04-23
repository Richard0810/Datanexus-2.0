import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService implements OnModuleInit {
  onModuleInit() {
    if (admin.apps.length === 0) {
      try {
        // En Cloud Workstations / Studio, el Project ID suele estar disponible.
        // Si tienes un archivo JSON de credenciales, podrías usar credential: admin.credential.cert(path)
        admin.initializeApp({
          projectId: "datanexus-proyecto-richard",
        });
        console.log('Firebase Admin inicializado correctamente.');
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
