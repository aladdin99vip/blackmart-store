"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/lib/AdminContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

const STATUSES = ["new", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { admin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Only super or shipping admins may view orders
  const canView = admin && (admin.role === "super" || admin.role === "shipping");

  useEffect(() => {
    if (!adminLoading && !admin) {
      router.replace("/admin/login");
    } else if (!adminLoading && admin && !canView) {
      router.replace("/admin");
    }
  }, [adminLoading, admin, canView, router]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(
        "id,customer_name,customer_phone,address,items,total,status,created_at"
      )
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    if (canView) loadOrders();
  }, [canView]);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) {
      alert("Failed to update status: " + error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  if (adminLoading || !admin || !canView) {
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

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <Link href="/admin" className="text-emerald-200 hover:text-emerald-100 transition-colors">
            Back to Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                filter === s
                  ? "bg-emerald-600 text-white"
                  : "border border-emerald-500/30 text-emerald-200 hover:bg-gray-800/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-emerald-200">Loading orders...</p>
        ) : shown.length === 0 ? (
          <p className="text-emerald-200">No orders in this view.</p>
        ) : (
          <div className="space-y-4">
            {shown.map((o) => (
              <div
                key={o.id}
                className="border border-emerald-500/30 rounded-lg p-6 bg-gray-900/40 backdrop-blur"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">
                      Order #{o.id}
                    </p>
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

                {/* Courier details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-emerald-200/50">Customer:</span>{" "}
                    <span className="text-white">{o.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200/50">Phone:</span>{" "}
                    <span className="text-white">{o.customer_phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-emerald-200/50">Deliver to:</span>{" "}
                    <span className="text-white">{o.address}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4 border-t border-emerald-500/20 pt-3">
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

                <div className="flex justify-between items-center border-t border-emerald-500/30 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-200/50 text-sm">Status:</span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="px-3 py-1 border border-emerald-500/30 rounded-lg text-white bg-gray-950 text-sm capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-emerald-300 font-bold text-lg">
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
