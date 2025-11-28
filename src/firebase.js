import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase fornecida pelo usuário
export const firebaseConfig = {
    apiKey: "AIzaSyDHByt8ZOqJVsKQ3tuqmD1j7T_si8Obi1s",
    authDomain: "cauculo-de-media.firebaseapp.com",
    projectId: "cauculo-de-media",
    storageBucket: "cauculo-de-media.firebasestorage.app",
    messagingSenderId: "723431890302",
    appId: "1:723431890302:web:8b4a90bfb67374a77b272f",
    measurementId: "G-J4NRCM10R5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporta os serviços para uso no app
export const auth = getAuth(app);
export const db = getFirestore(app);
