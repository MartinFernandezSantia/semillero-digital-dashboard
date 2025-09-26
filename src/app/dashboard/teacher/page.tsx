'use client';

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, FileText, Calendar, Clock, UserCheck } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RealSubmissions } from "@/components/ui/real-submissions";
import { AttendanceModal } from "@/components/ui/attendance-modal";

interface CourseData {
  course: any;
  students: any[];
  teachers: any[];
  coursework: any[];
  announcements: any[];
  userRole: 'TEACHER' | 'STUDENT' | 'BOTH';
}

export default function TeacherDashboard() {
  const { teacherCourses, studentCourses } = useDashboard();
  const router = useRouter();
  const [attendanceModal, setAttendanceModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseName: string;
  }>({
    isOpen: false,
    courseId: '',
    courseName: ''
  });

  // Manejar redirecciones en useEffect
  React.useEffect(() => {
    if (teacherCourses.length === 0) {
      if (studentCourses.length > 0) {
        router.push('/dashboard/student');
      } else {
        router.push('/courses/select');
      }
    }
  }, [teacherCourses.length, studentCourses.length, router]);

  const calculateTeacherStats = (courseData: CourseData) => {
    const totalStudents = courseData.students?.length || 0;
    const totalAssignments = courseData.coursework?.length || 0;
    const totalAnnouncements = courseData.announcements?.length || 0;

    return {
      totalStudents,
      totalAssignments,
      totalAnnouncements,
      recentActivity: totalAssignments + totalAnnouncements
    };
  };

  // Si no tiene cursos como profesor, mostrar loading mientras redirige
  if (teacherCourses.length === 0) {
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
      {/* Título solo si no hay navegación (solo es profesor) */}
      {studentCourses.length === 0 && (
        <div className="flex items-center space-x-2 mb-8">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sección Profesor</h2>
        </div>
      )}

      <div className="space-y-8">
        {teacherCourses.map(([courseId, courseData]) => {
          const stats = calculateTeacherStats(courseData);

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
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Profesor
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                        <p className="text-sm text-gray-600">Estudiantes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                        <p className="text-sm text-gray-600">Tareas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
                        <p className="text-sm text-gray-600">Anuncios</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
                        <p className="text-sm text-gray-600">Actividad Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Botón de Asistencia */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => setAttendanceModal({
                    isOpen: true,
                    courseId: courseId,
                    courseName: courseData.course.name || 'Curso sin nombre'
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Tomar Asistencia</span>
                </Button>
              </div>

              {/* Información adicional del curso */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  {courseData.course.room && (
                    <div>
                      <span className="font-medium">Aula:</span> {courseData.course.room}
                    </div>
                  )}
                  {courseData.course.enrollmentCode && (
                    <div>
                      <span className="font-medium">Código:</span> {courseData.course.enrollmentCode}
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

              {/* Visualizaciones avanzadas */}
              <RealSubmissions
                courseId={courseId}
                courseName={courseData.course.name || 'Curso sin nombre'}
                students={courseData.students || []}
                coursework={courseData.coursework || []}
              />
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {teacherCourses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes cursos como profesor
          </h3>
          <p className="text-gray-600 mb-4">
            Selecciona algunos cursos donde seas profesor para ver tus estadísticas.
          </p>
          <Button onClick={() => router.push('/courses/select')}>
            Configurar Cursos
          </Button>
        </div>
      )}

      {/* Modal de Asistencia */}
      <AttendanceModal
        isOpen={attendanceModal.isOpen}
        onClose={() => setAttendanceModal({ isOpen: false, courseId: '', courseName: '' })}
        courseId={attendanceModal.courseId}
        courseName={attendanceModal.courseName}
      />
    </div>
  );
}
