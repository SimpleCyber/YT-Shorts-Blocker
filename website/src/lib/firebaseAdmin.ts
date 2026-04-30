import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable");
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    // Fix escaped newlines in the private key which causes Invalid PEM errors
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Rethrow to prevent using uninitialized services
    throw new Error(`Firebase admin initialization failed: ${error instanceof Error ? error.message : error}`);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
