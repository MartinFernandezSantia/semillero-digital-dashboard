import { google } from "googleapis";
import type { classroom_v1 } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: string;
  alternateLink: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  teacherFolder?: {
    id: string;
    title: string;
    alternateLink: string;
  };
  guardiansEnabled: boolean;
  calendarId?: string;
}

export interface UserCourseRole {
  courseId: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface ClassroomTeacher {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface ClassroomCourseWork {
  courseId: string;
  id: string;
  title: string;
  description?: string;
  materials?: classroom_v1.Schema$Material[];
  state: string;
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: string;
}

export interface ClassroomAnnouncement {
  courseId: string;
  id: string;
  text: string;
  materials?: classroom_v1.Schema$Material[];
  state: string;
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  scheduledTime?: string;
}

export async function getClassroomCourses(): Promise<{
  courses: ClassroomCourse[];
  userRoles: UserCourseRole[];
}> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });

  const classroom = google.classroom({ version: "v1", auth });

  try {
    // Obtener cursos donde el usuario es profesor
    const teacherCoursesResponse = await classroom.courses.list({
      teacherId: 'me',
      courseStates: ['ACTIVE'],
    });

    // Obtener cursos donde el usuario es estudiante
    const studentCoursesResponse = await classroom.courses.list({
      studentId: 'me',
      courseStates: ['ACTIVE'],
    });

    const teacherCourses = teacherCoursesResponse.data.courses || [];
    const studentCourses = studentCoursesResponse.data.courses || [];

    // Combinar cursos y eliminar duplicados
    const allCoursesMap = new Map<string, ClassroomCourse>();
    const userRolesMap = new Map<string, Set<'TEACHER' | 'STUDENT'>>();

    // Agregar cursos donde es profesor
    teacherCourses.forEach((course) => {
      if (course.id) {
        allCoursesMap.set(course.id, course as ClassroomCourse);
        if (!userRolesMap.has(course.id)) {
          userRolesMap.set(course.id, new Set());
        }
        userRolesMap.get(course.id)!.add('TEACHER');
      }
    });

    // Agregar cursos donde es estudiante
    studentCourses.forEach((course) => {
      if (course.id) {
        allCoursesMap.set(course.id, course as ClassroomCourse);
        if (!userRolesMap.has(course.id)) {
          userRolesMap.set(course.id, new Set());
        }
        userRolesMap.get(course.id)!.add('STUDENT');
      }
    });

    const courses = Array.from(allCoursesMap.values());

    // Crear array de roles consolidados - priorizar TEACHER si tiene ambos roles
    const userRoles: UserCourseRole[] = [];
    userRolesMap.forEach((roles, courseId) => {
      const role = roles.has('TEACHER') ? 'TEACHER' : 'STUDENT';
      userRoles.push({
        courseId,
        role
      });
    });

    return {
      courses,
      userRoles
    };
  } catch (error) {
    console.error("Error fetching classroom courses:", error);
    throw new Error("Failed to fetch classroom courses");
  }
}

export async function getCourseDetails(courseId: string, userRole?: 'TEACHER' | 'STUDENT'): Promise<{
  course: classroom_v1.Schema$Course;
  students: classroom_v1.Schema$Student[];
  teachers: classroom_v1.Schema$Teacher[];
  coursework: classroom_v1.Schema$CourseWork[];
  announcements: classroom_v1.Schema$Announcement[];
}> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });

  const classroom = google.classroom({ version: "v1", auth });

  try {
    // Obtener detalles del curso (esto siempre debería funcionar)
    const courseResponse = await classroom.courses.get({
      id: courseId,
    });

    // Inicializar arrays vacíos para datos opcionales
    let students: classroom_v1.Schema$Student[] = [];
    let teachers: classroom_v1.Schema$Teacher[] = [];
    let coursework: classroom_v1.Schema$CourseWork[] = [];
    let announcements: classroom_v1.Schema$Announcement[] = [];

    // Intentar obtener estudiantes del curso
    try {
      const studentsResponse = await classroom.courses.students.list({
        courseId: courseId,
      });
      students = studentsResponse.data.students || [];
    } catch (error) {
      console.warn(`No permission to access students for course ${courseId}:`, error);
    }

    // Intentar obtener profesores del curso
    try {
      const teachersResponse = await classroom.courses.teachers.list({
        courseId: courseId,
      });
      teachers = teachersResponse.data.teachers || [];
    } catch (error) {
      console.warn(`No permission to access teachers for course ${courseId}:`, error);
    }

    // Intentar obtener tareas del curso - usar estrategia diferente para estudiantes
    if (userRole === 'STUDENT') {
      // Para estudiantes, intentar obtener tareas a través de sus submissions
      try {
        const submissionsResponse = await classroom.courses.courseWork.studentSubmissions.list({
          courseId: courseId,
          userId: 'me',
        });
        
        // Extraer información de coursework de las submissions
        const courseworkMap = new Map<string, classroom_v1.Schema$CourseWork>();
        
        if (submissionsResponse.data.studentSubmissions) {
          for (const submission of submissionsResponse.data.studentSubmissions) {
            if (submission.courseWorkId) {
              try {
                const courseworkResponse = await classroom.courses.courseWork.get({
                  courseId: courseId,
                  id: submission.courseWorkId,
                });
                if (courseworkResponse.data) {
                  courseworkMap.set(submission.courseWorkId, courseworkResponse.data);
                }
              } catch (error) {
                console.warn(`Could not get coursework ${submission.courseWorkId}:`, error);
              }
            }
          }
        }
        
        coursework = Array.from(courseworkMap.values());
      } catch (error) {
        console.warn(`No permission to access student submissions for course ${courseId}:`, error);
        
        // Fallback: intentar el método normal
        try {
          const courseworkResponse = await classroom.courses.courseWork.list({
            courseId: courseId,
          });
          coursework = courseworkResponse.data.courseWork || [];
        } catch (fallbackError) {
          console.warn(`No permission to access coursework for course ${courseId}:`, fallbackError);
        }
      }
    } else {
      // Para profesores, usar el método normal
      try {
        const courseworkResponse = await classroom.courses.courseWork.list({
          courseId: courseId,
        });
        coursework = courseworkResponse.data.courseWork || [];
      } catch (error) {
        console.warn(`No permission to access coursework for course ${courseId}:`, error);
      }
    }

    // Intentar obtener anuncios del curso
    try {
      const announcementsResponse = await classroom.courses.announcements.list({
        courseId: courseId,
      });
      announcements = announcementsResponse.data.announcements || [];
    } catch (error) {
      console.warn(`No permission to access announcements for course ${courseId}:`, error);
    }

    return {
      course: courseResponse.data,
      students,
      teachers,
      coursework,
      announcements,
    };
  } catch (error) {
    console.error(`Error fetching course details for ${courseId}:`, error);
    throw new Error(`Failed to fetch course details for ${courseId}`);
  }
}

/**
 * Obtiene todas las entregas (submissions) para un curso específico
 */
export async function getCourseSubmissions(courseId: string): Promise<classroom_v1.Schema$StudentSubmission[]> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });

  const classroom = google.classroom({ version: "v1", auth });

  try {
    // Primero obtener todas las tareas del curso
    const courseworkResponse = await classroom.courses.courseWork.list({
      courseId: courseId,
    });

    const coursework = courseworkResponse.data.courseWork || [];
    const allSubmissions: classroom_v1.Schema$StudentSubmission[] = [];

    // Para cada tarea, obtener todas las entregas
    for (const work of coursework) {
      if (work.id) {
        try {
          const submissionsResponse = await classroom.courses.courseWork.studentSubmissions.list({
            courseId: courseId,
            courseWorkId: work.id,
          });

          const submissions = submissionsResponse.data.studentSubmissions || [];
          allSubmissions.push(...submissions);
        } catch (error) {
          console.warn(`Could not get submissions for coursework ${work.id}:`, error);
        }
      }
    }

    return allSubmissions;
  } catch (error) {
    console.error(`Error fetching submissions for course ${courseId}:`, error);
    throw new Error(`Failed to fetch submissions for course ${courseId}`);
  }
}

/**
 * Obtiene entregas para una tarea específica
 */
export async function getCourseWorkSubmissions(
  courseId: string, 
  courseWorkId: string
): Promise<classroom_v1.Schema$StudentSubmission[]> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });

  const classroom = google.classroom({ version: "v1", auth });

  try {
    const submissionsResponse = await classroom.courses.courseWork.studentSubmissions.list({
      courseId: courseId,
      courseWorkId: courseWorkId,
    });

    return submissionsResponse.data.studentSubmissions || [];
  } catch (error) {
    console.error(`Error fetching submissions for coursework ${courseWorkId}:`, error);
    throw new Error(`Failed to fetch submissions for coursework ${courseWorkId}`);
  }
}

/**
 * Obtiene los estudiantes de un curso específico
 */
export async function getCourseStudents(courseId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });

  const classroom = google.classroom({ version: "v1", auth });

  try {
    const response = await classroom.courses.students.list({
      courseId: courseId,
    });

    const students = response.data.students || [];
    console.log(`👥 Retrieved ${students.length} students for course ${courseId}`);
    
    return {
      success: true,
      data: students
    };

  } catch (error) {
    console.error('Error getting course students:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}