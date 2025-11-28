import React from 'react';

export default function ReportCard({ student, schoolName = "Escola Modelo", year = new Date().getFullYear() }) {
    if (!student) {
        return <div className="p-8 text-red-500">Erro: Aluno não encontrado.</div>;
    }

    const calculateAverage = (grades) => {
        if (!grades || grades.length === 0) return 0;
        // Filter out invalid grades just in case
        const validGrades = grades.filter(g => g && typeof g.value === 'number');
        if (validGrades.length === 0) return 0;

        const sum = validGrades.reduce((a, b) => a + b.value, 0);
        return (sum / validGrades.length).toFixed(2);
    };

    const average = calculateAverage(student.grades);
    const isPassing = average >= 7.0;

    // Group grades by subject safely
    const gradesBySubject = (student.grades || []).reduce((acc, grade) => {
        if (!grade || !grade.subject) return acc; // Skip invalid grades

        if (!acc[grade.subject]) {
            acc[grade.subject] = [];
        }
        acc[grade.subject].push(grade.value);
        return acc;
    }, {});

    return (
        <div className="p-8 bg-white text-black w-full max-w-[210mm] mx-auto border-2 border-black m-4 page-break-after-always print:border-0">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase">{schoolName}</h1>
                <h2 className="text-xl mt-2">Boletim Escolar - {year}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm border border-black p-4">
                <div>
                    <p><span className="font-bold">Aluno:</span> {student.name || 'Sem Nome'}</p>
                    <p><span className="font-bold">Matrícula:</span> {student.id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">Data de Emissão:</span> {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <table className="w-full border-collapse border border-black mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">Disciplina</th>
                        <th className="border border-black p-2 text-center">Notas Parciais</th>
                        <th className="border border-black p-2 text-center w-24">Média</th>
                        <th className="border border-black p-2 text-center w-32">Situação</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(gradesBySubject).map(([subject, grades]) => {
                        const subjAvg = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2);
                        const subjPassing = subjAvg >= 7.0;

                        return (
                            <tr key={subject}>
                                <td className="border border-black p-2 font-medium">{subject}</td>
                                <td className="border border-black p-2 text-center">
                                    {grades.join(' | ')}
                                </td>
                                <td className="border border-black p-2 text-center font-bold">
                                    {subjAvg}
                                </td>
                                <td className="border border-black p-2 text-center">
                                    <span className={subjPassing ? 'font-bold' : ''}>
                                        {subjPassing ? 'APROVADO' : 'REPROVADO'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {Object.keys(gradesBySubject).length === 0 && (
                        <tr>
                            <td colSpan="4" className="border border-black p-4 text-center text-gray-500">
                                Nenhuma nota lançada.
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 font-bold">
                        <td className="border border-black p-2 text-right" colSpan="2">Média Geral:</td>
                        <td className="border border-black p-2 text-center">{average}</td>
                        <td className="border border-black p-2 text-center">
                            {isPassing ? 'APROVADO' : 'REPROVADO'}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className="mt-12 pt-8 border-t border-black flex justify-between px-12">
                <div className="text-center">
                    <div className="w-48 border-t border-black mb-2"></div>
                    <p className="text-xs">Assinatura do Responsável</p>
                </div>
                <div className="text-center">
                    <div className="w-48 border-t border-black mb-2"></div>
                    <p className="text-xs">Assinatura da Direção</p>
                </div>
            </div>
        </div>
    );
}
