import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFbI6nkr-vJ3pyKMNBwqJeeHI1qWtD2Ko",
  authDomain: "yks-ranked.firebaseapp.com",
  projectId: "yks-ranked",
  storageBucket: "yks-ranked.firebasestorage.app",
  messagingSenderId: "235298798589",
  appId: "1:235298798589:web:0f01ef5574e85d8d073794",
  measurementId: "G-VBVJ4TYXHZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
