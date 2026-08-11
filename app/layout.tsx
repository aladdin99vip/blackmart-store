import type { Metadata } from "next";
import CartProviderWrapper from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Store",
  description: "Online store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 via-gray-800 to-emerald-700 text-white min-h-screen">
        <CartProviderWrapper>{children}</CartProviderWrapper>
      </body>
    </html>
  );
}
