import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCEHunliACHosioKYqn-yRjgJomIeTeJT0",
    authDomain: "mediaaurora-f40bb.firebaseapp.com",
    projectId: "mediaaurora-f40bb",
    storageBucket: "mediaaurora-f40bb.firebasestorage.app",
    messagingSenderId: "743815553266",
    appId: "1:743815553266:web:ad271054a11b3fd35e306b",
    measurementId: "G-F6HBYC084Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
