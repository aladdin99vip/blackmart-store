"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

export const dynamic = "force-dynamic";

export default function Home() {
  const { addToCart, products } = useCart();
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  // Registration gate: unauthenticated visitors must register/login first.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/register");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 flex items-center justify-center">
        <p className="text-emerald-200">Loading...</p>
      </div>
    );
  }

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product, 1);
      setAddedProduct(productId);
      setTimeout(() => setAddedProduct(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      {/* Header */}
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Store</h1>
          <div className="flex gap-4 items-center">
            {profile && (
              <span className="text-emerald-200/80 text-sm hidden sm:inline">
                Hi, {profile.name}
              </span>
            )}
            <Link href="/orders" className="text-emerald-200 hover:text-emerald-100 text-sm transition-colors">
              My Orders
            </Link>
            <Link href="/admin/login" className="text-emerald-200/60 hover:text-emerald-100 text-sm transition-colors">
              Admin
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.replace("/register");
              }}
              className="text-emerald-200 hover:text-emerald-100 text-sm transition-colors"
            >
              Logout
            </button>
            <Link
              href="/cart"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-emerald-500/30 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-500/30 transition-all bg-gray-900/40 backdrop-blur"
            >
              <div className="w-full h-48 bg-gray-950 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-emerald-300/60 text-sm">No image</p>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-emerald-100/70 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-emerald-300">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      addedProduct === product.id
                        ? "bg-green-500 text-white"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {addedProduct === product.id ? "✓ Added" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
