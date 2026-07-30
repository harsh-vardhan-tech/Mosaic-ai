import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Client-side Firebase config — safe to expose (these are public identifiers,
// not secrets; access is governed by Firebase Auth + security rules, not by
// hiding these values). Reads from NEXT_PUBLIC_* so it's inlined at build time.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// If the Firebase env vars aren't filled in yet, getAuth() throws
// "auth/invalid-api-key" at import time and crashes the ENTIRE app before a
// single page can render. Guard the init so the app still boots and can show
// a friendly "add your Firebase keys" notice instead of a hard crash.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Next.js hot-reloads modules in dev — getApps() guard stops
// "Firebase App named '[DEFAULT]' already exists" crashes.
export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
