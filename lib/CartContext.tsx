"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 79.99,
    image: "/images/wireless-headphones.jpg",
    description: "High-quality wireless headphones with noise cancellation",
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 199.99,
    image: "/images/smart-watch.jpg",
    description: "Feature-rich smartwatch with heart rate monitor",
  },
  {
    id: "3",
    name: "USB-C Cable",
    price: 12.99,
    image: "/images/usb-cable.jpg",
    description: "Durable 2-meter USB-C charging cable",
  },
  {
    id: "4",
    name: "Phone Case",
    price: 24.99,
    image: "/images/phone-case.jpg",
    description: "Protective phone case with premium materials",
  },
  {
    id: "5",
    name: "Screen Protector",
    price: 9.99,
    image: "/images/screen-protector.jpg",
    description: "Tempered glass screen protector - pack of 2",
  },
];

const CartContext = createContext<CartContextType>({
  items: [],
  products: DEFAULT_PRODUCTS,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      }
    }
  }, []);

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
  return useContext(CartContext);
}
