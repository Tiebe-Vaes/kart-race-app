// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_2_4cAB7hjdFN1AiBbSVASfTd8ali1GY",
  authDomain: "redlight-719c8.firebaseapp.com",
  databaseURL: "https://redlight-719c8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "redlight-719c8",
  storageBucket: "redlight-719c8.firebasestorage.app",
  messagingSenderId: "371608135672",
  appId: "1:371608135672:web:2d85e77c922334aec0580d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);