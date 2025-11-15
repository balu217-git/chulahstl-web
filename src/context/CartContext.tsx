"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ----------------------------------------------------
 * CART ITEM
 * ---------------------------------------------------- */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/* ----------------------------------------------------
 * ADDRESS PLACE
 * ---------------------------------------------------- */
export interface AddressPlace {
  place_id?: string;
  name?: string;
  formatted_address: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  canDeliver?: boolean;
}

/* ----------------------------------------------------
 * DELIVERY NOTES & ORDER TYPE
 * ---------------------------------------------------- */
export interface DeliveryNotes {
  aptSuite?: string | null;
  instructions?: string | null;
}

export type OrderTypeTag = "ASAP" | "SCHEDULED";

export interface OrderMetadata {
  type: OrderTypeTag;
  aptSuite?: string | null;
  instructions?: string | null;
  address?: string | null;
  timeIso?: string | null;
  updatedAt?: string;
}

/* ----------------------------------------------------
 * CONTEXT TYPE
 * ---------------------------------------------------- */
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

  addressPlace: AddressPlace | null;
  setAddressPlace: (place: AddressPlace | null) => void;

  orderType: OrderTypeTag;
  setOrderType: (t: OrderTypeTag) => void;

  deliveryNotes: DeliveryNotes;
  setDeliveryNotes: (notes: DeliveryNotes) => void;

  orderMetadata: OrderMetadata | null;
  setOrderMetadata: (meta: OrderMetadata | null) => void;
}

/* ----------------------------------------------------
 * CREATE CONTEXT
 * ---------------------------------------------------- */
const CartContext = createContext<CartContextType | null>(null);

/* ----------------------------------------------------
 * PROVIDER
 * ---------------------------------------------------- */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<"pickup" | "delivery">("pickup");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [addressPlace, setAddressPlace] = useState<AddressPlace | null>(null);

  const [orderType, setOrderType] = useState<OrderTypeTag>("ASAP");

  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNotes>({
    aptSuite: null,
    instructions: null,
  });

  const [orderMetadata, setOrderMetadata] = useState<OrderMetadata | null>(null);

  /* ----------------------------------------------------
   * LOAD FROM STORAGE
   * ---------------------------------------------------- */
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

      const savedPlace = sessionStorage.getItem("deliveryAddressPlace");
      if (savedPlace) {
        const parsed = JSON.parse(savedPlace) as AddressPlace;
        if (parsed?.formatted_address) setAddressPlace(parsed);
      }

      const savedMeta = sessionStorage.getItem("orderMetadata");
      if (savedMeta) {
        const parsed = JSON.parse(savedMeta) as OrderMetadata;
        setOrderMetadata(parsed);
        if (parsed.type) setOrderType(parsed.type);
        setDeliveryNotes({
          aptSuite: parsed.aptSuite ?? null,
          instructions: parsed.instructions ?? null,
        });
      }
    } catch (err) {
      console.error("Error loading storage:", err);
    }
  }, []);

  /* ----------------------------------------------------
   * PERSIST TO STORAGE
   * ---------------------------------------------------- */
  // Cart
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  // Order Mode
  useEffect(() => {
    try {
      sessionStorage.setItem("orderMode", orderMode);
    } catch {
      /* ignore */
    }
    setOrderConfirmed(false);
  }, [orderMode]);

  // Address + Delivery Time
  useEffect(() => {
    try {
      if (address) sessionStorage.setItem("deliveryAddress", address);
      else sessionStorage.removeItem("deliveryAddress");

      if (deliveryTime) sessionStorage.setItem("deliveryTime", deliveryTime);
      else sessionStorage.removeItem("deliveryTime");
    } catch {
      /* ignore */
    }
  }, [address, deliveryTime]);

  // Address Place
  useEffect(() => {
    try {
      if (addressPlace) sessionStorage.setItem("deliveryAddressPlace", JSON.stringify(addressPlace));
      else sessionStorage.removeItem("deliveryAddressPlace");
    } catch {
      /* ignore */
    }
  }, [addressPlace]);

  // Delivery Notes: when deliveryNotes change, merge into orderMetadata (single source for storage)
  useEffect(() => {
    try {
      setOrderMetadata((prev) => {
        const merged: OrderMetadata = {
          ...(prev ?? { type: orderType }),
          type: prev?.type ?? orderType,
          aptSuite: deliveryNotes.aptSuite ?? null,
          instructions: deliveryNotes.instructions ?? null,
          address: prev?.address ?? (address || null),
          timeIso: prev?.timeIso ?? (deliveryTime || null),
          updatedAt: new Date().toISOString(),
        };
        // persist whole orderMetadata to sessionStorage
        sessionStorage.setItem("orderMetadata", JSON.stringify(merged));
        return merged;
      });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryNotes]);

  // Order Metadata: persist when it changes (keeps sessionStorage current)
  useEffect(() => {
    try {
      if (orderMetadata) sessionStorage.setItem("orderMetadata", JSON.stringify(orderMetadata));
      else sessionStorage.removeItem("orderMetadata");
    } catch {
      /* ignore */
    }
  }, [orderMetadata]);

  /* ----------------------------------------------------
   * CART OPERATIONS
   * ---------------------------------------------------- */
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

  /* ----------------------------------------------------
   * RETURN PROVIDER
   * ---------------------------------------------------- */
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

        addressPlace,
        setAddressPlace,

        orderType,
        setOrderType,

        deliveryNotes,
        setDeliveryNotes,

        orderMetadata,
        setOrderMetadata,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ----------------------------------------------------
 * HOOK
 * ---------------------------------------------------- */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
