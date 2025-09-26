
'use client';

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, LogOut, BookOpen, GraduationCap, Users, Settings, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserCourses } from "@/app/actions/classroom";
import { ClassroomCourse, UserCourseRole } from "@/lib/classroom";
import { handleLogout } from "@/lib/auth-utils";

interface CourseSettings {
  [courseId: string]: boolean;
}

export default function CourseSelectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [userRoles, setUserRoles] = useState<UserCourseRole[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<CourseSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    // Cargar configuración guardada
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);

        // Validar que los settings pertenecen al usuario actual
        if (settings.userId && settings.userId !== session?.user?.email) {
          // Settings de otro usuario - no cargar
          console.log('Settings belong to different user, ignoring');
        } else {
          setSelectedCourses(settings.selectedCourses || {});
        }
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }

    // Cargar cursos
    loadCourses();
  }, [router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const result = await fetchUserCourses();

      if (result.success && result.data) {
        setCourses(result.data.courses);
        setUserRoles(result.data.userRoles);
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      setError('Error al cargar los cursos');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    const newSettings = {
      ...selectedCourses,
      [courseId]: checked
    };
    setSelectedCourses(newSettings);

    // Guardar en localStorage con información del usuario
    const settings = {
      selectedCourses: newSettings,
      userId: session?.user?.email,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('settings', JSON.stringify(settings));
  };

  const handleContinue = () => {
    const hasSelectedCourses = Object.values(selectedCourses).some(selected => selected);
    if (hasSelectedCourses) {
      router.push('/dashboard');
    }
  };

  const getRoleForCourse = (courseId: string): 'TEACHER' | 'STUDENT' | null => {
    const role = userRoles.find(r => r.courseId === courseId);
    return role ? role.role : null;
  };

  const getSelectedCount = () => {
    return Object.values(selectedCourses).filter(selected => selected).length;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={loadCourses} className="mr-2">
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => handleLogout()}>
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Seleccionar Cursos
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLogout("/")}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecciona los cursos que quieres monitorear
          </h2>
          <p className="text-gray-600">
            Elige los cursos de Google Classroom de los cuales quieres ver estadísticas en tu dashboard.
          </p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron cursos
              </h3>
              <p className="text-gray-600">
                No tienes cursos activos en Google Classroom o no tienes los permisos necesarios.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 mb-8">
              {courses.map((course) => {
                const role = getRoleForCourse(course.id);
                const isSelected = selectedCourses[course.id] || false;

                return (
                  <Card key={course.id} className={`transition-all ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          id={course.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {course.name}
                            </h3>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role === 'TEACHER'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                              }`}>
                              {role === 'TEACHER' ? (
                                <>
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  Profesor
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  Estudiante
                                </>
                              )}
                            </div>
                          </div>
                          {course.section && (
                            <p className="text-sm text-gray-600 mb-1">
                              Sección: {course.section}
                            </p>
                          )}
                          {course.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {getSelectedCount()} curso{getSelectedCount() !== 1 ? 's' : ''} seleccionado{getSelectedCount() !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  onClick={handleContinue}
                  disabled={getSelectedCount() === 0}
                  className="flex items-center space-x-2"
                >
                  <span>Continuar al Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
