"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useCart } from "@/lib/CartContext";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.name && formData.address) {
      setStep("payment");
    }
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setTimeout(() => {
      setStep("success");
      clearCart();
    }, 2000);
  };

  const generatePaymentQR = () => {
    return `payment://${total.toFixed(2)}/${formData.email}`;
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
              Thank you for your purchase. A confirmation email has been sent to{" "}
              <strong>{formData.email}</strong>
            </p>
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
              {step === "form" ? (
                <div className="bg-gray-900/40 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Shipping Information
                  </h2>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-200 mb-2">
                        Address
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-white bg-gray-950 placeholder-emerald-300/40"
                        rows={3}
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
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-sm text-emerald-200 mt-4">
                          Scan this QR code with your payment app
                        </p>
                        <p className="text-sm text-emerald-200">
                          Amount: ${total.toFixed(2)}
                        </p>
                      </div>

                      {!paymentCompleted && (
                        <button
                          onClick={handlePaymentComplete}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          Confirm Payment
                        </button>
                      )}

                      {paymentCompleted && (
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
                    onClick={() => setStep("form")}
                    className="mt-4 w-full text-emerald-200 border border-emerald-500/30 py-3 rounded-lg font-semibold hover:bg-gray-800/50 transition-colors"
                  >
                    Back to Shipping
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
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-emerald-500/30 pt-4 space-y-2">
                  <div className="flex justify-between text-emerald-200/70">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-200/70">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-emerald-300 mt-4 pt-4 border-t border-emerald-500/30">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
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
