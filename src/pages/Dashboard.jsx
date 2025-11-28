import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, X, Filter, Printer, ArrowLeft, Pencil } from 'lucide-react';
import Navbar from '../components/Navbar';
import AttendanceSheet from '../components/AttendanceSheet';
import ReportCard from '../components/ReportCard';

export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');

    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkStudents, setBulkStudents] = useState('');

    const [gradeInputs, setGradeInputs] = useState({});

    // Printing State
    const [printMode, setPrintMode] = useState('none'); // 'none', 'attendance', 'report'
    const [studentToPrint, setStudentToPrint] = useState(null);

    // New Student State
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentClass, setNewStudentClass] = useState('');
    const [newStudentCPF, setNewStudentCPF] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [newStudentAddress, setNewStudentAddress] = useState('');
    const [newStudentBirthDate, setNewStudentBirthDate] = useState('');
    const [showOptionalFields, setShowOptionalFields] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (!newStudentName.trim()) {
            alert('Por favor, digite o nome do aluno.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "students"), {
                name: newStudentName,
                classId: newStudentClass || null,
                cpf: newStudentCPF || null,
                phone: newStudentPhone || null,
                email: newStudentEmail || null,
                address: newStudentAddress || null,
                birthDate: newStudentBirthDate || null,
                grades: [],
                attendance: [],
                createdAt: new Date()
            });
            resetForm();
            alert('Aluno cadastrado com sucesso!');
        } catch (error) {
            console.error("Erro ao cadastrar aluno:", error);
            alert(`Erro ao cadastrar aluno: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleUpdateStudent(e) {
        e.preventDefault();
        if (!newStudentName.trim() || !editingStudent) return;

        setIsSubmitting(true);
        try {
            const studentRef = doc(db, "students", editingStudent);
            await updateDoc(studentRef, {
                name: newStudentName,
                classId: newStudentClass || null,
                cpf: newStudentCPF || null,
                phone: newStudentPhone || null,
                email: newStudentEmail || null,
                address: newStudentAddress || null,
                birthDate: newStudentBirthDate || null
            });

            resetForm();
            alert('Aluno atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar aluno:", error);
            alert(`Erro ao atualizar aluno: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    function resetForm() {
        setNewStudentName('');
        setNewStudentClass('');
        setNewStudentCPF('');
        setNewStudentPhone('');
        setNewStudentEmail('');
        setNewStudentAddress('');
        setNewStudentBirthDate('');
        setShowOptionalFields(false);
        setEditingStudent(null);
    }

    function handleEditStudent(student) {
        setEditingStudent(student.id);
        setNewStudentName(student.name);
        setNewStudentClass(student.classId || '');
        setNewStudentCPF(student.cpf || '');
        setNewStudentPhone(student.phone || '');
        setNewStudentEmail(student.email || '');
        setNewStudentAddress(student.address || '');
        setNewStudentBirthDate(student.birthDate || '');

        // Always show optional fields when editing so the user can see/add data
        setShowOptionalFields(true);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleBulkAddStudent(e) {
        e.preventDefault();
        if (!bulkStudents.trim()) {
            alert('Por favor, cole a lista de nomes.');
            return;
        }

        setIsSubmitting(true);
        try {
            const names = bulkStudents.split('\n').filter(name => name.trim() !== '');

            const batchPromises = names.map(name => {
                return addDoc(collection(db, "students"), {
                    name: name.trim(),
                    classId: newStudentClass || null,
                    grades: [],
                    attendance: [],
                    createdAt: new Date()
                });
            });

            await Promise.all(batchPromises);
            setBulkStudents('');
            setIsBulkMode(false);
            resetForm();
            alert(`${names.length} alunos adicionados com sucesso!`);
        } catch (error) {
            console.error("Erro ao adicionar alunos em massa:", error);
            alert(`Erro ao adicionar alunos: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
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

    const filteredStudents = selectedClass === 'all'
        ? students
        : students.filter(s => s.classId === selectedClass);

    // Print Handlers
    const handlePrintAttendance = () => {
        setPrintMode('attendance');
    };

    const handlePrintReport = (student) => {
        setStudentToPrint(student);
        setPrintMode('report');
    };

    const exitPrintMode = () => {
        setPrintMode('none');
        setStudentToPrint(null);
    };

    // Render Print Views
    if (printMode === 'attendance') {
        const className = selectedClass === 'all' ? 'Todas as Turmas' : classes.find(c => c.id === selectedClass)?.name || 'Sem Turma';
        return (
            <div className="min-h-screen bg-white">
                <div className="print:hidden p-4 bg-gray-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                    <button onClick={exitPrintMode} className="flex items-center text-gray-700 hover:text-black">
                        <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
                    </button>
                    <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
                        <Printer className="h-5 w-5 mr-2" /> Imprimir
                    </button>
                </div>
                <AttendanceSheet
                    className={className}
                    students={filteredStudents}
                />
            </div>
        );
    }

    if (printMode === 'report' && studentToPrint) {
        return (
            <div className="min-h-screen bg-white">
                <div className="print:hidden p-4 bg-gray-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                    <button onClick={exitPrintMode} className="flex items-center text-gray-700 hover:text-black">
                        <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
                    </button>
                    <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
                        <Printer className="h-5 w-5 mr-2" /> Imprimir
                    </button>
                </div>
                <ReportCard student={studentToPrint} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

                {/* Actions Bar */}
                <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                    {/* Add Student */}
                    {canManageStudents && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 flex-1 w-full lg:w-auto">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                                </h2>
                                <button
                                    onClick={() => setIsBulkMode(!isBulkMode)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                    disabled={!!editingStudent}
                                >
                                    {isBulkMode ? 'Modo Simples' : 'Modo em Massa'}
                                </button>
                            </div>

                            {isBulkMode ? (
                                <form onSubmit={handleBulkAddStudent} className="flex flex-col gap-2">
                                    <textarea
                                        value={bulkStudents}
                                        onChange={(e) => setBulkStudents(e.target.value)}
                                        placeholder="Cole a lista de nomes aqui (um por linha)..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm min-h-[100px]"
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            value={newStudentClass}
                                            onChange={(e) => setNewStudentClass(e.target.value)}
                                            className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                        >
                                            <option value="">Sem Turma</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Salvando...' : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Todos
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent} className="flex flex-col gap-2">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={newStudentName}
                                            onChange={(e) => setNewStudentName(e.target.value)}
                                            placeholder="Nome do aluno (Obrigatório)..."
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
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowOptionalFields(!showOptionalFields)}
                                            className="text-xs text-gray-500 hover:text-indigo-600 flex items-center"
                                        >
                                            {showOptionalFields ? 'Menos Detalhes' : 'Mais Detalhes (CPF, Tel, etc)'}
                                        </button>
                                    </div>

                                    {showOptionalFields && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                                            <input
                                                type="text"
                                                value={newStudentCPF}
                                                onChange={(e) => setNewStudentCPF(e.target.value)}
                                                placeholder="CPF"
                                                className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                            />
                                            <input
                                                type="tel"
                                                value={newStudentPhone}
                                                onChange={(e) => setNewStudentPhone(e.target.value)}
                                                placeholder="Telefone"
                                                className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                            />
                                            <input
                                                type="email"
                                                value={newStudentEmail}
                                                onChange={(e) => setNewStudentEmail(e.target.value)}
                                                placeholder="Email"
                                                className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                            />
                                            <input
                                                type="date"
                                                value={newStudentBirthDate}
                                                onChange={(e) => setNewStudentBirthDate(e.target.value)}
                                                className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={newStudentAddress}
                                                onChange={(e) => setNewStudentAddress(e.target.value)}
                                                placeholder="Endereço Completo"
                                                className="col-span-1 sm:col-span-2 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 border text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {editingStudent && (
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${editingStudent ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Salvando...' : (editingStudent ? 'Salvar Alterações' : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Adicionar Aluno
                                                </>
                                            ))}
                                        </button>
                                    </div>
                                </form>
                            )}
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
                            <>
                                <button
                                    onClick={handlePrintAttendance}
                                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    title="Imprimir Folha de Chamada"
                                >
                                    <Printer className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const testRef = await addDoc(collection(db, "test_connection"), {
                                                timestamp: new Date(),
                                                user: currentUser?.email || 'anonymous'
                                            });
                                            alert(`Conexão com Banco de Dados: OK!\nDocumento criado com ID: ${testRef.id}`);
                                        } catch (error) {
                                            console.error("Erro de conexão:", error);
                                            alert(`ERRO no Banco de Dados:\n${error.message}\n\nVerifique se suas regras do Firestore permitem gravação.`);
                                        }
                                    }}
                                    className="inline-flex justify-center items-center px-4 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-lg shadow-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100"
                                    title="Testar Conexão com Banco de Dados"
                                >
                                    Testar Banco
                                </button>
                            </>
                        )}
                    </div>
                </div>

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
                                        <div className="flex items-center gap-2">
                                            {canManageStudents && (
                                                <button
                                                    onClick={() => handleEditStudent(student)}
                                                    className="text-gray-400 hover:text-indigo-500 transition-colors"
                                                    title="Editar Aluno"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handlePrintReport(student)}
                                                className="text-gray-400 hover:text-indigo-500 transition-colors"
                                                title="Imprimir Boletim"
                                            >
                                                <Printer className="h-5 w-5" />
                                            </button>
                                            {canManageStudents && (
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
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
