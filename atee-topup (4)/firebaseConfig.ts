
// --- FIREBASE CONFIGURATION ---
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHa8osIb5RLDuZ88Ty4nESeXNazWDVqYo",
  authDomain: "atee-40a2a.firebaseapp.com",
  projectId: "atee-40a2a",
  storageBucket: "atee-40a2a.firebasestorage.app",
  messagingSenderId: "1072021473987",
  appId: "1:1072021473987:web:b350505097603ed2a23076",
  measurementId: "G-FHCVERL3QX"
};

// Initialize Firebase
let app;
let db = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("🔥 Firebase Connected Successfully to project: atee-40a2a");
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error);
}

export { db, auth };
