import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Scopes necesarios para Google Classroom
const GOOGLE_CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_CLASSROOM_SCOPES.join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      // Solo permitir login con Google
      if (account?.provider !== 'google') {
        return false;
      }
      
      // Permitir acceso a cualquier usuario con cuenta de Google
      return true;
    },
    async jwt({ token, user, account }) {
      // Persistir información adicional en el token
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.expiresAt = account.expires_at;
        // Capturar el ID del usuario de Google
        token.googleId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // Enviar propiedades al cliente
      if (session.user) {
        return {
          ...session,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          provider: token.provider,
          expiresAt: token.expiresAt,
          googleId: token.googleId,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
