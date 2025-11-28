import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Trash2, UserPlus, Mail, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'teacher',
        subject: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = [];
            snapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersData);
        });
        return () => unsubscribe();
    }, []);

    async function handleCreateUser(e) {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const secondaryApp = initializeApp(firebaseConfig, "Secondary");
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                newUser.email,
                newUser.password
            );

            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                subject: newUser.role === 'teacher' ? newUser.subject : null,
                createdAt: new Date()
            });

            await signOut(secondaryAuth);

            setMessage('Usuário criado com sucesso!');
            setNewUser({ name: '', email: '', phone: '', password: '', role: 'teacher', subject: '' });
        } catch (error) {
            console.error(error);
            setMessage('Erro ao criar usuário: ' + error.message);
        }
        setLoading(false);
    }

    async function handleDeleteUser(id) {
        if (window.confirm('Tem certeza?')) {
            await deleteDoc(doc(db, "users", id));
        }
    }

    const canCreateAdmin = currentUser?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-8">
                    <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create User Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
                                <UserPlus className="mr-2 h-5 w-5 text-indigo-500" />
                                Novo Usuário
                            </h2>

                            {message && (
                                <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('Erro') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newUser.phone}
                                        onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Inicial</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="teacher">Professor</option>
                                        <option value="secretary">Secretaria</option>
                                        {canCreateAdmin && <option value="admin">Administrador</option>}
                                    </select>
                                </div>

                                {newUser.role === 'teacher' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matéria</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Matemática"
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={newUser.subject}
                                            onChange={e => setNewUser({ ...newUser, subject: e.target.value })}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center"
                                >
                                    {loading ? 'Criando...' : 'Criar Usuário'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Equipe Escolar</h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map(user => (
                                    <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</h3>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-3">
                                                    <span className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {user.email}</span>
                                                    {user.role === 'teacher' && user.subject && (
                                                        <span className="flex items-center"><BookOpen className="h-3 w-3 mr-1" /> {user.subject}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                                    user.role === 'secretary' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                }`}>
                                                {user.role === 'admin' ? 'Admin' : user.role === 'secretary' ? 'Secretaria' : 'Professor'}
                                            </span>
                                            {canCreateAdmin && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
