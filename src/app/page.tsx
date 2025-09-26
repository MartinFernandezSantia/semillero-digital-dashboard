"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const savedSettings = localStorage.getItem('settings');
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          
          // Validar que los settings pertenecen al usuario actual
          if (settings.userId && settings.userId !== session?.user?.email) {
            // Settings de otro usuario - ir a selección de cursos
            router.push('/courses/select');
            return;
          }
          
          // Verificar si hay cursos seleccionados
          const hasSelectedCourses = settings.selectedCourses && 
            Object.values(settings.selectedCourses).some((selected: unknown) => selected === true);
          
          if (hasSelectedCourses) {
            // Tiene cursos seleccionados - ir al dashboard
            router.push('/dashboard');
          } else {
            // No tiene cursos seleccionados - ir a selección
            router.push('/courses/select');
          }
        } catch (error) {
          console.error('Error parsing saved settings:', error);
          // Error al parsear - ir a selección de cursos
          router.push('/courses/select');
        }
      } else {
        // No hay settings guardados - ir a selección de cursos
        router.push('/courses/select');
      }
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Semillero Digital
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Dashboard para Google Classroom
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Inicia sesión con tu cuenta de Google para acceder a tus cursos de Classroom
            </p>
            <Button
              onClick={() => signIn('google')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              size="lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Iniciar sesión con Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Este return nunca debería ejecutarse debido al useEffect
  return null;
}
