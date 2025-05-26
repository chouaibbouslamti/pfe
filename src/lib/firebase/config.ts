
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// IMPORTANT: Ensure your Firebase project configuration is correctly set up
// in your environment variables. These are typically stored in a .env.local file
// at the root of your project.
//
// Example .env.local file content:
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
// NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
//
// The 'auth/invalid-api-key' error almost always means that NEXT_PUBLIC_FIREBASE_API_KEY
// is missing, incorrect, or not loaded properly by your Next.js environment.
// The 'app/no-app' error means initializeApp() was not successfully called before
// trying to use other Firebase services like getAuth().
//
// After updating .env.local (or any other environment variable source),
// YOU MUST RESTART YOUR DEVELOPMENT SERVER for the changes to take effect.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;

// Check if the API key is provided. This is primarily for developer feedback.
// Firebase's initializeApp will perform the ultimate validation.
if (!firebaseConfig.apiKey) {
  console.error(
    "Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or empty in your environment variables. " +
    "Firebase initialization will likely fail with an 'auth/invalid-api-key' error. " +
    "Please check your .env.local file and restart the development server."
  );
}

// Initialize Firebase
// This pattern ensures that Firebase is initialized only once.
if (getApps().length === 0) {
  // If firebaseConfig.apiKey is missing or invalid, initializeApp will throw an error (e.g., auth/invalid-api-key).
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Get the already initialized app
}

// Initialize Firebase services using the app instance.
// These calls will fail if 'app' is not a correctly initialized FirebaseApp.
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
