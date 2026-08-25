"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAdmin, type AdminRole } from "@/lib/AdminContext";

interface AdminRow {
  id: string;
  name: string;
  role: AdminRole;
}

export default function ManageAdmins() {
  const { admin, loading, isSuper } = useAdmin();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "inventory" as AdminRole,
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && (!admin || !isSuper)) {
      router.replace("/admin");
    }
  }, [loading, admin, isSuper, router]);

  const loadAdmins = async () => {
    const { data } = await supabase.from("admins").select("id,name,role");
    if (data) setAdmins(data as AdminRow[]);
  };

  useEffect(() => {
    if (isSuper) loadAdmins();
  }, [isSuper]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!form.name || !form.email || !form.password) {
      setMsg("Fill in all fields.");
      return;
    }
    setBusy(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(json.error || "Failed to create admin.");
      return;
    }
    setMsg("Admin created successfully.");
    setForm({ name: "", email: "", password: "", role: "inventory" });
    loadAdmins();
  };

  if (loading || !isSuper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 flex items-center justify-center">
        <p className="text-emerald-200">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Manage Admins</h1>
          <Link href="/admin" className="text-emerald-200 hover:text-emerald-100 transition-colors">
            Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="border border-emerald-500/30 rounded-lg p-6 bg-gray-900/40 backdrop-blur">
            <h2 className="text-xl font-semibold text-white mb-6">Create Staff Admin</h2>
            {msg && (
              <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-100">
                {msg}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg text-white bg-gray-950 placeholder-emerald-300/40"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg text-white bg-gray-950 placeholder-emerald-300/40"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg text-white bg-gray-950 placeholder-emerald-300/40"
              />
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as AdminRole })
                }
                className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg text-white bg-gray-950"
              >
                <option value="inventory">Inventory (manage stock/products)</option>
                <option value="shipping">Shipping (manage orders)</option>
                <option value="super">Super Admin (full access)</option>
              </select>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {busy ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-6">
            Current Admins ({admins.length})
          </h2>
          <div className="space-y-3">
            {admins.map((a) => (
              <div
                key={a.id}
                className="border border-emerald-500/30 rounded-lg p-4 flex justify-between items-center bg-gray-900/40 backdrop-blur"
              >
                <div>
                  <p className="font-semibold text-white">{a.name}</p>
                  <p className="text-sm text-emerald-200/70 capitalize">{a.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
