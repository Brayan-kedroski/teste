import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Save, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Mail } from 'lucide-react';

import emailjs from 'emailjs-com';

// Placeholder keys for EmailJS - REPLACE THESE WITH YOUR ACTUAL KEYS
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';
const EMAILJS_USER_ID = 'YOUR_USER_ID_HERE';

export default function Attendance() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);

    const { currentUser } = useAuth();
    const isTeacher = currentUser?.role === 'teacher';

    // Fetch Classes
    useEffect(() => {
        const q = query(collection(db, "classes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const classesData = [];
            snapshot.forEach((doc) => {
                classesData.push({ id: doc.id, ...doc.data() });
            });
            setClasses(classesData);
            if (classesData.length > 0 && !selectedClass) {
                setSelectedClass(classesData[0].id);
            }
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
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Initialize/Load Attendance Data
    useEffect(() => {
        if (!selectedClass || !attendanceDate || students.length === 0) return;

        const filteredStudents = students.filter(s => s.classId === selectedClass);
        const newAttendanceData = {};

        filteredStudents.forEach(student => {
            const existingRecord = student.attendance?.find(a => a.date === attendanceDate && a.subject === (isTeacher ? currentUser.subject : 'Geral'));

            if (existingRecord) {
                newAttendanceData[student.id] = existingRecord.status || (existingRecord.present ? 'present' : 'unjustified');
            } else {
                newAttendanceData[student.id] = 'present'; // Default to present
            }
        });

        setAttendanceData(newAttendanceData);
    }, [selectedClass, attendanceDate, students, isTeacher, currentUser]);

    const handleTestEmail = (student) => {
        if (!student.email) {
            alert(`O aluno ${student.name} não possui email cadastrado.`);
            return;
        }

        const confirmSend = window.confirm(`Deseja enviar um email de teste para ${student.name} (${student.email})?`);
        if (!confirmSend) return;

        alert(`Enviando email de teste para ${student.email}...`);
        sendNotification(student, new Date().toISOString().split('T')[0], 'TESTE DE SISTEMA');
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const playSuccessSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const logNotification = async (student, date, subject, status) => {
        try {
            await addDoc(collection(db, "notifications"), {
                studentId: student.id,
                studentName: student.name,
                date: date,
                subject: subject,
                type: 'absence_unjustified',
                status: status, // 'sent' or 'error'
                timestamp: new Date()
            });
        } catch (error) {
            console.error("Erro ao salvar log de notificação:", error);
        }
    };

    const sendNotification = (student, date, subject) => {
        if (!student.email) {
            console.log(`Aluno ${student.name} não tem email cadastrado.`);
            return;
        }

        const templateParams = {
            to_name: student.name,
            to_email: student.email,
            date: date,
            subject: subject,
            student_name: student.name,
            message: `Informamos que o aluno(a) ${student.name} recebeu uma falta injustificada no dia ${date} na disciplina de ${subject}.`
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_USER_ID)
            .then((response) => {
                console.log('Email enviado com sucesso!', response.status, response.text);
                logNotification(student, date, subject, 'sent');
            }, (err) => {
                console.error('Falha ao enviar email...', err);
                logNotification(student, date, subject, 'error');
            });
    };

    const handleSaveAttendance = async () => {
        try {
            const studentsToUpdate = students.filter(s => s.classId === selectedClass);

            if (studentsToUpdate.length === 0) {
                alert('Nenhum aluno encontrado para esta turma. Verifique se há alunos cadastrados.');
                return;
            }

            const subject = isTeacher ? currentUser.subject : 'Geral';

            const batchPromises = studentsToUpdate.map(student => {
                const status = attendanceData[student.id];

                if (!status) {
                    console.warn(`Status não definido para o aluno ${student.name} (${student.id})`);
                    return Promise.resolve(); // Skip if no status
                }

                const existingAttendance = student.attendance || [];

                // Remove existing record for this date/subject
                const filteredAttendance = existingAttendance.filter(
                    record => !(record.date === attendanceDate && record.subject === subject)
                );

                const newRecord = {
                    date: attendanceDate,
                    subject: subject,
                    status: status,
                    present: status === 'present' // Backward compatibility
                };

                // Send email if unjustified
                if (status === 'unjustified') {
                    // Check if we are not just updating an existing unjustified record to avoid spam (optional, but good practice)
                    // For now, simple trigger on save
                    sendNotification(student, attendanceDate, subject);
                }

                const newAttendance = [...filteredAttendance, newRecord];
                const studentRef = doc(db, "students", student.id);
                return updateDoc(studentRef, { attendance: newAttendance });
            });

            await Promise.all(batchPromises);
            playSuccessSound();
            alert('Chamada salva com sucesso! Emails de notificação enviados para faltas injustificadas.');
        } catch (error) {
            console.error("Erro ao salvar chamada:", error);
            alert(`Erro ao salvar chamada: ${error.message}`);
        }
    };

    const filteredStudents = students.filter(s => s.classId === selectedClass);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Calendar className="mr-2 h-6 w-6 text-indigo-600" />
                        Chamada
                    </h1>

                    <div className="flex gap-4">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
                        >
                            <option value="">Selecione uma turma</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        {loading ? (
                            <p className="text-center text-gray-500">Carregando alunos...</p>
                        ) : filteredStudents.length === 0 ? (
                            <p className="text-center text-gray-500">Nenhum aluno nesta turma.</p>
                        ) : (
                            <div className="space-y-4">
                                {filteredStudents.map(student => (
                                    <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleTestEmail(student)}
                                                className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                                                title="Testar envio de email"
                                            >
                                                <Mail className="w-4 h-4 mr-1.5" />
                                                Testar
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(student.id, 'present')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${attendanceData[student.id] === 'present'
                                                    ? 'bg-green-100 text-green-800 border-green-200 ring-1 ring-green-300'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                                Presença
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(student.id, 'justified')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${attendanceData[student.id] === 'justified'
                                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-1 ring-yellow-300'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <AlertCircle className="w-4 h-4 mr-1.5" />
                                                Justificada
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(student.id, 'certificate')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${attendanceData[student.id] === 'certificate'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200 ring-1 ring-blue-300'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <FileText className="w-4 h-4 mr-1.5" />
                                                Atestado
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(student.id, 'unjustified')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${attendanceData[student.id] === 'unjustified'
                                                    ? 'bg-red-100 text-red-800 border-red-200 ring-1 ring-red-300'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <XCircle className="w-4 h-4 mr-1.5" />
                                                Falta
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={handleSaveAttendance}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Salvar Chamada
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
