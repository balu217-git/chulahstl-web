"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;

  orderMode: "pickup" | "delivery";
  setOrderMode: (mode: "pickup" | "delivery") => void;
  orderConfirmed: boolean;
  setOrderConfirmed: (val: boolean) => void;

  address: string;
  setAddress: (address: string) => void;
  deliveryTime: string;
  setDeliveryTime: (time: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<"pickup" | "delivery">("pickup");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  // Load from storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedMode = sessionStorage.getItem("orderMode") as "pickup" | "delivery" | null;
      if (savedMode) setOrderMode(savedMode);

      const savedAddress = sessionStorage.getItem("deliveryAddress");
      const savedTime = sessionStorage.getItem("deliveryTime");
      if (savedAddress) setAddress(savedAddress);
      if (savedTime) setDeliveryTime(savedTime);
    } catch (err) {
      console.error("Error loading storage:", err);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Save orderMode and reset confirmation whenever mode changes
  useEffect(() => {
    if (orderMode) {
      sessionStorage.setItem("orderMode", orderMode);
      setOrderConfirmed(false); // ✅ reset confirmation on mode change
    }
  }, [orderMode]);

  // Save address & deliveryTime
  useEffect(() => {
    if (address) sessionStorage.setItem("deliveryAddress", address);
    if (deliveryTime) sessionStorage.setItem("deliveryTime", deliveryTime);
  }, [address, deliveryTime]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        orderMode,
        setOrderMode,
        orderConfirmed,
        setOrderConfirmed,
        address,
        setAddress,
        deliveryTime,
        setDeliveryTime,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
