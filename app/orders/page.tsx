"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  status: string;
  address: string;
  created_at: string;
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/register");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("id,items,total,status,address,created_at")
        .order("created_at", { ascending: false });
      if (data) setOrders(data as Order[]);
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 flex items-center justify-center">
        <p className="text-emerald-200">Loading...</p>
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === "new"
      ? "bg-blue-900/50 text-blue-200"
      : s === "shipped"
      ? "bg-yellow-900/50 text-yellow-200"
      : s === "delivered"
      ? "bg-emerald-900/50 text-emerald-200"
      : "bg-red-900/50 text-red-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <Link href="/" className="text-emerald-200 hover:text-emerald-100 transition-colors">
            Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <p className="text-emerald-200">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-emerald-200 mb-4">You have no orders yet.</p>
            <Link
              href="/"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 inline-block transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="border border-emerald-500/30 rounded-lg p-6 bg-gray-900/40 backdrop-blur"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-semibold">Order #{o.id}</p>
                    <p className="text-xs text-emerald-200/60">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>
                <div className="space-y-1 mb-4">
                  {o.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-emerald-200/70"
                    >
                      <span>
                        {it.name} x {it.quantity}
                      </span>
                      <span>RM {(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-emerald-500/30 pt-3">
                  <span className="text-emerald-200/70 text-sm">
                    Deliver to: {o.address}
                  </span>
                  <span className="text-emerald-300 font-bold">
                    RM {o.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
