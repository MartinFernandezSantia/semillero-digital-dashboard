'use client';

import { useState, useEffect, useMemo } from 'react';
import { SubmissionDonutChart } from "./submission-donut-chart";
import { SubmissionsTable } from "./submissions-table";
import { processSubmissionData } from "@/lib/submission-utils";
import { fetchCourseSubmissions } from "@/app/actions/classroom";
import { classroom_v1 } from 'googleapis';
import { Loader2, AlertCircle } from 'lucide-react';

interface RealSubmissionsProps {
  courseId: string;
  courseName: string;
  students: any[];
  coursework: any[];
}

export function RealSubmissions({ courseId, courseName, students, coursework }: RealSubmissionsProps) {
  const [submissions, setSubmissions] = useState<classroom_v1.Schema$StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!courseId || students.length === 0 || coursework.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchCourseSubmissions(courseId);
        
        if (result.success && result.data) {
          setSubmissions(result.data);
          console.log(`📥 Loaded ${result.data.length} submissions for course ${courseName}`);
        } else {
          setError(result.error || 'Error desconocido al cargar entregas');
        }
      } catch (err) {
        console.error('Error loading submissions:', err);
        setError('Error al cargar las entregas del curso');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [courseId, courseName, students.length, coursework.length]);

  // Procesar datos cuando cambien
  const processedData = useMemo(() => {
    try {
      if (students.length === 0 || coursework.length === 0) {
        return {
          studentsData: [],
          assignmentsData: [],
          stats: { onTime: 0, late: 0, resubmitted: 0, notSubmitted: 0, total: 0 }
        };
      }

      console.log('🔄 Processing submission data:', {
        studentsCount: students.length,
        courseworkCount: coursework.length,
        submissionsCount: submissions.length
      });

      return processSubmissionData(students, coursework, submissions);
    } catch (error) {
      console.error('Error processing submission data:', error);
      return {
        studentsData: [],
        assignmentsData: [],
        stats: { onTime: 0, late: 0, resubmitted: 0, notSubmitted: 0, total: 0 }
      };
    }
  }, [students, coursework, submissions]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <div>
            <p className="text-gray-700 font-medium">Cargando entregas reales...</p>
            <p className="text-sm text-gray-500">Obteniendo datos de Google Classroom</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error al cargar entregas:</p>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-1">
                Esto puede ocurrir si no tienes permisos para ver las entregas de este curso.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay datos
  if (students.length === 0 || coursework.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">
          {students.length === 0 && coursework.length === 0 
            ? "No hay estudiantes ni tareas en este curso"
            : students.length === 0 
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
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            ✅ Datos reales de Google Classroom
          </div>
          <div className="text-xs text-gray-400">
            {submissions.length} entregas cargadas
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Donut */}
        <div className="lg:col-span-1">
          <SubmissionDonutChart
            courseName={courseName}
            stats={processedData.stats}
          />
        </div>
        
        {/* Tabla de entregas */}
        <div className="lg:col-span-2">
          <SubmissionsTable
            courseName={courseName}
            students={processedData.studentsData}
            assignments={processedData.assignmentsData}
          />
        </div>
      </div>
      
    </div>
  );
}
