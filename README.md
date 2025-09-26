# Semillero Digital Dashboard

Dashboard web para estudiantes y profesores del Semillero Digital con autenticación mediante Google OAuth y validación de acceso a través de Google Classroom.

## Características

- ✅ **Autenticación segura**: Solo login con Google OAuth
- ✅ **Control de acceso**: Solo usuarios registrados en Google Classroom pueden acceder
- ✅ **Interfaz moderna**: UI construida con shadcn/ui y Tailwind CSS
- ✅ **Responsive**: Diseño adaptable a dispositivos móviles y desktop
- ✅ **TypeScript**: Tipado estático para mejor desarrollo

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **NextAuth.js** - Autenticación
- **Google APIs** - Integración con Google Classroom
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **TypeScript** - Tipado estático

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-seguro-aqui

# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Google Classroom API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key-aqui\n-----END PRIVATE KEY-----"

# Google Classroom Configuration
CLASSROOM_COURSE_ID=tu-course-id-de-google-classroom
```

### 3. Configurar Google Cloud Console

#### OAuth 2.0 (para NextAuth):
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ 
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Configura el origen autorizado: `http://localhost:3000`
6. Configura la URI de redirección: `http://localhost:3000/api/auth/callback/google`

#### Service Account (para Google Classroom API):
1. En Google Cloud Console, ve a "Credenciales"
3. Descarga el archivo JSON con las credenciales
4. Habilita la API de Google Classroom
5. Comparte tu Google Classroom con el email de la service account

### 4. Obtener Course ID de Google Classroom
1. Ve a tu Google Classroom
2. El Course ID está en la URL: `https://classroom.google.com/c/COURSE_ID_AQUI`

## Desarrollo

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # Rutas de NextAuth
│   ├── auth/                       # Páginas de autenticación
│   │   ├── signin/                 # Página de login
│   │   └── error/                  # Página de errores
│   ├── globals.css                 # Estilos globales
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Dashboard principal
├── components/
│   ├── ui/                         # Componentes UI (shadcn)
│   └── session-provider.tsx        # Provider de sesión
├── lib/
│   ├── auth.ts                     # Configuración de NextAuth
│   └── utils.ts                    # Utilidades
└── middleware.ts                   # Middleware de protección de rutas
```
## Licencia

Este proyecto está bajo la Licencia MIT.
