import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export function verifyIdToken(token: string) {
  return admin.auth().verifyIdToken(token);
}