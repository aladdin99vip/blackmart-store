"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";

export default function CartProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
