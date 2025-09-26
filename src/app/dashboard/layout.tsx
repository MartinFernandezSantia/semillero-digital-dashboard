'use client';

import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut, GraduationCap, Users, Settings, BookOpen, BarChart3, Crown } from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context";
import { handleLogout } from "@/lib/auth-utils";
function DashboardHeader() {
  const { data: session } = useSession();
  const { teacherCourses, studentCourses, ownerCourses } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentViewTitle = () => {
    if (pathname === '/dashboard/teacher') return 'Dashboard - Profesor';
    if (pathname === '/dashboard/student') return 'Dashboard - Estudiante';
    if (pathname === '/dashboard/courses') return 'Dashboard - Mis Cursos';
    if (pathname === '/dashboard/owner') return 'Dashboard - Mis Cursos';
    return 'Dashboard';
  };

  const getTotalCourses = () => {
    return teacherCourses.length + studentCourses.length + ownerCourses.length;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {getCurrentViewTitle()}
              </h1>
              {getTotalCourses() > 0 && (
                <p className="text-xs text-gray-500">
                  {getTotalCourses()} curso{getTotalCourses() !== 1 ? 's' : ''} activo{getTotalCourses() !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Selector rápido de vista */}
            {teacherCourses.length > 0 && studentCourses.length > 0 && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Link
                  href="/dashboard/teacher"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${pathname === '/dashboard/teacher'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600'
                    }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Profesor</span>
                </Link>
                <Link
                  href="/dashboard/student"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${pathname === '/dashboard/student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Estudiante</span>
                </Link>
              </div>
            )}

            {/* Enlace a Mis Cursos */}
            <Link
              href="/dashboard/courses"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${pathname === '/dashboard/courses'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
                }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Mis Cursos</span>
            </Link>

            {/* Botón de configuración */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/courses/select')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>

            {/* Información del usuario */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 max-w-32 truncate">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>

            {/* Botón de logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLogout("/")}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardNavigation() {
  const pathname = usePathname();
  const { teacherCourses, studentCourses, ownerCourses, loading } = useDashboard();

  // Debug: Log navigation state
  console.log('📊 Dashboard Navigation State:', {
    pathname,
    loading,
    teacherCoursesCount: teacherCourses.length,
    studentCoursesCount: studentCourses.length,
    ownerCoursesCount: ownerCourses.length,
    teacherCourses: teacherCourses.map(([id, data]) => ({ id, name: data.course?.name })),
    studentCourses: studentCourses.map(([id, data]) => ({ id, name: data.course?.name })),
    ownerCourses: ownerCourses.map(([id, data]) => ({ id, name: data.course?.name, ownerId: data.course?.ownerId }))
  });

  if (loading) return null;

  // Mostrar navegación si tiene al menos un curso en cualquier rol
  const hasAnyCourses = teacherCourses.length > 0 || studentCourses.length > 0 || ownerCourses.length > 0;

  if (!hasAnyCourses) {
    return null;
  }

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1">
          {/* Tab Profesor */}
          {teacherCourses.length > 0 && (
            <Link
              href="/dashboard/teacher"
              className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${pathname === '/dashboard/teacher'
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-25'
                }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Profesor</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {teacherCourses.length}
              </span>
            </Link>
          )}

          {/* Tab Estudiante */}
          {studentCourses.length > 0 && (
            <Link
              href="/dashboard/student"
              className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${pathname === '/dashboard/student'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-25'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Estudiante</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {studentCourses.length}
              </span>
            </Link>
          )}

          {/* Tab Mis Cursos */}
          {ownerCourses.length > 0 && (
            <Link
              href="/dashboard/owner"
              className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${pathname === '/dashboard/owner'
                ? 'border-amber-500 text-amber-600 bg-amber-50'
                : 'border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-25'
                }`}
            >
              <Crown className="w-4 h-4" />
              <span>Mis Cursos</span>
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {ownerCourses.length}
              </span>
            </Link>
          )}

          {/* Indicador de rol activo - solo mostrar si hay ambos roles */}
          {teacherCourses.length > 0 && studentCourses.length > 0 && (
            <div className="flex-1 flex items-center justify-end">
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {pathname === '/dashboard/teacher' && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Vista Profesor</span>
                  </span>
                )}
                {pathname === '/dashboard/student' && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Vista Estudiante</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, error, teacherCourses, studentCourses, ownerCourses } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  // Manejar redirecciones en useEffect para evitar problemas de renderizado
  React.useEffect(() => {
    if (!loading && !error && pathname === '/dashboard') {
      // Prioridad: Mis Cursos > Profesor > Estudiante
      if (ownerCourses.length > 0) {
        router.push('/dashboard/owner');
      } else if (teacherCourses.length > 0) {
        router.push('/dashboard/teacher');
      } else if (studentCourses.length > 0) {
        router.push('/dashboard/student');
      } else {
        router.push('/courses/select');
      }
    }
  }, [loading, error, pathname, teacherCourses.length, studentCourses.length, ownerCourses.length, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se procesa la redirección
  if (pathname === '/dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />
      <DashboardNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </DashboardProvider>
  );
}
