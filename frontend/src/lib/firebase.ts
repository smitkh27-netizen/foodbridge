import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBTgtEgPenRKYQ6oW9KMgTdiOcfvwT4vsw",
  authDomain: "foodbridge-b3972.firebaseapp.com",
  projectId: "foodbridge-b3972",
  storageBucket: "foodbridge-b3972.firebasestorage.app",
  messagingSenderId: "551713343396",
  appId: "1:551713343396:web:fb10ffcdef8941e6dca331",
  measurementId: "G-LS72ZP2687"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally (it only works in browser, not during SSR)
export const analytics = typeof window !== "undefined" 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;

export default app;
