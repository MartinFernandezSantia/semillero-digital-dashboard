'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fetchCourseDetails } from '@/app/actions/classroom';
import { classroom_v1 } from 'googleapis';
import { clearAppStorage } from '@/lib/auth-utils';

interface CourseSettings {
  selectedCourses: { [courseId: string]: boolean };
  userId?: string;
  timestamp?: string;
}

interface CourseData {
  course: classroom_v1.Schema$Course;
  students: classroom_v1.Schema$Student[];
  teachers: classroom_v1.Schema$Teacher[];
  coursework: classroom_v1.Schema$CourseWork[];
  announcements: classroom_v1.Schema$Announcement[];
  userRole: 'TEACHER' | 'STUDENT' | 'BOTH';
}

interface DashboardContextType {
  coursesData: { [courseId: string]: CourseData };
  selectedCourses: string[];
  loading: boolean;
  error: string | null;
  teacherCourses: [string, CourseData][];
  studentCourses: [string, CourseData][];
  ownerCourses: [string, CourseData][];
  refreshData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coursesData, setCoursesData] = useState<{ [courseId: string]: CourseData }>({});
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<{ [courseId: string]: 'TEACHER' | 'STUDENT' }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  const loadCoursesData = async (courseIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Primero obtener los roles de usuario desde getClassroomCourses
      const { fetchUserCourses } = await import('@/app/actions/classroom');
      const coursesResult = await fetchUserCourses();
      
      if (!coursesResult.success || !coursesResult.data) {
        throw new Error('Failed to fetch user courses');
      }
      
      // Crear mapa de roles
      const rolesMap: { [courseId: string]: 'TEACHER' | 'STUDENT' } = {};
      coursesResult.data.userRoles.forEach(role => {
        rolesMap[role.courseId] = role.role;
      });
      setUserRoles(rolesMap);

      const coursesDataMap: { [courseId: string]: CourseData } = {};

      // Cargar datos de cada curso seleccionado
      for (const courseId of courseIds) {
        const userRole = rolesMap[courseId] || 'STUDENT';
        const result = await fetchCourseDetails(courseId, userRole);
        
        if (result.success && result.data) {
          coursesDataMap[courseId] = {
            ...result.data,
            userRole
          };
        } else {
          console.error('Failed to load course details for:', courseId, result.error);
        }
      }

      setCoursesData(coursesDataMap);
      setDataLoaded(true);
    } catch (err) {
      setError('Error al cargar los datos de los cursos');
      console.error('Error loading courses data:', err);
    } finally {
      setLoading(false);
    }
  };


  const refreshData = () => {
    if (selectedCourses.length > 0) {
      loadCoursesData(selectedCourses);
    }
  };

  // Handle session changes - clear localStorage if user changes or logs out
  useEffect(() => {
    if (status === 'unauthenticated') {
      // User logged out - clear everything
      clearAppStorage();
      setCoursesData({});
      setSelectedCourses([]);
      setUserRoles({});
      setDataLoaded(false);
      setLastUserId(null);
    } else if (session?.user?.email && lastUserId && session.user.email !== lastUserId) {
      // Different user logged in - clear previous user's data
      clearAppStorage();
      setCoursesData({});
      setSelectedCourses([]);
      setUserRoles({});
      setDataLoaded(false);
      setLastUserId(session.user.email);
    } else if (session?.user?.email && !lastUserId) {
      // First time setting user ID
      setLastUserId(session.user.email);
    }
  }, [status, session?.user?.email, lastUserId]);

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    // Solo cargar si no se han cargado datos previamente
    if (!dataLoaded) {
      // Cargar configuración guardada
      const savedSettings = localStorage.getItem('settings');
      if (!savedSettings) {
        router.push('/courses/select');
        return;
      }

      try {
        const settings: CourseSettings = JSON.parse(savedSettings);

        // Validar que los settings pertenecen al usuario actual
        if (settings.userId && settings.userId !== session?.user?.email) {
          // Settings de otro usuario - limpiar y redirigir
          clearAppStorage();
          router.push('/courses/select');
          return;
        }

        const selected = Object.entries(settings.selectedCourses)
          .filter(([, isSelected]) => isSelected)
          .map(([courseId]) => courseId);

        if (selected.length === 0) {
          router.push('/courses/select');
          return;
        }

        setSelectedCourses(selected);
        loadCoursesData(selected);
      } catch (e) {
        console.error('Error parsing saved settings:', e);
        router.push('/courses/select');
      }
    } else {
      setLoading(false);
    }
  }, [session, router, dataLoaded]);

  const getTeacherCourses = (): [string, CourseData][] => {
    const currentUserId = (session as any)?.googleId;
    
    return Object.entries(coursesData).filter(([_, data]) => {
      // Solo incluir si es TEACHER pero NO es el owner
      const isTeacher = data.userRole === 'TEACHER';
      const isOwner = data.course?.ownerId === currentUserId;
      
      console.log(`📚 Course "${data.course?.name}": isTeacher=${isTeacher}, isOwner=${isOwner}, includeInTeacher=${isTeacher && !isOwner}`);
      
      return isTeacher && !isOwner;
    });
  };

  const getStudentCourses = (): [string, CourseData][] => {
    return Object.entries(coursesData).filter(([_, data]) => data.userRole === 'STUDENT');
  };

  const getOwnerCourses = (): [string, CourseData][] => {
    const currentUserEmail = session?.user?.email;
    const currentUserId = (session as any)?.googleId;
    
    console.log('🔍 Checking owner courses:', {
      currentUserEmail,
      currentUserId,
      currentUserEmailType: typeof currentUserEmail,
      currentUserIdType: typeof currentUserId,
      sessionKeys: Object.keys(session || {}),
      userKeys: Object.keys(session?.user || {}),
      fullSession: session,
      totalCourses: Object.keys(coursesData).length,
      coursesData: Object.entries(coursesData).map(([id, data]) => ({
        courseId: id,
        courseName: data.course?.name,
        ownerId: data.course?.ownerId,
        ownerIdType: typeof data.course?.ownerId,
        isOwner: data.course?.ownerId === currentUserEmail,
        // Comparaciones adicionales para debug
        emailsMatch: data.course?.ownerId === currentUserEmail,
        emailTrimMatch: data.course?.ownerId?.trim() === currentUserEmail?.trim(),
        emailLowerMatch: data.course?.ownerId?.toLowerCase() === currentUserEmail?.toLowerCase(),
        // Comparaciones con ID
        idMatch: data.course?.ownerId === currentUserId,
        idStringMatch: data.course?.ownerId === String(currentUserId),
        // Mostrar caracteres especiales
        ownerIdLength: data.course?.ownerId?.length,
        currentEmailLength: currentUserEmail?.length,
        currentUserIdLength: String(currentUserId || '').length
      }))
    });
    
    const ownerCourses = Object.entries(coursesData).filter(([_, data]) => {
      const ownerId = data.course?.ownerId;
      const userEmail = currentUserEmail;
      const userId = currentUserId;
      
      if (!ownerId) return false;
      
      // Primero intentar comparar con ID de usuario (más confiable)
      if (userId && ownerId === String(userId)) {
        return true;
      }
      
      // Fallback: comparar con email (normalizado)
      if (userEmail) {
        const normalizedOwnerId = ownerId.trim().toLowerCase();
        const normalizedUserEmail = userEmail.trim().toLowerCase();
        return normalizedOwnerId === normalizedUserEmail;
      }
      
      return false;
    });
    
    console.log('👑 Owner courses found:', {
      count: ownerCourses.length,
      courses: ownerCourses.map(([id, data]) => ({
        courseId: id,
        courseName: data.course?.name,
        ownerId: data.course?.ownerId
      }))
    });
    
    return ownerCourses;
  };

  const teacherCourses = getTeacherCourses();
  const studentCourses = getStudentCourses();
  const ownerCourses = getOwnerCourses();

  const value: DashboardContextType = {
    coursesData,
    selectedCourses,
    loading,
    error,
    teacherCourses,
    studentCourses,
    ownerCourses,
    refreshData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
