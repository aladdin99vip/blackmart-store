"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      const initial: Product[] = [
        {
          id: "1",
          name: "Wireless Headphones",
          price: 79.99,
          image: "",
          description: "High-quality wireless headphones with noise cancellation",
        },
        {
          id: "2",
          name: "Smart Watch",
          price: 199.99,
          image: "",
          description: "Feature-rich smartwatch with heart rate monitor",
        },
        {
          id: "3",
          name: "USB-C Cable",
          price: 12.99,
          image: "",
          description: "Durable 2-meter USB-C charging cable",
        },
        {
          id: "4",
          name: "Phone Case",
          price: 24.99,
          image: "",
          description: "Protective phone case with premium materials",
        },
        {
          id: "5",
          name: "Screen Protector",
          price: 9.99,
          image: "",
          description: "Tempered glass screen protector - pack of 2",
        },
      ];
      setProducts(initial);
      localStorage.setItem("products", JSON.stringify(initial));
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.description) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      const updated = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name,
              price: parseFloat(formData.price),
              description: formData.description,
              image: formData.image || p.image,
            }
          : p
      );
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.image,
      };
      const updated = [...products, newProduct];
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    }

    setFormData({ name: "", price: "", description: "", image: "" });
    setImagePreview("");
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
    });
    setImagePreview(product.image);
    setEditingId(product.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", price: "", description: "", image: "" });
    setImagePreview("");
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Store Admin</h1>
          <Link href="/" className="text-emerald-200 hover:text-emerald-100 transition-colors">
            Back to Store
          </Link>
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
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-200"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    {editingId ? "Update Product" : "Add Product"}
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
                    <p className="text-sm text-emerald-200/70 mb-2">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-emerald-200/70">{product.description}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
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
