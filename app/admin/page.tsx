"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/lib/AdminContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

export default function Admin() {
  const { admin, loading: adminLoading, isSuper, logout } = useAdmin();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Products are managed by super + inventory. Shipping admins get bounced to orders.
  const canManageProducts = admin && (admin.role === "super" || admin.role === "inventory");

  // Gate: must be logged in as an admin
  useEffect(() => {
    if (!adminLoading && !admin) {
      router.replace("/admin/login");
    } else if (!adminLoading && admin && admin.role === "shipping") {
      // Shipping staff don't manage products — send them to orders.
      router.replace("/admin/orders");
    }
  }, [adminLoading, admin, router]);

  useEffect(() => {
    if (canManageProducts) loadProducts();
  }, [canManageProducts]);

  if (adminLoading || !admin || !canManageProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 flex items-center justify-center">
        <p className="text-emerald-200">Loading...</p>
      </div>
    );
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted = data.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          price: p.price,
          image: p.image || "",
          description: p.description || "",
          stock: p.stock ?? 0,
        }));
        setProducts(formatted);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Error loading products");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.price || !formData.description || !formData.image || formData.stock === "") {
      alert("Please fill in all fields including image URL and stock");
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            image: formData.image,
            stock: parseInt(formData.stock),
          })
          .eq("id", parseInt(editingId));

        if (error) throw error;
      } else {
        // Add new product
        const { error } = await supabase
          .from("products")
          .insert([{
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            image: formData.image,
            stock: parseInt(formData.stock),
          }]);

        if (error) throw error;
      }

      // Reload products
      await loadProducts();
      setFormData({ name: "", price: "", description: "", image: "", stock: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    }

    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
      stock: product.stock.toString(),
    });
    setEditingId(product.id);
  };

  const handleCancel = () => {
    setFormData({ name: "", price: "", description: "", image: "", stock: "" });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", parseInt(id));

      if (error) throw error;

      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Store Admin</h1>
          <div className="flex gap-4 items-center">
            <span className="text-emerald-200/70 text-sm capitalize hidden sm:inline">
              {admin.name} ({admin.role})
            </span>
            {(admin.role === "super" || admin.role === "shipping") && (
              <Link href="/admin/orders" className="text-emerald-200 hover:text-emerald-100 text-sm transition-colors">
                Orders
              </Link>
            )}
            {isSuper && (
              <Link href="/admin/manage" className="text-emerald-200 hover:text-emerald-100 text-sm transition-colors">
                Manage Admins
              </Link>
            )}
            <button
              onClick={async () => {
                await logout();
                router.replace("/admin/login");
              }}
              className="text-emerald-200 hover:text-emerald-100 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="border border-emerald-500/30 rounded-lg p-6 sticky top-6 bg-gray-900/40 backdrop-blur">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-200 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="/images/filename.jpg"
                    className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40 text-sm"
                  />
                  <p className="text-xs text-emerald-300/60 mt-2">
                    Example: /images/laptop.jpg
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-200 mb-2">
                    Stock (units available)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full border border-emerald-500/30 text-emerald-200 py-2 rounded-lg font-semibold hover:bg-gray-800/50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-6">
              Products ({products.length})
            </h2>

            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-emerald-500/30 rounded-lg p-4 flex gap-4 bg-gray-900/40 backdrop-blur"
                >
                  <div className="w-24 h-24 bg-gray-950 rounded-lg flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-300/60 text-xs text-center px-2">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-emerald-100/70 mb-2">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-emerald-100/70 mb-2">{product.description}</p>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                        product.stock <= 0
                          ? "bg-red-900/50 text-red-200"
                          : product.stock <= 10
                          ? "bg-yellow-900/50 text-yellow-200"
                          : "bg-emerald-900/50 text-emerald-200"
                      }`}
                    >
                      {product.stock <= 0
                        ? "Out of stock"
                        : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      disabled={loading}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={loading}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
