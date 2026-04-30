"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";

interface AuthState {
  user:    User | null;
  loading: boolean;
  isAdmin: boolean;
}

/**
 * useAuth — subscribe to Supabase auth state in client components.
 * Provides the current user, loading state, and admin role check.
 *
 * Usage:
 *   const { user, loading, isAdmin } = useAuth();
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user:    null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setState({ user: null, loading: false, isAdmin: false });
        return;
      }
      const isAdmin = await checkAdminRole(supabase, session.user.id);
      setState({ user: session.user, loading: false, isAdmin });
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          setState({ user: null, loading: false, isAdmin: false });
          return;
        }
        const isAdmin = await checkAdminRole(supabase, session.user.id);
        setState({ user: session.user, loading: false, isAdmin });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

async function checkAdminRole(supabase: ReturnType<typeof createBrowserClient>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}
