import { signOut } from "next-auth/react";

/**
 * Handles user logout with proper cleanup of localStorage data
 * @param callbackUrl - Optional URL to redirect to after logout
 */
export const handleLogout = async (callbackUrl: string = "/") => {
  try {
    // Clear all localStorage data related to the application
    localStorage.removeItem('settings');
    localStorage.removeItem('selectedCourses');
    localStorage.removeItem('dashboardPreferences');
    
    // Clear any other app-specific localStorage items
    // You can add more items here as needed
    
    // Sign out using NextAuth
    await signOut({ callbackUrl });
  } catch (error) {
    console.error('Error during logout:', error);
    // Still attempt to sign out even if localStorage cleanup fails
    await signOut({ callbackUrl });
  }
};

/**
 * Clears all application-related localStorage data
 * Useful for cleanup without logging out
 */
export const clearAppStorage = () => {
  try {
    localStorage.removeItem('settings');
    localStorage.removeItem('selectedCourses');
    localStorage.removeItem('dashboardPreferences');
  } catch (error) {
    console.error('Error clearing app storage:', error);
  }
};
