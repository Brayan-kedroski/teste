import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc, setDoc, updateDoc, getCountFromServer } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Trash2, UserPlus, Mail, Shield, BookOpen, Edit, Users, School, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

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

    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Stats State
    const [stats, setStats] = useState({
        students: 0,
        classes: 0,
        teachers: 0
    });

    const { currentUser } = useAuth();

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = [];
            let teacherCount = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                usersData.push({ id: doc.id, ...data });
                if (data.role === 'teacher') teacherCount++;
            });
            setUsers(usersData);
            setStats(prev => ({ ...prev, teachers: teacherCount }));
        });
        return () => unsubscribe();
    }, []);

    // Fetch other stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const studentsColl = collection(db, "students");
                const classesColl = collection(db, "classes");

                const studentsSnapshot = await getCountFromServer(studentsColl);
                const classesSnapshot = await getCountFromServer(classesColl);

                setStats(prev => ({
                    ...prev,
                    students: studentsSnapshot.data().count,
                    classes: classesSnapshot.data().count
                }));
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        // Initial fetch
        fetchStats();

        // Listeners for real-time updates on counts (optional, but good)
        const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
            setStats(prev => ({ ...prev, students: snap.size }));
        });
        const unsubClasses = onSnapshot(collection(db, "classes"), (snap) => {
            setStats(prev => ({ ...prev, classes: snap.size }));
        });

        return () => {
            unsubStudents();
            unsubClasses();
        };
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

    async function handleUpdateUser(e) {
        e.preventDefault();
        if (!editingUser) return;
        setLoading(true);

        try {
            const userRef = doc(db, "users", editingUser.id);
            await updateDoc(userRef, {
                name: editingUser.name,
                phone: editingUser.phone,
                role: editingUser.role,
                subject: editingUser.role === 'teacher' ? editingUser.subject : null
            });
            setMessage('Usuário atualizado com sucesso!');
            setEditingUser(null);
        } catch (error) {
            console.error(error);
            setMessage('Erro ao atualizar: ' + error.message);
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
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
                    </div>
                    <Link to="/classes" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        <School className="h-5 w-5 mr-2" />
                        Gerenciar Turmas
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Alunos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.students}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Professores</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.teachers}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
                            <School className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Turmas Ativas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.classes}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create/Edit User Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
                                {editingUser ? <Edit className="mr-2 h-5 w-5 text-indigo-500" /> : <UserPlus className="mr-2 h-5 w-5 text-indigo-500" />}
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>

                            {message && (
                                <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('Erro') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editingUser ? editingUser.name : newUser.name}
                                        onChange={e => editingUser ? setEditingUser({ ...editingUser, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        disabled={!!editingUser} // Email cannot be changed easily in Firebase Auth from here
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                        value={editingUser ? editingUser.email : newUser.email}
                                        onChange={e => !editingUser && setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editingUser ? editingUser.phone : newUser.phone}
                                        onChange={e => editingUser ? setEditingUser({ ...editingUser, phone: e.target.value }) : setNewUser({ ...newUser, phone: e.target.value })}
                                    />
                                </div>
                                {!editingUser && (
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
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editingUser ? editingUser.role : newUser.role}
                                        onChange={e => editingUser ? setEditingUser({ ...editingUser, role: e.target.value }) : setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="teacher">Professor</option>
                                        <option value="secretary">Secretaria</option>
                                        {canCreateAdmin && <option value="admin">Administrador</option>}
                                    </select>
                                </div>

                                {(editingUser ? editingUser.role : newUser.role) === 'teacher' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matéria</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Matemática"
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={editingUser ? editingUser.subject : newUser.subject}
                                            onChange={e => editingUser ? setEditingUser({ ...editingUser, subject: e.target.value }) : setNewUser({ ...newUser, subject: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {editingUser && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingUser(null)}
                                            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow-sm transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center"
                                    >
                                        {loading ? 'Salvando...' : (editingUser ? 'Salvar Alterações' : 'Criar Usuário')}
                                    </button>
                                </div>
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
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                                user.role === 'secretary' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                }`}>
                                                {user.role === 'admin' ? 'Admin' : user.role === 'secretary' ? 'Secretaria' : 'Professor'}
                                            </span>
                                            {canCreateAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        className="text-gray-400 hover:text-indigo-500 transition-colors p-2"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </>
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
