
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';



const firebaseConfig = {
  apiKey: "AIzaSyDb2Om5b5PA5CCeMA5ROK_TsqHv8GqIxwU",
  authDomain: "bojochic-21749.firebaseapp.com",
  projectId: "bojochic-21749",
  storageBucket: "bojochic-21749.firebasestorage.app",
  messagingSenderId: "238704759531",
  appId: "1:238704759531:web:00d8f8fb9376adf71124ae",
  measurementId: "G-L0EQ6FNLNE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)