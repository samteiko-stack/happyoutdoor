"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

async function fetchProfile(supabaseUser: User): Promise<AuthUser> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", supabaseUser.id)
    .single();

  if (profile) {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    };
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: supabaseUser.user_metadata?.name ?? null,
    role: "USER",
  };
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      setUser(await fetchProfile(authUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(await fetchProfile(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Drop-in replacement for useSession from next-auth */
export function useSession() {
  const { user, loading, refresh } = useAuth();
  return {
    data: user ? { user } : null,
    status: loading ? "loading" : user ? "authenticated" : "unauthenticated",
    update: refresh,
  };
}
