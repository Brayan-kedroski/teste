import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    GraduationCap,
    LogOut,
    User,
    Sun,
    Moon,
    LayoutDashboard,
    Users,
    Shield,
    Calendar
} from 'lucide-react';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = currentUser?.role === 'admin';
    const isSecretary = currentUser?.role === 'secretary';
    const isTeacher = currentUser?.role === 'teacher';
    const canAccessAdmin = isAdmin || isSecretary;

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Erro ao sair", error);
        }
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center group">
                            <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                            <div className="ml-2">
                                <span className="text-xl font-bold text-gray-900 dark:text-white block leading-none">Aurora School</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {isAdmin ? 'Administrador' : isSecretary ? 'Secretaria' : `Prof. ${currentUser?.subject || ''}`}
                                </span>
                            </div>
                        </Link>

                        <div className="hidden md:flex ml-10 space-x-4">
                            <Link
                                to="/"
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>

                            {canAccessAdmin && (
                                <Link
                                    to="/classes"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/classes')
                                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Turmas
                                </Link>
                            )}

                            {(isAdmin || isTeacher) && (
                                <Link
                                    to="/attendance"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/attendance')
                                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Chamada
                                </Link>
                            )}

                            {canAccessAdmin && (
                                <Link
                                    to="/admin"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')
                                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </button>

                        <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <User className="h-4 w-4 mr-1" />
                            {currentUser?.email}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
