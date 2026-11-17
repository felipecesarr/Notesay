"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@/features/auth/presentation/auth-client";

type AuthContextType = {
  session: Record<string, unknown> | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch session on mount
    const fetchSession = async () => {
      try {
        const currentSession = await authClient.getSession();
        setSession(currentSession.data);
      } catch (error) {
        console.error("Failed to fetch session:");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
