import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyXXXXXX-REPLACE_ME',
  authDomain: 'your-app.firebaseapp.com',
  projectId: 'your-app',
  storageBucket: 'your-app.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdefg',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
