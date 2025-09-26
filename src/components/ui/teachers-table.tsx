'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, GraduationCap, Mail, BookOpen, Users, FileText, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { classroom_v1 } from 'googleapis';

interface CourseData {
  course: classroom_v1.Schema$Course;
  students: classroom_v1.Schema$Student[];
  teachers: classroom_v1.Schema$Teacher[];
  coursework: classroom_v1.Schema$CourseWork[];
  announcements: classroom_v1.Schema$Announcement[];
  userRole: 'TEACHER' | 'STUDENT' | 'BOTH';
}

interface TeachersTableProps {
  courses: [string, CourseData][];
}

export function TeachersTable({ courses }: TeachersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Procesar datos de profesores
  const teachersData = useMemo(() => {
    const teacherMap = new Map();

    courses.forEach(([courseId, courseData]) => {
      const courseName = courseData.course?.name || 'Curso sin nombre';
      const courseSection = courseData.course?.section;
      const courseRoom = courseData.course?.room;
      const studentsCount = courseData.students?.length || 0;
      const courseworkCount = courseData.coursework?.length || 0;
      const announcementsCount = courseData.announcements?.length || 0;

      // Solo procesar si realmente hay profesores
      if (!courseData.teachers || courseData.teachers.length === 0) {
        console.log(`No teachers found for course: ${courseName}`);
        return;
      }

      courseData.teachers.forEach((teacher) => {
        const teacherId = teacher.userId;
        const teacherName = teacher.profile?.name?.fullName || 'Profesor sin nombre';
        const teacherEmail = teacher.profile?.emailAddress || '';
        const photoUrl = teacher.profile?.photoUrl;

        if (!teacherId) return; // Skip if no teacher ID

        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            id: teacherId,
            name: teacherName,
            email: teacherEmail,
            photoUrl,
            courses: [],
            totalStudents: 0,
            totalAssignments: 0,
            totalAnnouncements: 0,
          });
        }

        const teacherRecord = teacherMap.get(teacherId);
        teacherRecord.courses.push({
          courseId,
          courseName,
          courseSection,
          courseRoom,
          studentsCount,
          courseworkCount,
          announcementsCount,
          lastActivity: new Date().toISOString(), // TODO: Obtener fecha real de última actividad
        });

        teacherRecord.totalStudents += studentsCount;
        teacherRecord.totalAssignments += courseworkCount;
        teacherRecord.totalAnnouncements += announcementsCount;
      });
    });

    const result = Array.from(teacherMap.values());
    console.log(`Processed ${result.length} teachers from ${courses.length} courses`);
    return result;
  }, [courses]);

  // Obtener listas únicas para filtros
  const uniqueCourses = useMemo(() => {
    const courseSet = new Set();
    courses.forEach(([courseId, courseData]) => {
      courseSet.add({
        id: courseId,
        name: courseData.course?.name || 'Curso sin nombre',
      });
    });
    return Array.from(courseSet);
  }, [courses]);

  // Filtrar profesores
  const filteredTeachers = useMemo(() => {
    return teachersData.filter((teacher) => {
      // Filtro por búsqueda
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por curso
      const matchesCourse = selectedCourse === 'all' ||
        teacher.courses.some((course: any) => course.courseId === selectedCourse);
      return matchesSearch && matchesCourse;
    });
  }, [teachersData, searchTerm, selectedCourse]);

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar profesores por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {uniqueCourses.map((course: any) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{filteredTeachers.length}</p>
                <p className="text-xs text-gray-600">Profesores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredTeachers.reduce((acc, t) => acc + t.totalStudents, 0)}
                </p>
                <p className="text-xs text-gray-600">Total Estudiantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredTeachers.reduce((acc, t) => acc + t.totalAssignments, 0)}
                </p>
                <p className="text-xs text-gray-600">Total Tareas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredTeachers.reduce((acc, t) => acc + t.totalAnnouncements, 0)}
                </p>
                <p className="text-xs text-gray-600">Anuncios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de profesores */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cursos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt={teacher.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {teacher.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {teacher.courses.map((course: any, index: any) => (
                        <div key={index} className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {course.courseName}
                          </Badge>
                          {course.courseSection && (
                            <div className="text-xs text-gray-500">
                              Sección: {course.courseSection}
                            </div>
                          )}
                          {course.courseRoom && (
                            <div className="text-xs text-gray-500">
                              Aula: {course.courseRoom}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.totalStudents}
                    </div>
                    <div className="text-xs text-gray-500">
                      En {teacher.courses.length} curso{teacher.courses.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-gray-600">
                          {teacher.totalAssignments} tareas
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-gray-600">
                          {teacher.totalAnnouncements} anuncios
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatLastActivity(teacher.courses[0]?.lastActivity || new Date().toISOString())}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Activo
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron profesores
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
