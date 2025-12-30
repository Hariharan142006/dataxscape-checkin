import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// You need to set GOOGLE_APPLICATION_CREDENTIALS env var or 
// provide the service account object directly if running locally without gcloud auth.
// for deployment on Firebase Functions, it picks up default creds automatically.

if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // If we have the key as a JSON string in env (good for Vercel/cloud)
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            initializeApp({
                credential: cert(serviceAccount)
            });
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", e);
            initializeApp(); // Fallback to default
        }
    } else {
        initializeApp(); // Uses GOOGLE_APPLICATION_CREDENTIALS or default cloud identity
    }
}

const db = getFirestore();

export { db };
