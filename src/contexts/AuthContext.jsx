import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
} from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check for hardcoded super admin
                if (user.email === 'brayan900mauricio@gmail.com') {
                    setCurrentUser({ ...user, role: 'admin' });
                } else {
                    // Fetch role from Firestore
                    try {
                        const { doc, getDoc } = await import('firebase/firestore');
                        const { db } = await import('../firebase');
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) {
                            setCurrentUser({ ...user, ...userDoc.data() });
                        } else {
                            // Default role if not found (fallback)
                            setCurrentUser({ ...user, role: 'teacher' });
                        }
                    } catch (error) {
                        console.error("Error fetching user role:", error);
                        setCurrentUser(user);
                    }
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
