import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA9BTqr7Fv7a9YNrdn4JOMQ5Odx9knQ5bI',
  authDomain: 'calendar-app-kk.firebaseapp.com',
  projectId: 'calendar-app-kk',
  storageBucket: 'calendar-app-kk.firebasestorage.app',
  messagingSenderId: '795068854521',
  appId: '1:795068854521:web:9574378dabada8b3543228',
};

// Initialize Firebase
let app;
try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    
    // Enable emulator in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode');
      // Uncomment these lines if you want to use Firebase Emulator
      // connectAuthEmulator(auth, 'http://localhost:9099');
      // connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error; // Re-throw the error to fail fast in case of initialization failure
}

// Initialize Firebase services
let auth, db;
try {
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase services initialized');
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  throw error;
}

// Initialize Google Auth Provider
export const provider = new GoogleAuthProvider();

// Export the Firebase services
export { auth, db };
