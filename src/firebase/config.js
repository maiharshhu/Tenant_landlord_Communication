// Firebase core
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firestore (with persistent cache + long polling for tough networks)
import {
    initializeFirestore,
    persistentLocalCache,
    persistentSingleTabManager,
} from "firebase/firestore";

// Realtime Database (RTDB) for chat + roles
import { getDatabase } from "firebase/database";

// Storage for uploads (images/videos, avatars)
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
    experimentalAutoDetectLongPolling: true,
    // experimentalForceLongPolling: true, // uncomment if still blocked
});
