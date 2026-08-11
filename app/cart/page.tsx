"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Store</h1>
          <Link href="/" className="text-emerald-200 hover:text-emerald-100 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Shopping Cart</h2>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-emerald-200 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 inline-block transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-emerald-500/30 rounded-lg p-4 flex gap-4 bg-gray-900/40 backdrop-blur"
                  >
                    <div className="w-24 h-24 bg-gray-950 rounded-lg flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-300/60 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">
                        {item.name}
                      </h3>
                      <p className="text-emerald-200/70 text-sm mb-4">
                        ${item.price.toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 border border-emerald-500/50 rounded-lg hover:bg-emerald-700/30 flex items-center justify-center text-emerald-200"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-white">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 border border-emerald-500/50 rounded-lg hover:bg-emerald-700/30 flex items-center justify-center text-emerald-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-300">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-emerald-500/30 rounded-lg p-6 sticky top-6 bg-gray-900/40 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-emerald-200/70">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200/70">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-emerald-500/30 pt-4 flex justify-between text-lg font-bold text-emerald-300">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 text-center block transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
