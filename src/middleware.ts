import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // El middleware se ejecuta solo si el usuario está autenticado
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Solo permitir acceso si hay un token válido
        return !!token;
      },
    },
  }
);

// Configurar qué rutas proteger
export const config = {
  matcher: [
    /*
     * Proteger todas las rutas excepto:
     * - api/auth/* (rutas de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - rutas públicas como /auth/*
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};
