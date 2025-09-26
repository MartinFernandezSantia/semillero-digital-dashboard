'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, FileText, BookOpen } from 'lucide-react';
import { StudentsTable } from '@/components/ui/students-table';
import { TeachersTable } from '@/components/ui/teachers-table';
import { SubmissionsOverviewTable } from '@/components/ui/submissions-overview-table';
import { useDashboard } from '@/contexts/dashboard-context';

export default function DashboardCoursesPage() {
  const { teacherCourses, studentCourses, loading, error, coursesData } = useDashboard();
  const [activeTab, setActiveTab] = useState('students');

  // Debug: Log course data
  React.useEffect(() => {
    console.log('🔍 Dashboard Courses Debug:');
    console.log('Teacher courses:', teacherCourses.length);
    console.log('Student courses:', studentCourses.length);
    console.log('Loading:', loading);
    console.log('Error:', error);
    
    // Log raw context data
    console.log('📊 Raw courses data:', Object.keys(coursesData).length, 'courses');
    Object.entries(coursesData).forEach(([courseId, data], index) => {
      console.log(`📋 Raw Course ${index + 1}:`, {
        courseId,
        courseName: data.course?.name,
        userRole: data.userRole,
        students: data.students?.length || 0,
        teachers: data.teachers?.length || 0,
        coursework: data.coursework?.length || 0,
        announcements: data.announcements?.length || 0
      });
    });
    
    teacherCourses.forEach(([courseId, data], index) => {
      console.log(`📚 Teacher Course ${index + 1}:`, {
        courseId,
        courseName: data.course?.name,
        userRole: data.userRole,
        students: data.students?.length || 0,
        teachers: data.teachers?.length || 0,
        coursework: data.coursework?.length || 0,
        announcements: data.announcements?.length || 0
      });
    });

    studentCourses.forEach(([courseId, data], index) => {
      console.log(`📖 Student Course ${index + 1}:`, {
        courseId,
        courseName: data.course?.name,
        userRole: data.userRole,
        students: data.students?.length || 0,
        teachers: data.teachers?.length || 0,
        coursework: data.coursework?.length || 0,
      });
    });
  }, [teacherCourses, studentCourses, loading, error, coursesData]);

  // Combinar todos los cursos para obtener datos completos
  // TEMPORAL: Usar todos los cursos disponibles si los filtrados están vacíos
  const allCoursesFromContext = Object.entries(coursesData);
  const allCourses = teacherCourses.length > 0 || studentCourses.length > 0 
    ? [...teacherCourses, ...studentCourses] 
    : allCoursesFromContext;
    
  console.log('📊 Using courses:', allCourses.length, 'total courses');
  
  const totalStudents = allCourses.reduce((acc, [, data]) => acc + (data.students?.length || 0), 0);
  const totalTeachers = allCourses.reduce((acc, [, data]) => acc + (data.teachers?.length || 0), 0);
  const totalSubmissions = allCourses.reduce((acc, [, data]) => acc + (data.coursework?.length || 0), 0);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando datos de cursos...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 mb-2">❌</div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (allCourses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cursos disponibles
          </h3>
          <p className="text-gray-600 mb-4">
            Debug info: Raw courses: {Object.keys(coursesData).length}, Teacher: {teacherCourses.length}, Student: {studentCourses.length}
          </p>
          <p className="text-gray-600">
            Ve a configuración para seleccionar cursos o revisa la consola para más detalles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-600">Gestiona estudiantes, profesores y entregas de todos tus cursos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {teacherCourses.length} como profesor, {studentCourses.length} como estudiante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              En todos los cursos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              En todos los cursos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Tareas y actividades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Estudiantes</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Profesores</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Entregas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Lista de Estudiantes y Progreso</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudentsTable courses={allCourses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span>Profesores y sus Clases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeachersTable courses={allCourses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Todas las Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionsOverviewTable courses={allCourses} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
