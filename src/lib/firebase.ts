import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  inMemoryPersistence,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXYYOTN503WmUhuGEIA63nk0K3wsPE0aY",
  authDomain: "treindag.firebaseapp.com",
  projectId: "treindag",
  storageBucket: "treindag.firebasestorage.app",
  messagingSenderId: "701981684550",
  appId: "1:701981684550:web:ca599e64f05aa407f42b47"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export { serverTimestamp };

// optional: no persistence (resets when app/tab closes)
setPersistence(auth, inMemoryPersistence).catch(console.error);

export type AuthUser = User;
