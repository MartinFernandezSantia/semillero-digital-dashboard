'use client';

import { useDashboard } from "@/contexts/dashboard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Users, BookOpen, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
  const { ownerCourses, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-amber-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (ownerCourses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes cursos propios
            </h2>
            <p className="text-gray-600 mb-6">
              Los cursos que hayas creado aparecerán aquí
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
          </div>
          <p className="text-gray-600">
            Cursos que has creado y administras • {ownerCourses.length} curso{ownerCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Total Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{ownerCourses.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Total Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {ownerCourses.reduce((total, [_, data]) => total + (data.students?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Total Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {ownerCourses.reduce((total, [_, data]) => total + (data.coursework?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Anuncios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {ownerCourses.reduce((total, [_, data]) => total + (data.announcements?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerCourses.map(([courseId, data]) => (
            <Card key={courseId} className="bg-white/90 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {data.course.name}
                    </CardTitle>
                    {data.course.section && (
                      <CardDescription className="text-amber-700 font-medium">
                        {data.course.section}
                      </CardDescription>
                    )}
                  </div>
                  <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                </div>
                {data.course.description && (
                  <CardDescription className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {data.course.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Estadísticas del curso */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {data.students?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Estudiantes</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {data.coursework?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Tareas</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {data.announcements?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Anuncios</div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="pt-4 border-t border-amber-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.course.courseState === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {data.course.courseState === 'ACTIVE' ? 'Activo' : data.course.courseState}
                    </span>
                  </div>

                  {data.course.enrollmentCode && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500">Código:</span>
                      <code className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-mono">
                        {data.course.enrollmentCode}
                      </code>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      if (data.course.alternateLink) {
                        window.open(data.course.alternateLink, '_blank');
                      }
                    }}                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Administrar en Classroom
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
