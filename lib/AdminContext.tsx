"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { supabaseAdminAuth as supabase } from "./supabaseAdminClient";
import type { Session } from "@supabase/supabase-js";

export type AdminRole = "super" | "inventory" | "shipping";

interface AdminProfile {
  id: string;
  name: string;
  role: AdminRole;
}

interface AdminContextType {
  session: Session | null;
  admin: AdminProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isSuper: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = async (uid: string) => {
    const { data } = await supabase
      .from("admins")
      .select("id,name,role")
      .eq("id", uid)
      .single();
    setAdmin((data as AdminProfile) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        await loadAdmin(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        loadAdmin(s.user.id);
      } else {
        setAdmin(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    if (data.user) {
      await loadAdmin(data.user.id);
      // Verify this user is actually an admin
      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .single();
      if (!adminRow) {
        await supabase.auth.signOut();
        return { error: "This account is not an admin." };
      }
    }
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminContext.Provider
      value={{
        session,
        admin,
        loading,
        login,
        logout,
        isSuper: admin?.role === "super",
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
