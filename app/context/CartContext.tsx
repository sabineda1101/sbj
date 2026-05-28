"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Course {
  id: string;
  name: string;
  professor: string;
  schedule: string;
  credits: number;
  capacity: number;
  grading: string;
  price: number;
}

interface CartContextType {
  cart: Course[];
  addToCart: (course: Course) => boolean; // Returns true if added, false if already in cart
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem("cart");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (course: Course): boolean => {
    if (cart.some((item) => item.id === course.id)) {
      return false; // Already in cart
    }
    setCart((prev) => [...prev, course]);
    return true;
  };

  const removeFromCart = (courseId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (courseId: string): boolean => {
    return cart.some((item) => item.id === courseId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
