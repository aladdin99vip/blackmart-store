"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  register: (
    name: string,
    phone: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("customers")
      .select("id,name,phone")
      .eq("id", uid)
      .single();
    if (data) setProfile(data as CustomerProfile);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const register = async (
    name: string,
    phone: string,
    email: string,
    password: string
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    const uid = data.user?.id;
    if (!uid) return { error: "Registration failed. Please try again." };

    // Ensure we have a session for the RLS-protected insert.
    if (!data.session) {
      await supabase.auth.signInWithPassword({ email, password });
    }

    const { error: profileErr } = await supabase
      .from("customers")
      .insert([{ id: uid, name, phone }]);
    if (profileErr) return { error: profileErr.message };

    await loadProfile(uid);
    return { error: null };
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
