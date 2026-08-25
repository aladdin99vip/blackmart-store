"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-emerald-500/30 rounded-lg p-8 bg-gray-900/40 backdrop-blur">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-emerald-200/70 mb-6 text-sm">
          Log in to your BlackMart account.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-emerald-200/70 text-sm mt-6 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-emerald-300 hover:text-emerald-100 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
