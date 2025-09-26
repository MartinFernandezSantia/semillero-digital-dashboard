'use server';
import {
  getAttendanceStats,
  getAttendanceDates,
  getAttendanceForDate,
  ensureUsersExist,
  saveAttendances
} from '@/lib/attendance';
import { getCourseStudents } from '@/lib/classroom';


export interface AttendanceSubmission {
  userId: string;
  present: boolean;
}

export interface AttendanceResponse {
  success: boolean;
  data?: any;
  error?: string;
}


/**
 * Prepara los datos de asistencia para un curso específico
 * Asegura que todos los estudiantes estén en la base de datos
 */
export async function prepareAttendanceData(courseId: string): Promise<AttendanceResponse> {
  try {
    console.log(`📋 Preparing attendance data for course: ${courseId}`);

    // Obtener estudiantes del curso desde Google Classroom
    const studentsResult = await getCourseStudents(courseId);

    if (!studentsResult.success || !studentsResult.data) {
      return {
        success: false,
        error: 'No se pudieron obtener los estudiantes del curso'
      };
    }

    const students = studentsResult.data;
    console.log(`👥 Found ${students.length} students in course`);

    // Asegurar que todos los usuarios existan en la base de datos
    const users = await ensureUsersExist(students);
    console.log(`💾 Ensured ${users.length} users exist in database`);

    // Obtener asistencias del día actual
    const today = new Date();
    const todayAttendances = await getAttendanceForDate(courseId, today);

    // Crear mapa de asistencias existentes
    const attendanceMap = new Map(
      todayAttendances.map(att => [att.userId, att.present])
    );

    // Combinar datos de estudiantes con asistencias
    const attendanceData = users.map(user => ({
      googleId: user.id, // ID de Google Classroom
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      present: attendanceMap.get(user.id) ?? false, // Default a false si no hay registro
    }));

    return {
      success: true,
      data: {
        students: attendanceData,
        date: today.toISOString(),
        hasExistingAttendance: todayAttendances.length > 0,
      }
    };

  } catch (error) {
    console.error('Error preparing attendance data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Guarda las asistencias tomadas
 */
export async function submitAttendance(
  courseId: string,
  date: string,
  attendances: AttendanceSubmission[]
): Promise<AttendanceResponse> {
  try {
    console.log(`💾 Saving attendance for course ${courseId} on ${date}`);
    console.log(`📊 Attendance data:`, attendances);

    const attendanceDate = new Date(date);

    const results = await saveAttendances(courseId, attendanceDate, attendances);

    console.log(`✅ Saved ${results.length} attendance records`);

    return {
      success: true,
      data: {
        saved: results.length,
        date: attendanceDate.toISOString(),
        records: results,
      }
    };

  } catch (error) {
    console.error('Error saving attendance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar asistencias'
    };
  }
}

/**
 * Obtiene las estadísticas de asistencia de un curso
 */
export async function getCourseAttendanceStats(
  courseId: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceResponse> {
  try {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const stats = await getAttendanceStats(courseId, start, end);

    return {
      success: true,
      data: stats
    };

  } catch (error) {
    console.error('Error getting attendance stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    };
  }
}

/**
 * Obtiene las fechas en las que se ha tomado asistencia
 */
export async function getCourseAttendanceDates(courseId: string): Promise<AttendanceResponse> {
  try {
    const dates = await getAttendanceDates(courseId);

    return {
      success: true,
      data: dates
    };

  } catch (error) {
    console.error('Error getting attendance dates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener fechas'
    };
  }
}

/**
 * Obtiene la asistencia de una fecha específica
 */
export async function getAttendanceByDate(
  courseId: string,
  date: string
): Promise<AttendanceResponse> {
  try {
    const attendanceDate = new Date(date);
    const attendances = await getAttendanceForDate(courseId, attendanceDate);

    return {
      success: true,
      data: {
        date: attendanceDate.toISOString(),
        attendances,
        summary: {
          total: attendances.length,
          present: attendances.filter(a => a.present).length,
          absent: attendances.filter(a => !a.present).length,
        }
      }
    };

  } catch (error) {
    console.error('Error getting attendance by date:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener asistencia'
    };
  }
}
