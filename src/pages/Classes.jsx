import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Users, School } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Classes() {
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState('');
    const [newClassSchedule, setNewClassSchedule] = useState('Manhã');

    useEffect(() => {
        const q = query(collection(db, "classes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const classesData = [];
            snapshot.forEach((doc) => {
                classesData.push({ id: doc.id, ...doc.data() });
            });
            setClasses(classesData);
        });
        return () => unsubscribe();
    }, []);

    async function handleAddClass(e) {
        e.preventDefault();
        if (!newClassName.trim()) return;

        await addDoc(collection(db, "classes"), {
            name: newClassName,
            schedule: newClassSchedule,
            createdAt: new Date()
        });

        setNewClassName('');
    }

    async function handleDeleteClass(id) {
        if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
            await deleteDoc(doc(db, "classes", id));
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-8">
                    <School className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Turmas</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Class Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
                                <Plus className="mr-2 h-5 w-5 text-indigo-500" />
                                Nova Turma
                            </h2>

                            <form onSubmit={handleAddClass} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Turma</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: 1º Ano A"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newClassName}
                                        onChange={e => setNewClassName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turno</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newClassSchedule}
                                        onChange={e => setNewClassSchedule(e.target.value)}
                                    >
                                        <option value="Manhã">Manhã</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noite">Noite</option>
                                        <option value="Integral">Integral</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center"
                                >
                                    Criar Turma
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Classes List */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {classes.map(cls => (
                                <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cls.name}</h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mt-2">
                                                {cls.schedule}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClass(cls.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Users className="h-4 w-4 mr-1" />
                                        <span>Ver alunos (no Dashboard)</span>
                                    </div>
                                </div>
                            ))}
                            {classes.length === 0 && (
                                <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                                    Nenhuma turma cadastrada.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
