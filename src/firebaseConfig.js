import { initializeApp } from 'firebase/app';  // Import initializeApp to configure Firebase
import { getAuth, RecaptchaVerifier, setPersistence, browserLocalPersistence } from 'firebase/auth';  // Import necessary methods from Firebase Auth

const firebaseConfig = {
  apiKey: "AIzaSyD7Dg3idLUFJWkDzpum7k7VtchRlZsCjso",
  authDomain: "our-trip-9ffac.firebaseapp.com",
  projectId: "our-trip-9ffac",
  storageBucket: "our-trip-9ffac.firebasestorage.app",
  messagingSenderId: "649784317018",
  appId: "1:649784317018:web:e1ec13abd03022e9eb7463",
  measurementId: "G-JTMVE5FVG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and set persistence
const auth = getAuth(app);

// Set persistence to LOCAL storage (this ensures the user stays logged in after page reloads)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence: ", error); // Handle any error while setting persistence
  });

export { auth, RecaptchaVerifier };
