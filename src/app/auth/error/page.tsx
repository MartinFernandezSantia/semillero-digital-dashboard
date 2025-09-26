"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Signin: "Error al intentar iniciar sesión.",
  OAuthSignin: "Error al iniciar sesión con Google.",
  OAuthCallback: "Error en el callback de Google.",
  OAuthCreateAccount: "No se pudo crear la cuenta.",
  EmailCreateAccount: "No se pudo crear la cuenta con email.",
  Callback: "Error en el callback de autenticación.",
  OAuthAccountNotLinked: "Esta cuenta no está vinculada.",
  EmailSignin: "No se pudo enviar el email de inicio de sesión.",
  CredentialsSignin: "Credenciales inválidas.",
  SessionRequired: "Debes iniciar sesión para acceder a esta página.",
  AccessDenied: "Acceso denegado. Tu email no está registrado en Google Classroom como estudiante o profesor.",
  default: "Ha ocurrido un error inesperado.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Error de Autenticación
        </CardTitle>
        <CardDescription className="text-gray-600">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === "AccessDenied" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-medium mb-2">¿Por qué veo este error?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tu email debe estar registrado en Google Classroom</li>
              <li>Debes ser estudiante o profesor del curso</li>
              <li>Contacta al administrador si crees que esto es un error</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Intentar de nuevo
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Volver al inicio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Cargando...
            </CardTitle>
          </CardHeader>
        </Card>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
