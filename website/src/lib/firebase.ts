import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQtg9u4NrT4YDNAD5Eo2s0Ow2vSuNutiM",
  authDomain: "rent-manage-bab39.firebaseapp.com",
  projectId: "rent-manage-bab39",
  storageBucket: "rent-manage-bab39.firebasestorage.app",
  messagingSenderId: "863366534935",
  appId: "1:863366534935:web:eb8b9983eb5ac63f6b0952",
  measurementId: "G-6VLER7BRJS",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
