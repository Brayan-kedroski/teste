import React from 'react';

export default function AttendanceSheet({ className, students, month = '___________' }) {
    // Generate array of 31 days
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="p-8 bg-white text-black w-full max-w-[297mm] mx-auto print:w-full">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 inline-block">Lista de Chamada</h1>
                <div className="mt-4 flex justify-between text-sm font-medium">
                    <span>Turma: {className}</span>
                    <span>Mês: {month}</span>
                    <span>Professor(a): _______________________</span>
                </div>
            </div>

            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr>
                        <th className="border border-black p-1 w-8">Nº</th>
                        <th className="border border-black p-1 text-left min-w-[200px]">Nome do Aluno</th>
                        {days.map(d => (
                            <th key={d} className="border border-black p-1 w-6 text-center">{d}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr key={student.id}>
                            <td className="border border-black p-1 text-center">{index + 1}</td>
                            <td className="border border-black p-1 truncate max-w-[200px]">{student.name}</td>
                            {days.map(d => (
                                <td key={d} className="border border-black p-1"></td>
                            ))}
                        </tr>
                    ))}
                    {/* Add empty rows if few students */}
                    {Array.from({ length: Math.max(0, 25 - students.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border border-black p-1 text-center">{students.length + i + 1}</td>
                            <td className="border border-black p-1">&nbsp;</td>
                            {days.map(d => (
                                <td key={d} className="border border-black p-1"></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-8 text-xs flex justify-between">
                <div>
                    <p>Legenda:</p>
                    <p>• = Presença</p>
                    <p>F = Falta</p>
                </div>
                <div className="text-right">
                    <p>Data de emissão: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
