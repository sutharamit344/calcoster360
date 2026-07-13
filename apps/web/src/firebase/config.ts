import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDmKYXBLw-4Trx1HpB6YJF5OV_3dNb3GY0",
  authDomain: "calcoster360.firebaseapp.com",
  projectId: "calcoster360",
  storageBucket: "calcoster360.firebasestorage.app",
  messagingSenderId: "481291921562",
  appId: "1:481291921562:web:b73c0adaff3c53bc095723",
  measurementId: "G-WVJ0Q6ZMY7"
};

// Initialize Firebase (singleton pattern for SSR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics conditionally (client-side only)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
