import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5Eu32CGLMQ1OeeGukPs_kyHGj0PjHeoE",
  authDomain: "techhub-learning-platform.firebaseapp.com",
  projectId: "techhub-learning-platform",
  storageBucket: "techhub-learning-platform.firebasestorage.app",
  messagingSenderId: "873663450318",
  appId: "1:873663450318:web:1f86cc92da17bd828fd49f",
  measurementId: "G-56M1KVKREL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};
