"use client";

import { CartProvider } from "@/lib/CartContext";

export default function CartProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
