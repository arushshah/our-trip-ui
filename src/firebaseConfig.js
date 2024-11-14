// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD7Dg3idLUFJWkDzpum7k7VtchRlZsCjso",
  authDomain: "our-trip-9ffac.firebaseapp.com",
  projectId: "our-trip-9ffac",
  storageBucket: "our-trip-9ffac.firebasestorage.app",
  messagingSenderId: "649784317018",
  appId: "1:649784317018:web:e1ec13abd03022e9eb7463",
  measurementId: "G-JTMVE5FVG2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier };