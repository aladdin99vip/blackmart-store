"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  products: Product[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            price: p.price,
            image: p.image || "",
            description: p.description || "",
          }));
          setProducts(formatted);
        } else {
          // No products in DB, seed with defaults
          await seedDefaultProducts();
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
      setMounted(true);
    };

    loadProducts();
  }, []);

  // Seed default products if none exist
  const seedDefaultProducts = async () => {
    const defaultProducts = [
      {
        name: "Wireless Headphones",
        price: 79.99,
        image: "/images/wireless-headphones.jpg",
        description: "High-quality wireless headphones with noise cancellation",
      },
      {
        name: "Smart Watch",
        price: 199.99,
        image: "/images/smart-watch.jpg",
        description: "Feature-rich smartwatch with heart rate monitor",
      },
      {
        name: "USB-C Cable",
        price: 12.99,
        image: "/images/usb-cable.jpg",
        description: "Durable 2-meter USB-C charging cable",
      },
      {
        name: "Phone Case",
        price: 24.99,
        image: "/images/phone-case.jpg",
        description: "Protective phone case with premium materials",
      },
      {
        name: "Screen Protector",
        price: 9.99,
        image: "/images/screen-protector.jpg",
        description: "Tempered glass screen protector - pack of 2",
      },
    ];

    try {
      const { data, error } = await supabase
        .from("products")
        .insert(defaultProducts)
        .select();

      if (error) throw error;

      if (data) {
        const formatted = data.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          price: p.price,
          image: p.image || "",
          description: p.description || "",
        }));
        setProducts(formatted);
      }
    } catch (error) {
      console.error("Error seeding products:", error);
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    if (mounted) {
      const saved = localStorage.getItem("cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    }
  }, [mounted]);

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, products, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
