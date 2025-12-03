import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

// ------------------------------------------------------------------
// IMPORTANT: REPLACE THIS CONFIG WITH YOUR OWN FROM FIREBASE CONSOLE
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "replace-with-your-project-id.firebaseapp.com",
  projectId: "replace-with-your-project-id",
  storageBucket: "replace-with-your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Check if config is still placeholder
export const isFirebaseConfigured = firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY";

let auth: any;
let googleProvider: any;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.warn("Firebase initialization failed.", e);
  }
} else {
  console.warn("Firebase not configured. App will run in Demo Mode if selected.");
}

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };