'use server'

import { getClassroomCourses, getCourseDetails, getCourseSubmissions } from "@/lib/classroom";

export async function fetchUserCourses() {
  try {
    const result = await getClassroomCourses();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in fetchUserCourses:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function fetchCourseDetails(courseId: string, userRole?: 'TEACHER' | 'STUDENT') {
  try {
    const result = await getCourseDetails(courseId, userRole);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in fetchCourseDetails:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function fetchCourseSubmissions(courseId: string) {
  try {
    const result = await getCourseSubmissions(courseId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in fetchCourseSubmissions:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
