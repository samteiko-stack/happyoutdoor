"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth-types";
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

function userFromMetadata(user: User): AuthUser | null {
  const role = user.user_metadata?.role;
  if (typeof role !== "string" || !role.trim()) return null;

  const name = user.user_metadata?.name;
  return {
    id: user.id,
    email: user.email ?? "",
    name: typeof name === "string" ? name : null,
    role: role.toUpperCase(),
  };
}

async function fetchProfileFromApi(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/profile", { credentials: "include" });
    if (!res.ok) return null;
    const { user } = await res.json();
    return user;
  } catch {
    return null;
  }
}

async function fetchProfile(supabaseUser: User, forceApi = false): Promise<AuthUser> {
  if (!forceApi) {
    const fromMetadata = userFromMetadata(supabaseUser);
    if (fromMetadata) return fromMetadata;
  }

  const fromApi = await fetchProfileFromApi();
  if (fromApi) return fromApi;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: (supabaseUser.user_metadata?.name as string | undefined) ?? null,
    role: "USER",
  };
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setUser(null);
        return;
      }

      setUser(await fetchProfile(session.user, true));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      try {
        if (error || !session?.user) {
          setUser(null);
          return;
        }
        setUser(await fetchProfile(session.user, true));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          setUser(await fetchProfile(session.user, true));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
