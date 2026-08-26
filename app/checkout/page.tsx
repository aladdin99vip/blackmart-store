"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Must be logged in to check out
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/register");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 flex items-center justify-center">
        <p className="text-emerald-200">Loading...</p>
      </div>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
        <header className="border-b border-emerald-500/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Store</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-emerald-200 mb-4">Your cart is empty</p>
          <Link
            href="/"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 inline-block transition-colors"
          >
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      setStep("payment");
    }
  };

  const handlePaymentComplete = async () => {
    setPaymentCompleted(true);
    setSaving(true);
    setError("");

    // 1. Decrement stock atomically for each item
    for (const item of items) {
      const { data, error: decErr } = await supabase.rpc("decrement_stock", {
        p_id: parseInt(item.id),
        p_qty: item.quantity,
      });
      if (decErr || data === -1) {
        setError(
          `Not enough stock for ${item.name}. Please adjust your cart.`
        );
        setSaving(false);
        setPaymentCompleted(false);
        return;
      }
    }

    // 2. Save the order with full customer + delivery info
    const { error: orderErr } = await supabase.from("orders").insert([
      {
        customer_id: user.id,
        customer_name: profile?.name || "",
        customer_phone: profile?.phone || "",
        address: address.trim(),
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total,
      },
    ]);

    if (orderErr) {
      setError("Failed to save order: " + orderErr.message);
      setSaving(false);
      setPaymentCompleted(false);
      return;
    }

    setSaving(false);
    setStep("success");
    clearCart();
  };

  const generatePaymentQR = () => {
    return `payment://${total.toFixed(2)}/${profile?.phone || user.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700">
      <header className="border-b border-emerald-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Store</h1>
          <Link href="/" className="text-emerald-200 hover:text-emerald-100 transition-colors">
            Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === "success" ? (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-emerald-200 mb-8">
              Thank you, {profile?.name}. Your order is confirmed and will be
              delivered to your address.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/orders"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 inline-block transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="border border-emerald-500/30 text-emerald-200 px-6 py-2 rounded-lg hover:bg-gray-800/50 inline-block transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}
              {step === "address" ? (
                <div className="bg-gray-900/40 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Delivery Address
                  </h2>
                  <p className="text-emerald-200/70 text-sm mb-6">
                    Ordering as <strong>{profile?.name}</strong> ·{" "}
                    {profile?.phone}
                  </p>
                  <form onSubmit={handleAddressSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Full Delivery Address
                      </label>
                      <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, unit, city, postcode, state"
                        className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                        rows={4}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Payment Method
                  </h2>

                  <div className="space-y-4 mb-8">
                    <label className="flex items-center p-4 border border-emerald-500/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors bg-gray-900/40 backdrop-blur">
                      <input
                        type="radio"
                        checked={paymentMethod === "qr"}
                        onChange={() => setPaymentMethod("qr")}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-medium text-white">
                        QR Code Payment
                      </span>
                    </label>
                    <label className="flex items-center p-4 border border-emerald-500/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors bg-gray-900/40 backdrop-blur">
                      <input
                        type="radio"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-medium text-white">
                        Card Payment (Coming Soon)
                      </span>
                    </label>
                  </div>

                  {paymentMethod === "qr" && (
                    <div className="border border-emerald-500/30 rounded-lg p-8 bg-gray-900/40 backdrop-blur">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Scan to Pay
                        </h3>
                        <div className="flex justify-center bg-gray-950 p-6 rounded-lg">
                          <QRCodeCanvas
                            value={generatePaymentQR()}
                            size={256}
                            level="H"
                          />
                        </div>
                        <p className="text-sm text-emerald-200 mt-4">
                          Scan this QR code with your payment app
                        </p>
                        <p className="text-sm text-emerald-200">
                          Amount: RM {total.toFixed(2)}
                        </p>
                      </div>

                      {!paymentCompleted && (
                        <button
                          onClick={handlePaymentComplete}
                          disabled={saving}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Placing order..." : "Confirm Payment"}
                        </button>
                      )}

                      {paymentCompleted && !error && (
                        <div className="text-center py-4">
                          <p className="text-green-400 font-semibold mb-2">
                            ✓ Payment Confirmed
                          </p>
                          <p className="text-sm text-emerald-200">
                            Processing your order...
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="border border-emerald-500/30 rounded-lg p-8 text-center text-emerald-200 bg-gray-900/40 backdrop-blur">
                      Card payment integration coming soon
                    </div>
                  )}

                  <button
                    onClick={() => setStep("address")}
                    className="mt-4 w-full text-emerald-200 border border-emerald-500/30 py-3 rounded-lg font-semibold hover:bg-gray-800/50 transition-colors"
                  >
                    Back to Address
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="border border-emerald-500/30 rounded-lg p-6 sticky top-6 bg-gray-900/40 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-emerald-200/70"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>RM {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-emerald-500/30 pt-4 space-y-2">
                  <div className="flex justify-between text-emerald-200/70">
                    <span>Subtotal</span>
                    <span>RM {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200/70">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-emerald-300 mt-4 pt-4 border-t border-emerald-500/30">
                    <span>Total</span>
                    <span>RM {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
