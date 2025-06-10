import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA9BTqr7Fv7a9YNrdn4JOMQ5Odx9knQ5bI',
  authDomain: 'calendar-app-kk.firebaseapp.com',
  projectId: 'calendar-app-kk',
  storageBucket: 'calendar-app-kk.firebasestorage.app',
  messagingSenderId: '795068854521',
  appId: '1:795068854521:web:9574378dabada8b3543228',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
