'use client';

import { SubmissionDonutChart } from "./submission-donut-chart";
import { SubmissionsTable, StudentSubmissionData, AssignmentData } from "./submissions-table";

interface DemoSubmissionsProps {
  courseName: string;
  studentsCount: number;
  assignmentsCount: number;
}

export function DemoSubmissions({ courseName, studentsCount, assignmentsCount }: DemoSubmissionsProps) {
  // Generar datos de demostración
  const generateDemoData = () => {
    const assignments: AssignmentData[] = Array.from({ length: Math.min(assignmentsCount, 5) }, (_, i) => ({
      id: `assignment-${i + 1}`,
      title: `Tarea ${i + 1}`,
      dueDate: new Date(Date.now() + (i - 2) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxPoints: 100
    }));

    const students: StudentSubmissionData[] = Array.from({ length: Math.min(studentsCount, 10) }, (_, i) => {
      const submissions: StudentSubmissionData['submissions'] = {};

      assignments.forEach(assignment => {
        // Generar estado aleatorio basado en probabilidades realistas
        const rand = Math.random();
        let status: any = 'NOT_SUBMITTED';

        if (rand < 0.6) status = 'ON_TIME';
        else if (rand < 0.8) status = 'LATE';
        else if (rand < 0.9) status = 'RESUBMITTED';
        // else NOT_SUBMITTED (10%)

        submissions[assignment.id] = {
          status,
          submittedAt: status !== 'NOT_SUBMITTED'
            ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          dueDate: assignment.dueDate,
          grade: status !== 'NOT_SUBMITTED' ? Math.floor(Math.random() * 40) + 60 : undefined,
          maxPoints: assignment.maxPoints
        };
      });

      return {
        studentId: `student-${i + 1}`,
        studentName: `Estudiante ${i + 1}`,
        studentEmail: `estudiante${i + 1}@ejemplo.com`,
        submissions
      };
    });

    // Calcular estadísticas
    let onTime = 0, late = 0, resubmitted = 0, notSubmitted = 0;
    const total = students.length * assignments.length;

    students.forEach(student => {
      Object.values(student.submissions).forEach(submission => {
        switch (submission.status) {
          case 'ON_TIME': onTime++; break;
          case 'LATE': late++; break;
          case 'RESUBMITTED': resubmitted++; break;
          case 'NOT_SUBMITTED': notSubmitted++; break;
        }
      });
    });

    return {
      students,
      assignments,
      stats: { onTime, late, resubmitted, notSubmitted, total }
    };
  };

  const { students, assignments, stats } = generateDemoData();

  if (studentsCount === 0 || assignmentsCount === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">
          {studentsCount === 0 && assignmentsCount === 0
            ? "No hay estudiantes ni tareas en este curso"
            : studentsCount === 0
              ? "No hay estudiantes en este curso"
              : "No hay tareas en este curso"
          }
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Los gráficos aparecerán cuando haya datos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Análisis de Entregas</h4>
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
          Datos de demostración
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Donut */}
        <div className="lg:col-span-1">
          <SubmissionDonutChart
            courseName={courseName}
            stats={stats}
          />
        </div>

        {/* Tabla de entregas */}
        <div className="lg:col-span-2">
          <SubmissionsTable
            courseName={courseName}
            students={students}
            assignments={assignments}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <strong>Nota:</strong> Estos son datos de demostración generados aleatoriamente.
        En la implementación real, se conectarían con la API de Google Classroom para obtener
        las entregas reales de los estudiantes.
      </div>
    </div>
  );
}
