"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ----------------------------------------------------
 * Types
 * ---------------------------------------------------- */
export type ChoiceKind = "choice" | "addon";

export interface ChoiceSelected {
  id: string;
  label: string;
  price: number;
  kind?: ChoiceKind;
}

export interface CartItem {
  id: string; // menu id
  cartItemKey?: string; // computed unique key for this cart entry (id + sorted choices + addons)
  name: string;
  price: number; // base price
  quantity: number;
  image?: string;
  choices?: ChoiceSelected[]; // selected options
  addons?: ChoiceSelected[]; // selected add-ons (separate)
  available?: boolean; // availability captured at time of add
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
 * Utility type guards & helpers for safe parsing
 * ---------------------------------------------------- */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const toString = (v: unknown, fallback = ""): string => {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
};

const toNumber = (v: unknown, fallback = 0): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const toArray = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const isChoiceLike = (v: unknown): v is Record<string, unknown> => {
  if (!isRecord(v)) return false;
  return typeof v.label === "string" || typeof v.name === "string" || typeof v.option === "string";
};

const isAddressPlace = (v: unknown): v is AddressPlace => {
  if (!isRecord(v)) return false;
  if (typeof v.formatted_address !== "string") return false;
  if (v.place_id !== undefined && typeof v.place_id !== "string") return false;
  if (v.name !== undefined && typeof v.name !== "string") return false;
  if (v.lat !== undefined && typeof v.lat !== "number") return false;
  if (v.lng !== undefined && typeof v.lng !== "number") return false;
  if (v.distanceKm !== undefined && typeof v.distanceKm !== "number") return false;
  if (v.canDeliver !== undefined && typeof v.canDeliver !== "boolean") return false;
  return true;
};

const isOrderMetadataLike = (v: unknown): v is Partial<OrderMetadata> => {
  if (!isRecord(v)) return false;
  if (v.type !== undefined && v.type !== "ASAP" && v.type !== "SCHEDULED") return false;
  if (v.aptSuite !== undefined && typeof v.aptSuite !== "string" && v.aptSuite !== null) return false;
  if (v.instructions !== undefined && typeof v.instructions !== "string" && v.instructions !== null) return false;
  if (v.address !== undefined && typeof v.address !== "string" && v.address !== null) return false;
  if (v.timeIso !== undefined && typeof v.timeIso !== "string" && v.timeIso !== null) return false;
  if (v.updatedAt !== undefined && typeof v.updatedAt !== "string") return false;
  return true;
};

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
   * Helper: compute stable key for (id + choices + addons)
   * ---------------------------------------------------- */
  const computeKey = (id: string, choices?: ChoiceSelected[], addons?: ChoiceSelected[]) => {
    const parts: string[] = [];

    if (!choices || choices.length === 0) {
      parts.push("no-choices");
    } else {
      const sorted = [...choices].sort((a, b) => a.label.localeCompare(b.label));
      parts.push(
        "choices:" +
          sorted
            .map((c) => `${c.label}:${Number(c.price || 0)}`)
            .join("|")
      );
    }

    if (!addons || addons.length === 0) {
      parts.push("no-addons");
    } else {
      const sortedA = [...addons].sort((a, b) => a.label.localeCompare(b.label));
      parts.push(
        "addons:" +
          sortedA
            .map((a) => `${a.label}:${Number(a.price || 0)}`)
            .join("|")
      );
    }

    return `${id}|${parts.join("|")}`;
  };

  /* ----------------------------------------------------
   * Load from storage + migration for old saved cart items
   * ---------------------------------------------------- */
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem("cart");
      if (savedRaw) {
        let parsedRaw: unknown;
        try {
          parsedRaw = JSON.parse(savedRaw);
        } catch {
          parsedRaw = [];
        }

        const parsedArray = Array.isArray(parsedRaw) ? (parsedRaw as unknown[]) : [];

        const migrated: CartItem[] = parsedArray.map((entryRaw, entryIdx) => {
          const entry = isRecord(entryRaw) ? entryRaw : {};

          const id = toString(entry.id ?? entry.menuId ?? "", `migrated-${entryIdx}`);
          const name = toString(
            entry.name ?? entry.title ?? entry.menuTitle ?? `Item ${entryIdx + 1}`,
            `Item ${entryIdx + 1}`
          );
          const price = toNumber(entry.price ?? entry.menuPrice ?? 0, 0);
          const quantity = Math.max(1, toNumber(entry.quantity ?? 1, 1));
          const image =
            typeof entry.image === "string"
              ? entry.image
              : typeof entry.menuImage === "string"
              ? entry.menuImage
              : undefined;

          const rawChoices = entry.choices ?? entry.choiceOptions ?? entry.selectedOptions ?? [];
          const rawChoicesArray = toArray<unknown>(rawChoices);

          const choices: ChoiceSelected[] = rawChoicesArray
            .filter(isChoiceLike)
            .map((cRaw, idx) => {
              const c = isRecord(cRaw) ? cRaw : {};
              const label = toString(c.label ?? c.name ?? c.option ?? `Option ${idx + 1}`, `Option ${idx + 1}`);
              const priceNum = toNumber(c.price ?? c.extraPrice ?? c.addonPrice ?? 0, 0);
              const cid = toString(c.id ?? `${id}-choice-${idx}`, `${id}-choice-${idx}`);
              return { id: cid, label, price: priceNum, kind: "choice" as ChoiceKind };
            });

          // Try several fields for addons in saved schema
          const rawAddons = entry.addons ?? entry.addOns ?? entry.add_ons ?? entry.addonOptions ?? [];
          const rawAddonsArray = toArray<unknown>(rawAddons);

          const addons: ChoiceSelected[] = rawAddonsArray
            .filter(isChoiceLike)
            .map((aRaw, idx) => {
              const a = isRecord(aRaw) ? aRaw : {};
              const label = toString(a.label ?? a.name ?? a.option ?? `Addon ${idx + 1}`, `Addon ${idx + 1}`);
              const priceNum = toNumber(a.price ?? a.extraPrice ?? a.addonPrice ?? 0, 0);
              const aid = toString(a.id ?? `${id}-addon-${idx}`, `${id}-addon-${idx}`);
              return { id: aid, label, price: priceNum, kind: "addon" as ChoiceKind };
            });

          // if saved entry includes available flag, use it; otherwise default true
          const available = entry.available !== undefined ? Boolean(entry.available) : true;

          const cartItemKey = toString(
            entry.cartItemKey ?? computeKey(id, choices.length ? choices : undefined, addons.length ? addons : undefined),
            computeKey(id, choices.length ? choices : undefined, addons.length ? addons : undefined)
          );

          return {
            id,
            name,
            price,
            quantity,
            image,
            choices: choices.length > 0 ? choices : undefined,
            addons: addons.length > 0 ? addons : undefined,
            cartItemKey,
            available,
          } as CartItem;
        });

        setCart(migrated);
      }

      const savedMode = sessionStorage.getItem("orderMode");
      if (savedMode === "pickup" || savedMode === "delivery") setOrderMode(savedMode);

      const savedAddress = sessionStorage.getItem("deliveryAddress");
      const savedTime = sessionStorage.getItem("deliveryTime");
      if (typeof savedAddress === "string") setAddress(savedAddress);
      if (typeof savedTime === "string") setDeliveryTime(savedTime);

      const savedPlace = sessionStorage.getItem("deliveryAddressPlace");
      if (typeof savedPlace === "string") {
        try {
          const parsedPlace = JSON.parse(savedPlace);
          if (isAddressPlace(parsedPlace)) {
            setAddressPlace(parsedPlace);
          }
        } catch {
          // ignore parse error
        }
      }

      const savedMeta = sessionStorage.getItem("orderMetadata");
      if (typeof savedMeta === "string") {
        try {
          const parsedMeta = JSON.parse(savedMeta);
          if (isOrderMetadataLike(parsedMeta)) {
            const metaObj = parsedMeta as Partial<OrderMetadata>;
            const normalized: OrderMetadata = {
              type: (metaObj.type as OrderTypeTag) ?? "ASAP",
              aptSuite: metaObj.aptSuite ?? null,
              instructions: metaObj.instructions ?? null,
              address: metaObj.address ?? null,
              timeIso: metaObj.timeIso ?? null,
              updatedAt: metaObj.updatedAt ?? new Date().toISOString(),
            };
            setOrderMetadata(normalized);
            if (metaObj.type === "ASAP" || metaObj.type === "SCHEDULED") setOrderType(metaObj.type);
            setDeliveryNotes({
              aptSuite: metaObj.aptSuite ?? null,
              instructions: metaObj.instructions ?? null,
            });
          }
        } catch {
          // ignore parse error
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error loading/migrating cart from storage:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const key = computeKey(item.id, item.choices, item.addons);
      const existingIndex = prev.findIndex((i) => i.cartItemKey === key && i.available === (item.available ?? true));
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], quantity: copy[existingIndex].quantity + item.quantity };
        return copy;
      }
      const newItem: CartItem = { ...item, cartItemKey: key, available: item.available ?? true };
      return [...prev, newItem];
    });
  };

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
      const addonsTotal = (item.addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
      return total + (Number(item.price) + choicesTotal + addonsTotal) * item.quantity;
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
