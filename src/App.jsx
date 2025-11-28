import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Classes from './pages/Classes';

function PrivateRoute({ children }) {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { currentUser } = useAuth();
    const canAccess = currentUser?.role === 'admin' || currentUser?.role === 'secretary';
    return currentUser && canAccess ? children : <Navigate to="/" />;
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/classes"
                            element={
                                <AdminRoute>
                                    <Classes />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <Admin />
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
