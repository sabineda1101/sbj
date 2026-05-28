"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "../utils/supabase";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSupabase: boolean;
  signOut: () => Promise<void>;
  signInMock: (mockUser: UserProfile) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean | null>(null);

  // 1. Verify reachability of Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsSupabaseOnline(false);
      setIsLoading(false);
      return;
    }

    const checkReachability = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // We use mode: "no-cors" to avoid CORS errors when checking domain reachability
        await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL!, {
          method: "GET",
          mode: "no-cors",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        setIsSupabaseOnline(true);
      } catch (err) {
        console.warn("Supabase is unreachable (paused, offline, or invalid URL). Falling back to Mock Mode.");
        setIsSupabaseOnline(false);
      }
    };

    checkReachability();
  }, []);

  // 2. Sync Supabase session & handle real-time auth changes or fallback to Mock Mode
  useEffect(() => {
    if (isSupabaseOnline === null) return; // Wait until reachability is determined

    const client = isSupabaseOnline ? getSupabase() : null;

    if (client) {

      const checkSession = async () => {
        setIsLoading(true);
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            const profile: UserProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "구글 사용자",
              email: session.user.email || "",
              avatar: session.user.user_metadata?.avatar_url || "/Mascot.png",
            };
            setUser(profile);
            localStorage.setItem("user", JSON.stringify(profile));
          } else {
            setUser(null);
            localStorage.removeItem("user");
          }
        } catch (e) {
          console.error("Error checking session:", e);
        } finally {
          setIsLoading(false);
        }
      };

      checkSession();

      const { data: { subscription } } = client.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const profile: UserProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "구글 사용자",
              email: session.user.email || "",
              avatar: session.user.user_metadata?.avatar_url || "/Mascot.png",
            };
            setUser(profile);
            localStorage.setItem("user", JSON.stringify(profile));
          } else {
            setUser(null);
            localStorage.removeItem("user");
          }
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock mode fallback: Load from localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    }
  }, [isSupabaseOnline]);

  // Handle window focus for mock mode synchronizations
  useEffect(() => {
    const handleFocusSync = () => {
      if (isSupabaseOnline === false) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {}
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("focus", handleFocusSync);
    return () => window.removeEventListener("focus", handleFocusSync);
  }, [isSupabaseOnline]);

  const refreshSession = async () => {
    const client = isSupabaseOnline ? getSupabase() : null;
    if (client) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "구글 사용자",
            email: session.user.email || "",
            avatar: session.user.user_metadata?.avatar_url || "/Mascot.png",
          };
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (e) {
        console.error("Error refreshing session:", e);
      }
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }
  };

  const signOut = async () => {
    const client = isSupabaseOnline ? getSupabase() : null;
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error("Error during Supabase signout:", e);
      }
    }
    localStorage.removeItem("user");
    setUser(null);
  };

  const signInMock = (mockUser: UserProfile) => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabase: !!isSupabaseOnline,
        signOut,
        signInMock,
        refreshSession,
      }}
    >
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
