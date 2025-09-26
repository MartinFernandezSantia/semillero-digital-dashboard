'use server';

import { prisma } from '@/lib/prisma';
import { classroom_v1 } from 'googleapis';

export interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  date: Date;
  present: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
  };
}

/**
 * Crea o actualiza un usuario en la base de datos basado en datos de Google Classroom
 */
export async function upsertUser(student: classroom_v1.Schema$Student) {
  if (!student.userId || !student.profile?.emailAddress || !student.profile?.name?.fullName) {
    throw new Error('Datos de estudiante incompletos');
  }

  const user = await prisma.user.upsert({
    where: { googleId: student.userId },
    update: {
      name: student.profile.name.fullName,
      email: student.profile.emailAddress,
      photoUrl: student.profile.photoUrl || null,
    },
    create: {
      googleId: student.userId,
      name: student.profile.name.fullName,
      email: student.profile.emailAddress,
      photoUrl: student.profile.photoUrl || null,
    },
    select: {
      id: true,
      googleId: true,
      name: true,
      email: true,
      photoUrl: true,
    },
  });

  return user;
}

/**
 * Obtiene o crea usuarios para todos los estudiantes de un curso
 */
export async function ensureUsersExist(students: classroom_v1.Schema$Student[]) {
  const users = [];

  for (const student of students) {
    try {
      const user = await upsertUser(student);
      users.push(user);
    } catch (error) {
      console.error(`Error creating user for student ${student.userId}:`, error);
    }
  }

  return users;
}

/**
 * Obtiene las asistencias de un curso para una fecha específica
 */
export async function getAttendanceForDate(courseId: string, date: Date): Promise<AttendanceRecord[]> {
  // Normalizar la fecha para que sea solo fecha (sin hora)
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const attendances = await prisma.attendance.findMany({
    where: {
      courseId,
      date: normalizedDate,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photoUrl: true,
        },
      },
    },
  });

  return attendances;
}

/**
 * Guarda o actualiza las asistencias de múltiples estudiantes
 */
export async function saveAttendances(
  courseId: string,
  date: Date,
  attendances: { userId: string; present: boolean }[]
) {
  // Normalizar la fecha
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const results = [];

  for (const attendance of attendances) {
    const result = await prisma.attendance.upsert({
      where: {
        userId_courseId_date: {
          userId: attendance.userId,
          courseId,
          date: normalizedDate,
        },
      },
      update: {
        present: attendance.present,
      },
      create: {
        userId: attendance.userId,
        courseId,
        date: normalizedDate,
        present: attendance.present,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
      },
    });

    results.push(result);
  }

  return results;
}

/**
 * Obtiene estadísticas de asistencia de un curso
 */
export async function getAttendanceStats(courseId: string, startDate?: Date, endDate?: Date) {
  const whereClause: any = { courseId };

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = startDate;
    if (endDate) whereClause.date.lte = endDate;
  }

  const attendances = await prisma.attendance.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Calcular estadísticas
  const totalRecords = attendances.length;
  const presentCount = attendances.filter(a => a.present).length;
  const absentCount = totalRecords - presentCount;
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  // Estadísticas por estudiante
  const studentStats = attendances.reduce((acc, attendance) => {
    const userId = attendance.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: attendance.user,
        total: 0,
        present: 0,
        absent: 0,
        rate: 0,
      };
    }

    acc[userId].total++;
    if (attendance.present) {
      acc[userId].present++;
    } else {
      acc[userId].absent++;
    }
    acc[userId].rate = (acc[userId].present / acc[userId].total) * 100;

    return acc;
  }, {} as Record<string, any>);

  return {
    overall: {
      totalRecords,
      presentCount,
      absentCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    },
    byStudent: Object.values(studentStats),
  };
}

/**
 * Obtiene las fechas en las que se ha tomado asistencia para un curso
 */
export async function getAttendanceDates(courseId: string) {
  const dates = await prisma.attendance.findMany({
    where: { courseId },
    select: { date: true },
    distinct: ['date'],
    orderBy: { date: 'desc' },
  });

  return dates.map(d => d.date);
}
