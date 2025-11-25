// src/context/CartContext.tsx
// Uploaded image (reference): /mnt/data/2c4af857-55b0-4d30-8cef-2989854f992f.png

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ----------------------------------------------------
 * Types
 * ---------------------------------------------------- */
export interface ChoiceSelected {
  id: string;
  label: string;
  price: number;
}

export interface CartItem {
  id: string; // menu id (menu.post ID or similar)
  cartItemKey?: string; // computed unique key for this cart entry (id + sorted choices)
  name: string;
  price: number; // base price
  quantity: number;
  image?: string;
  choices?: ChoiceSelected[]; // selected add-ons / options
}

/* Address / Order types */
export interface AddressPlace {
  place_id?: string;
  name?: string;
  formatted_address: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  canDeliver?: boolean;
}

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
 * Context shape
 * ---------------------------------------------------- */
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "cartItemKey">) => void;
  updateQuantity: (idOrKey: string, quantity: number) => void;
  removeFromCart: (idOrKey: string) => void;
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
 * Create context
 * ---------------------------------------------------- */
const CartContext = createContext<CartContextType | null>(null);

/* ----------------------------------------------------
 * Provider
 * ---------------------------------------------------- */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<"pickup" | "delivery">("pickup");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [addressPlace, setAddressPlace] = useState<AddressPlace | null>(null);

  const [orderType, setOrderType] = useState<OrderTypeTag>("ASAP");
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNotes>({ aptSuite: null, instructions: null });
  const [orderMetadata, setOrderMetadata] = useState<OrderMetadata | null>(null);

  /* ----------------------------------------------------
   * Helper: compute stable key for (id + choices)
   * ---------------------------------------------------- */
  const computeKey = (id: string, choices?: ChoiceSelected[]) => {
    if (!choices || choices.length === 0) return id;
    // create a stable, deterministic key by sorting choice labels
    const sorted = [...choices].sort((a, b) => a.label.localeCompare(b.label));
    const parts = sorted.map((c) => `${c.label}:${Number(c.price || 0)}`);
    return `${id}|${parts.join("|")}`;
  };

  /* ----------------------------------------------------
   * Load from storage + migration for old saved cart items
   * ---------------------------------------------------- */
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem("cart");
      if (savedRaw) {
        // parse and migrate entries that lack cartItemKey
        let parsed: any = JSON.parse(savedRaw);
        if (!Array.isArray(parsed)) parsed = [];

        const migrated: CartItem[] = parsed.map((entry: any) => {
          // Defensive extraction with fallback types
          const id = entry.id ?? String(entry.menuId ?? "");
          const name = entry.name ?? entry.title ?? entry.menuTitle ?? "Item";
          const price = Number(entry.price ?? entry.menuPrice ?? 0) || 0;
          const quantity = Number(entry.quantity ?? 1) || 1;
          const image = entry.image ?? entry.menuImage ?? undefined;
          // choices may be stored in different shapes in older versions; try to normalize
          const rawChoices = entry.choices ?? entry.choiceOptions ?? entry.selectedOptions ?? [];
          const choices: ChoiceSelected[] = Array.isArray(rawChoices)
            ? rawChoices.map((c: any, idx: number) => {
                // If old shape had label & price, map them; otherwise try fallback
                const label = c.label ?? c.name ?? c.option ?? `Option ${idx + 1}`;
                const priceNum = Number(c.price ?? c.extraPrice ?? c.addonPrice ?? 0) || 0;
                const cid = c.id ?? `${id}-choice-${idx}`;
                return { id: cid, label, price: priceNum };
              })
            : [];

          // If the saved entry already has cartItemKey use it; otherwise compute one
          const cartItemKey = entry.cartItemKey ?? computeKey(id, choices);

          return {
            id,
            name,
            price,
            quantity,
            image,
            choices: choices.length > 0 ? choices : undefined,
            cartItemKey,
          } as CartItem;
        });

        setCart(migrated);
      }

      // load other sessionStorage fields similarly to previous implementation
      const savedMode = sessionStorage.getItem("orderMode") as "pickup" | "delivery" | null;
      if (savedMode) setOrderMode(savedMode);

      const savedAddress = sessionStorage.getItem("deliveryAddress");
      const savedTime = sessionStorage.getItem("deliveryTime");
      if (savedAddress) setAddress(savedAddress);
      if (savedTime) setDeliveryTime(savedTime);

      const savedPlace = sessionStorage.getItem("deliveryAddressPlace");
      if (savedPlace) {
        const parsedPlace = JSON.parse(savedPlace) as AddressPlace;
        if (parsedPlace?.formatted_address) setAddressPlace(parsedPlace);
      }

      const savedMeta = sessionStorage.getItem("orderMetadata");
      if (savedMeta) {
        const parsedMeta = JSON.parse(savedMeta) as OrderMetadata;
        setOrderMetadata(parsedMeta);
        if (parsedMeta.type) setOrderType(parsedMeta.type);
        setDeliveryNotes({
          aptSuite: parsedMeta.aptSuite ?? null,
          instructions: parsedMeta.instructions ?? null,
        });
      }
    } catch (err) {
      // if JSON.parse fails or any migration error occurs, fall back to an empty cart but log the error
      // eslint-disable-next-line no-console
      console.error("Error loading/migrating cart from storage:", err);
    }
  }, []); // run once on mount

  /* ----------------------------------------------------
   * Persist to storage (cart, order metadata, etc.)
   * ---------------------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {
      /* ignore storage errors */
    }
  }, [cart]);

  useEffect(() => {
    try {
      sessionStorage.setItem("orderMode", orderMode);
    } catch {}
    setOrderConfirmed(false);
  }, [orderMode]);

  useEffect(() => {
    try {
      if (address) sessionStorage.setItem("deliveryAddress", address);
      else sessionStorage.removeItem("deliveryAddress");

      if (deliveryTime) sessionStorage.setItem("deliveryTime", deliveryTime);
      else sessionStorage.removeItem("deliveryTime");
    } catch {}
  }, [address, deliveryTime]);

  useEffect(() => {
    try {
      if (addressPlace) sessionStorage.setItem("deliveryAddressPlace", JSON.stringify(addressPlace));
      else sessionStorage.removeItem("deliveryAddressPlace");
    } catch {}
  }, [addressPlace]);

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
        sessionStorage.setItem("orderMetadata", JSON.stringify(merged));
        return merged;
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryNotes]);

  useEffect(() => {
    try {
      if (orderMetadata) sessionStorage.setItem("orderMetadata", JSON.stringify(orderMetadata));
      else sessionStorage.removeItem("orderMetadata");
    } catch {}
  }, [orderMetadata]);

  /* ----------------------------------------------------
   * CART OPERATIONS
   * ---------------------------------------------------- */
  const addToCart = (item: Omit<CartItem, "cartItemKey">) => {
    setCart((prev) => {
      const key = computeKey(item.id, item.choices);
      const existingIndex = prev.findIndex((i) => i.cartItemKey === key);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], quantity: copy[existingIndex].quantity + item.quantity };
        return copy;
      }
      const newItem: CartItem = { ...item, cartItemKey: key };
      return [...prev, newItem];
    });
  };

  // updateQuantity: prefer cartItemKey match, fallback to first id match
  const updateQuantity = (idOrKey: string, quantity: number) => {
    setCart((prev) => {
      if (prev.some((i) => i.cartItemKey === idOrKey)) {
        return prev.map((item) => (item.cartItemKey === idOrKey ? { ...item, quantity } : item));
      }
      let done = false;
      return prev.map((item) => {
        if (!done && item.id === idOrKey) {
          done = true;
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  // removeFromCart: prefer cartItemKey, fallback to first id match
  const removeFromCart = (idOrKey: string) => {
    setCart((prev) => {
      if (prev.some((i) => i.cartItemKey === idOrKey)) {
        return prev.filter((i) => i.cartItemKey !== idOrKey);
      }
      const idx = prev.findIndex((i) => i.id === idOrKey);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () =>
    cart.reduce((total, item) => {
      const choicesTotal = (item.choices || []).reduce((s, c) => s + (Number(c.price) || 0), 0);
      return total + (Number(item.price) + choicesTotal) * item.quantity;
    }, 0);

  /* ----------------------------------------------------
   * Provider return
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
 * Hook
 * ---------------------------------------------------- */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
