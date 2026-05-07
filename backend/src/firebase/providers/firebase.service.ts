import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    // Path to your service account JSON
    const serviceAccountPath = path.join(
      process.cwd(),
      'src',
      'config',
      'firebase-adminsdk.json',
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log('Firebase Admin Initialized');
    }
  }

  public async sendPush(
    fcmToken: string,
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const message = {
        notification: { title, body },
        data: data || {},
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('FCM Error:', error);
    }
  }
}
