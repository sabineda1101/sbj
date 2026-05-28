"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Course } from "./CartContext";

export interface OrderGroup {
  id: string;
  items: Course[];
  totalCredits: number;
  totalPrice: number;
  orderDate: string;
  status: string;
}

interface OrderContextType {
  orders: OrderGroup[];
  addOrder: (items: Course[]) => void;
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("orders_v2");
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse orders");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("orders_v2", JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  const addOrder = (items: Course[]) => {
    const newOrder: OrderGroup = {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      items,
      totalCredits: items.reduce((sum, i) => sum + i.credits, 0),
      totalPrice: items.reduce((sum, i) => sum + i.price, 0),
      orderDate: new Date().toISOString(),
      status: "completed",
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const clearOrders = () => {
    setOrders([]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, clearOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
