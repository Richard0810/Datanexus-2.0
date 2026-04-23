
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../serviceAccountKey.json';

@Injectable()
export class AuthService implements OnModuleInit {
  onModuleInit() {
    // Check if the app is already initialized to prevent errors
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      // Handle token verification error (e.g., token expired, invalid)
      console.error('Error verifying token:', error);
      return null;
    }
  }
}
