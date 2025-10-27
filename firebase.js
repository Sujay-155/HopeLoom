// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpEFmEWRmiP1VmiXlU7Ra9A7Bvgzh6JKI",
  authDomain: "hopeloom-e1bae.firebaseapp.com",
  projectId: "hopeloom-e1bae",
  storageBucket: "hopeloom-e1bae.firebasestorage.app",
  messagingSenderId: "1070597757737",
  appId: "1:1070597757737:web:3776cca8398909a183b538"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
