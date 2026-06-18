import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnN3BNpEttbBSXJ7ryokAMb__lSZ2fCHE",
  authDomain: "cf2026-c4c0f.firebaseapp.com",
  databaseURL: "https://cf2026-c4c0f-default-rtdb.firebaseio.com",
  projectId: "cf2026-c4c0f",
  storageBucket: "cf2026-c4c0f.firebasestorage.app",
  messagingSenderId: "1002087725469",
  appId: "1:1002087725469:web:6cabdff4d8fa7354e1d774"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
