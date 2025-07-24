import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPLPqQ8dMN44v81kQw52SbJ71VxwerhqY",
  authDomain: "http://hackathon-farm.firebaseapp.com/",
  projectId: "hackathon-farm",
  storageBucket: "hackathon-farm.firebasestorage.app",
  messagingSenderId: "81515145275",
  appId: "1:81515145275:web:a96e4d21e690a387bad41e",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
