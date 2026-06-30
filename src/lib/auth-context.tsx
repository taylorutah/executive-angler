"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email?: string;
  avatarUrl?: string;
  displayName?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", authUser.id)
      .maybeSingle();

    setUser({
      id: authUser.id,
      email: authUser.email ?? undefined,
      avatarUrl: profile?.avatar_url || undefined,
      displayName: profile?.display_name || authUser.user_metadata?.display_name || undefined,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUserProfile();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchUserProfile();
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
