import { classroom_v1 } from 'googleapis';
import { SubmissionStatus, StudentSubmissionData, AssignmentData } from '@/components/ui/submissions-table';

export interface SubmissionStats {
  onTime: number;
  late: number;
  resubmitted: number;
  notSubmitted: number;
  total: number;
}

/**
 * Convierte una fecha de Google Classroom a Date object
 */
function parseGoogleClassroomDate(
  dueDate?: classroom_v1.Schema$Date | null,
  dueTime?: classroom_v1.Schema$TimeOfDay | null
): Date | null {
  if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) {
    return null;
  }

  // Google Classroom months are 1-based, JavaScript months are 0-based
  const date = new Date(
    dueDate.year,
    dueDate.month - 1,
    dueDate.day
  );

  // Si hay hora específica, agregarla
  if (dueTime) {
    date.setHours(dueTime.hours || 23, dueTime.minutes || 59, dueTime.seconds || 59);
  } else {
    // Si no hay hora específica, usar 23:59:59 del día
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

/**
 * Determina el estado de una entrega basándose en los datos de Google Classroom
 */
export function getSubmissionStatus(
  submission: classroom_v1.Schema$StudentSubmission | undefined,
  coursework: classroom_v1.Schema$CourseWork | undefined
): SubmissionStatus {
  if (!submission) {
    return 'NOT_SUBMITTED';
  }

  const state = submission.state;
  const submissionHistory = submission.submissionHistory || [];

  // Si no hay historial de entrega, verificar el estado
  if (submissionHistory.length === 0) {
    if (state === 'CREATED' || state === 'NEW') {
      return 'NOT_SUBMITTED';
    }
    return 'PENDING';
  }

  // Buscar la primera entrega (turn-in)
  const firstTurnIn = submissionHistory.find(
    history => history.stateHistory?.state === 'TURNED_IN'
  );

  if (!firstTurnIn || !firstTurnIn.stateHistory?.stateTimestamp) {
    return 'NOT_SUBMITTED';
  }

  const submissionDate = new Date(firstTurnIn.stateHistory.stateTimestamp);
  
  // Verificar si hay múltiples entregas (reentrega)
  const turnInCount = submissionHistory.filter(
    history => history.stateHistory?.state === 'TURNED_IN'
  ).length;

  if (turnInCount > 1) {
    return 'RESUBMITTED';
  }

  // Si no hay fecha de vencimiento, considerar como a tiempo
  if (!coursework?.dueDate) {
    return 'ON_TIME';
  }

  const dueDate = parseGoogleClassroomDate(coursework.dueDate, coursework.dueTime);
  
  if (!dueDate) {
    return 'ON_TIME';
  }

  // Comparar con la fecha de vencimiento
  if (submissionDate <= dueDate) {
    return 'ON_TIME';
  } else {
    return 'LATE';
  }
}

/**
 * Procesa los datos de Google Classroom para crear la estructura de datos de la tabla
 */
export function processSubmissionData(
  students: classroom_v1.Schema$Student[],
  coursework: classroom_v1.Schema$CourseWork[],
  submissions: classroom_v1.Schema$StudentSubmission[]
): {
  studentsData: StudentSubmissionData[];
  assignmentsData: AssignmentData[];
  stats: SubmissionStats;
} {
  // Crear mapa de entregas por estudiante y tarea
  const submissionMap = new Map<string, classroom_v1.Schema$StudentSubmission>();
  submissions.forEach(submission => {
    if (submission.userId && submission.courseWorkId) {
      const key = `${submission.userId}-${submission.courseWorkId}`;
      submissionMap.set(key, submission);
    }
  });

  // Procesar datos de estudiantes
  const studentsData: StudentSubmissionData[] = students.map(student => {
    const studentSubmissions: StudentSubmissionData['submissions'] = {};
    
    coursework.forEach(work => {
      if (work.id && student.userId) {
        const key = `${student.userId}-${work.id}`;
        const submission = submissionMap.get(key);
        const status = getSubmissionStatus(submission, work);
        
        // Formatear fecha de vencimiento
        const dueDate = parseGoogleClassroomDate(work.dueDate, work.dueTime);
        const dueDateString = dueDate ? dueDate.toISOString() : undefined;
        
        studentSubmissions[work.id] = {
          status,
          submittedAt: submission?.submissionHistory?.find(
            h => h.stateHistory?.state === 'TURNED_IN'
          )?.stateHistory?.stateTimestamp || undefined,
          dueDate: dueDateString,
          grade: submission?.assignedGrade || undefined,
          maxPoints: work.maxPoints || undefined
        };
      }
    });

    return {
      studentId: student.userId || '',
      studentName: student.profile?.name?.fullName || 'Estudiante sin nombre',
      studentEmail: student.profile?.emailAddress || '',
      submissions: studentSubmissions
    };
  });

  // Procesar datos de asignaciones
  const assignmentsData: AssignmentData[] = coursework.map(work => {
    const dueDate = parseGoogleClassroomDate(work.dueDate, work.dueTime);
    return {
      id: work.id || '',
      title: work.title || 'Tarea sin título',
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      maxPoints: work.maxPoints || undefined
    };
  });

  // Calcular estadísticas
  let onTime = 0, late = 0, resubmitted = 0, notSubmitted = 0;
  const total = studentsData.length * assignmentsData.length;

  studentsData.forEach(student => {
    Object.values(student.submissions).forEach(submission => {
      switch (submission.status) {
        case 'ON_TIME': onTime++; break;
        case 'LATE': late++; break;
        case 'RESUBMITTED': resubmitted++; break;
        case 'NOT_SUBMITTED': notSubmitted++; break;
      }
    });
  });

  const stats: SubmissionStats = {
    onTime,
    late,
    resubmitted,
    notSubmitted,
    total
  };

  return {
    studentsData,
    assignmentsData,
    stats
  };
}

/**
 * Calcula estadísticas de entregas para un curso específico
 */
export function calculateCourseStats(
  students: classroom_v1.Schema$Student[],
  coursework: classroom_v1.Schema$CourseWork[],
  submissions: classroom_v1.Schema$StudentSubmission[]
): SubmissionStats {
  const { stats } = processSubmissionData(students, coursework, submissions);
  return stats;
}

/**
 * Formatea una fecha para mostrar en la interfaz
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Sin fecha';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Sin fecha';
    }
    
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Sin fecha';
  }
}

/**
 * Formatea una fecha de Google Classroom directamente
 */
export function formatGoogleClassroomDate(
  dueDate?: classroom_v1.Schema$Date | null,
  dueTime?: classroom_v1.Schema$TimeOfDay | null
): string {
  const date = parseGoogleClassroomDate(dueDate, dueTime);
  if (!date) return 'Sin fecha';
  
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtiene el color del estado para usar en la UI
 */
export function getStatusColor(status: SubmissionStatus): string {
  const colors = {
    ON_TIME: 'bg-green-500',
    LATE: 'bg-yellow-500',
    RESUBMITTED: 'bg-blue-500',
    NOT_SUBMITTED: 'bg-red-500',
    PENDING: 'bg-gray-500'
  };
  
  return colors[status];
}

/**
 * Obtiene el emoji del estado
 */
export function getStatusEmoji(status: SubmissionStatus): string {
  const emojis = {
    ON_TIME: '🟢',
    LATE: '🟡',
    RESUBMITTED: '🔵',
    NOT_SUBMITTED: '🔴',
    PENDING: '⚪'
  };
  
  return emojis[status];
}
