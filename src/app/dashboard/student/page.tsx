'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Calendar, Clock } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CourseData {
  course: any;
  students: any[];
  teachers: any[];
  coursework: any[];
  announcements: any[];
  userRole: 'TEACHER' | 'STUDENT' | 'BOTH';
}

export default function StudentDashboard() {
  const { studentCourses, teacherCourses } = useDashboard();
  const router = useRouter();

  // Manejar redirecciones en useEffect
  React.useEffect(() => {
    if (studentCourses.length === 0) {
      if (teacherCourses.length > 0) {
        router.push('/dashboard/teacher');
      } else {
        router.push('/courses/select');
      }
    }
  }, [studentCourses.length, teacherCourses.length, router]);

  const calculateStudentStats = (courseData: CourseData) => {
    const totalAssignments = courseData.coursework?.length || 0;
    const totalAnnouncements = courseData.announcements?.length || 0;

    // En una implementación real, aquí consultarías las submissions del estudiante
    const pendingAssignments = Math.floor(totalAssignments * 0.3); // Simulado
    const completedAssignments = totalAssignments - pendingAssignments;

    return {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      totalAnnouncements
    };
  };

  // Si no tiene cursos como estudiante, mostrar loading mientras redirige
  if (studentCourses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Título solo si no hay navegación (solo es estudiante) */}
      {teacherCourses.length === 0 && (
        <div className="flex items-center space-x-2 mb-8">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sección Estudiante</h2>
        </div>
      )}

      <div className="space-y-8">
        {studentCourses.map(([courseId, courseData]) => {
          const stats = calculateStudentStats(courseData);

          return (
            <div key={courseId} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {courseData.course.name}
                  </h3>
                  {courseData.course.section && (
                    <p className="text-gray-600">Sección: {courseData.course.section}</p>
                  )}
                  {courseData.course.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {courseData.course.description}
                    </p>
                  )}
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Estudiante
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                        <p className="text-sm text-gray-600">Total Tareas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
                        <p className="text-sm text-gray-600">Completadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                        <p className="text-sm text-gray-600">Pendientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
                        <p className="text-sm text-gray-600">Anuncios</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progreso visual */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso de Tareas</span>
                  <span className="text-sm text-gray-500">
                    {stats.completedAssignments} de {stats.totalAssignments}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: stats.totalAssignments > 0
                        ? `${(stats.completedAssignments / stats.totalAssignments) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Información adicional del curso */}
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  {courseData.course.room && (
                    <div>
                      <span className="font-medium">Aula:</span> {courseData.course.room}
                    </div>
                  )}
                  {courseData.teachers && courseData.teachers.length > 0 && (
                    <div>
                      <span className="font-medium">Profesor:</span> {
                        courseData.teachers[0]?.profile?.name?.fullName ||
                        courseData.teachers[0]?.profile?.emailAddress
                      }
                    </div>
                  )}
                  {courseData.course.alternateLink && (
                    <div>
                      <a
                        href={courseData.course.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Ver en Classroom
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {studentCourses.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes cursos como estudiante
          </h3>
          <p className="text-gray-600 mb-4">
            Selecciona algunos cursos donde seas estudiante para ver tus estadísticas.
          </p>
          <Button onClick={() => router.push('/courses/select')}>
            Configurar Cursos
          </Button>
        </div>
      )}
    </div>
  );
}
