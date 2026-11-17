import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export individual methods for convenience
export const signIn = authClient.signIn;
export const useSession = authClient.useSession;

// Custom signOut that clears all localStorage
export const signOut = async () => {
  // Clear all localStorage to prevent data leak between users
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
  
  // Call the original signOut
  await authClient.signOut();
};
