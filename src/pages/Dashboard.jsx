import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Calendar, CheckSquare, Square, X, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');

    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentClass, setNewStudentClass] = useState('');

    const [gradeInputs, setGradeInputs] = useState({});
    const [attendanceMode, setAttendanceMode] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceList, setAttendanceList] = useState({});

    const { currentUser } = useAuth();

    const isTeacher = currentUser?.role === 'teacher';
    const isSecretary = currentUser?.role === 'secretary';
    const isAdmin = currentUser?.role === 'admin';
    const canManageStudents = isAdmin || isSecretary;
    const canGrade = isAdmin || isTeacher;

    // Fetch Classes
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

    // Fetch Students
    useEffect(() => {
        const q = query(collection(db, "students"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentsData = [];
            querySnapshot.forEach((doc) => {
                studentsData.push({ id: doc.id, ...doc.data() });
            });
            setStudents(studentsData);
        });
        return () => unsubscribe();
    }, []);

    async function handleAddStudent(e) {
        e.preventDefault();
        if (!newStudentName.trim()) return;
        await addDoc(collection(db, "students"), {
            name: newStudentName,
            classId: newStudentClass || null,
            grades: [],
            attendance: [],
            createdAt: new Date()
        });
        setNewStudentName('');
    }

    async function handleAddGrade(studentId) {
        const input = gradeInputs[studentId];
        if (!input || !input.subject || !input.score) return;

        const subject = isTeacher ? currentUser.subject : input.subject;
        const score = parseFloat(input.score.replace(',', '.'));
        if (isNaN(score)) return;

        const student = students.find(s => s.id === studentId);
        const newGrades = [...(student.grades || []), { subject, value: score }];

        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, { grades: newGrades });

        setGradeInputs(prev => ({
            ...prev,
            [studentId]: { subject: isTeacher ? currentUser.subject : '', score: '' }
        }));
    }

    async function handleRemoveGrade(studentId, index) {
        const student = students.find(s => s.id === studentId);
        const newGrades = [...student.grades];
        newGrades.splice(index, 1);

        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, { grades: newGrades });
    }

    async function handleDeleteStudent(id) {
        if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
            await deleteDoc(doc(db, "students", id));
        }
    }

    async function handleSaveAttendance() {
        if (!attendanceDate) return;

        // Filter students if a class is selected
        const studentsToMark = selectedClass === 'all'
            ? students
            : students.filter(s => s.classId === selectedClass);

        const batchPromises = studentsToMark.map(student => {
            const isPresent = attendanceList[student.id] || false;
            const newRecord = {
                date: attendanceDate,
                present: isPresent,
                subject: isTeacher ? currentUser.subject : 'Geral'
            };

            const newAttendance = [...(student.attendance || []), newRecord];
            const studentRef = doc(db, "students", student.id);
            return updateDoc(studentRef, { attendance: newAttendance });
        });

        await Promise.all(batchPromises);
        setAttendanceMode(false);
        setAttendanceList({});
        alert('Chamada realizada com sucesso!');
    }

    function calculateAverage(grades) {
        if (!grades || grades.length === 0) return 0;
        const sum = grades.reduce((a, b) => a + b.value, 0);
        return (sum / grades.length).toFixed(2);
    }

    const handleInputChange = (studentId, field, value) => {
        setGradeInputs(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const toggleAttendance = (studentId) => {
        setAttendanceList(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const filteredStudents = selectedClass === 'all'
        ? students
        : students.filter(s => s.classId === selectedClass);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

                {/* Actions Bar */}
                <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                    {/* Add Student */}
                    {canManageStudents && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 flex-1 w-full lg:w-auto">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Novo Aluno</h2>
                            <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                    placeholder="Nome do aluno..."
                                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                />
                                <select
                                    value={newStudentClass}
                                    onChange={(e) => setNewStudentClass(e.target.value)}
                                    className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                >
                                    <option value="">Sem Turma</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Filters & Attendance */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                            <Filter className="h-4 w-4 text-gray-500 mr-2" />
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"
                            >
                                <option value="all">Todas as Turmas</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        {(isTeacher || isAdmin) && (
                            <button
                                onClick={() => setAttendanceMode(!attendanceMode)}
                                className={`inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-lg shadow-sm transition-colors ${attendanceMode
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Calendar className="h-5 w-5 mr-2" />
                                {attendanceMode ? 'Cancelar Chamada' : 'Realizar Chamada'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Attendance Mode UI */}
                {attendanceMode && (
                    <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center">
                                <CheckSquare className="h-5 w-5 mr-2" />
                                Lista de Presença {selectedClass !== 'all' && `(${classes.find(c => c.id === selectedClass)?.name})`}
                            </h2>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="rounded-lg border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => toggleAttendance(student.id)}
                                    className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${attendanceList[student.id]
                                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    <span className="font-medium">{student.name}</span>
                                    {attendanceList[student.id] ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 col-span-full">Nenhum aluno nesta turma.</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveAttendance}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm"
                            >
                                Salvar Chamada
                            </button>
                        </div>
                    </div>
                )}

                {/* Students Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredStudents.map((student) => {
                        const average = calculateAverage(student.grades);
                        const isPassing = average >= 7.0;
                        const input = gradeInputs[student.id] || { subject: isTeacher ? currentUser.subject : '', score: '' };
                        const studentClass = classes.find(c => c.id === student.classId);

                        return (
                            <div key={student.id} className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col">
                                <div className="px-4 py-5 sm:p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{student.name}</h3>
                                            {studentClass && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 mt-1">
                                                    {studentClass.name}
                                                </span>
                                            )}
                                        </div>
                                        {canManageStudents && (
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {/* Grade List */}
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {student.grades?.map((grade, index) => (
                                                <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{grade.subject}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-gray-900 dark:text-white">{grade.value}</span>
                                                        {canGrade && (
                                                            <button
                                                                onClick={() => handleRemoveGrade(student.id, index)}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!student.grades || student.grades.length === 0) && (
                                                <p className="text-sm text-gray-400 text-center py-2">Nenhuma nota lançada</p>
                                            )}
                                        </div>

                                        {/* Add Grade Inputs */}
                                        {canGrade && (
                                            <div className="flex gap-2 pt-2">
                                                {!isTeacher && (
                                                    <input
                                                        type="text"
                                                        placeholder="Matéria"
                                                        value={input.subject}
                                                        onChange={(e) => handleInputChange(student.id, 'subject', e.target.value)}
                                                        className="flex-1 min-w-0 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 text-xs"
                                                    />
                                                )}
                                                <input
                                                    type="number"
                                                    placeholder="Nota"
                                                    value={input.score}
                                                    onChange={(e) => handleInputChange(student.id, 'score', e.target.value)}
                                                    className="w-16 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 text-xs"
                                                />
                                                <button
                                                    onClick={() => handleAddGrade(student.id)}
                                                    className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Média Final</p>
                                                <p className={`text-2xl font-bold ${isPassing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {average}
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isPassing ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                }`}>
                                                {isPassing ? 'Aprovado' : 'Reprovado'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
