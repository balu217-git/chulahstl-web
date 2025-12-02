"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, ChoiceSelected } from "@/context/CartContext";
import Image from "next/image";
import { Offcanvas, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import OrderModeSelector from "@/components/OrderModeSelector";
import OrderModeAddress from "@/components/OrderModeAddress";
import OrderTypeModal from "@/components/OrderTypeModal";
import TimePickerModal from "@/components/TimePickerModal";
import type { SelectedPlace } from "@/components/AddressPicker";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";

interface CartDrawerProps {
  show?: boolean;
  onClose?: () => void;
}

export default function CartDrawer({ show, onClose }: CartDrawerProps) {
  const router = useRouter();
  const {
    cart,
    getTotalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    orderMode,
    setOrderMode,
    address,
    addressPlace,
    deliveryTime,
    setDeliveryTime,
  } = useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  const openOrderModalAbove = () => {
    setTimeout(() => setShowOrderModal(true), 120);
  };

  const handleOrderModeClick = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
    if (mode === "delivery") openOrderModalAbove();
  };

  const handleDeliverySelect = () => openOrderModalAbove();

  useEffect(() => {
    if (!showTimePicker) {
      setWeekdayText(null);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/google-reviews");
        if (!res.ok) {
          if (!mounted) return;
          setWeekdayText(null);
          return;
        }
        const j = await res.json();
        if (!mounted) return;
        setWeekdayText(j?.opening_hours?.weekday_text || null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch opening hours:", err);
        if (!mounted) return;
        setWeekdayText(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showTimePicker]);

  const handleTimeConfirm = (iso: string) => {
    setDeliveryTime(iso);
    setShowTimePicker(false);
  };

  const ap = addressPlace as SelectedPlace | null | undefined;
  const timeZone = ap?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago";

  const checkoutMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!cart || cart.length === 0) missing.push("Add at least one item to the cart");
    if (!orderMode) missing.push("Choose pickup or delivery");
    if (orderMode === "delivery") {
      if (!address || address.trim().length === 0) missing.push("Set a delivery address");
      if (!deliveryTime || deliveryTime.trim().length === 0) missing.push("Choose a delivery time or select ASAP");
    } else {
      if (!deliveryTime || deliveryTime.trim().length === 0) missing.push("Choose a pickup time");
    }
    return missing;
  };

  const handleGoToCheckout = () => {
    const missing = checkoutMissingFields();
    if (missing.length > 0) {
      if (orderMode === "delivery" && (!address || address.trim().length === 0)) {
        openOrderModalAbove();
        return;
      }

      if (!deliveryTime || deliveryTime.trim().length === 0) {
        setShowOrderModal(false);
        setTimeout(() => setShowTimePicker(true), 120);
        return;
      }

      openOrderModalAbove();
      return;
    }

    if (onClose) onClose();
    router.push("/checkout");
  };

  const computeChoicesTotal = (choices?: ChoiceSelected[]) =>
    (choices || []).reduce((s, c) => s + (Number(c.price) || 0), 0);

  const computeAddonsTotal = (addons?: ChoiceSelected[]) =>
    (addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);

  const lineTotal = (item: { price: number; quantity: number; choices?: ChoiceSelected[]; addons?: ChoiceSelected[] }) => {
    const choicesTotal = computeChoicesTotal(item.choices);
    const addonsTotal = computeAddonsTotal(item.addons);
    return (Number(item.price || 0) + choicesTotal + addonsTotal) * item.quantity;
  };

  const deriveKey = (item: { id: string; choices?: ChoiceSelected[]; addons?: ChoiceSelected[] }) => {
    const choicesKey = item.choices && item.choices.length > 0 ? `|choices:${item.choices.map((c) => `${c.label}:${c.price}`).join(",")}` : "";
    const addonsKey = item.addons && item.addons.length > 0 ? `|addons:${item.addons.map((a) => `${a.label}:${a.price}`).join(",")}` : "";
    return `${item.id}${choicesKey}${addonsKey}`;
  };

  return (
    <>
      <Offcanvas show={show} onHide={onClose} placement="end" backdrop={true} scroll={true}>
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>Cart</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column justify-content-between h-100">
          <OrderModeSelector onAddressSelect={handleDeliverySelect} />
          <OrderModeAddress
            className="my-3"
            onAddressSelect={() => openOrderModalAbove()}
            onTimeSelect={() => setShowTimePicker(true)}
          />

          <div className="cart-items flex-grow-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <p>Your cart is empty.</p>
                <Link className="btn btn-brand-green" href="/menu" onClick={onClose}>
                  View Menu
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const choicesTotal = computeChoicesTotal(item.choices);
                const addonsTotal = computeAddonsTotal(item.addons);
                const perItemPrice = Number(item.price || 0) + choicesTotal + addonsTotal;
                const totalLine = lineTotal(item);
                const key = item.cartItemKey ?? deriveKey(item);
                const available = item.available !== false; // default true if undefined

                return (
                  <div
                    key={key}
                    className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3"
                  >
                    <div className="d-flex align-items-start gap-3" style={{ maxWidth: "68%" }}>
                      <Image
                        src={item.image || "/images/img-dish-icon-bg.webp"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded"
                        style={{objectFit: 'cover'}}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <p className="mb-0 fw-semibold">{item.name}</p>
                          {!available && <span className="badge bg-danger small">Unavailable</span>}
                        </div>

                        {/* choices */}
                        {item.choices && item.choices.length > 0 && (
                          <div className="mb-2">
                            {item.choices.map((c, idx) => (
                              <div key={`${item.id}-choice-${idx}`} className="small text-muted d-flex justify-content-between">
                                <div>{c.label}</div>
                                <div>{formatPrice(Number(c.price || 0))}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* addons */}
                        {item.addons && item.addons.length > 0 && (
                          <div className="mb-2">
                            <div className="small text-muted">Add-ons</div>
                            {item.addons.map((a, idx) => (
                              <div key={`${item.id}-addon-${idx}`} className="small text-muted d-flex justify-content-between">
                                <div>{a.label}</div>
                                <div>{formatPrice(Number(a.price || 0))}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="d-flex align-items-center gap-2">
                          <Button
                            className="btn btn-cart btn-outline-secondary btn-sm btn-light"
                            onClick={() => updateQuantity(item.cartItemKey ?? item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1 || !available}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            className="btn btn-cart btn-outline-secondary btn-sm btn-light"
                            onClick={() => updateQuantity(item.cartItemKey ?? item.id, item.quantity + 1)}
                            disabled={!available}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <p className="fw-bold mb-1">{formatPrice(totalLine)}</p>
                      <div className="small text-muted mb-2">
                        <div>Per item: {formatPrice(perItemPrice)}</div>
                        <div>× {item.quantity}</div>
                      </div>

                      <Button
                        className="btn btn-sm btn-link text-danger p-0 shadow-none"
                        onClick={() => removeFromCart(item.cartItemKey ?? item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-top pt-3 sticky-bottom bg-white">
              <div className="d-flex justify-content-between mb-3 fw-semibold align-items-end">
                <span>Subtotal</span>
                <span className="fw-bold fs-5">{formatPrice(getTotalPrice())}</span>
              </div>

              <button
                className="btn btn-brand-orange w-100 mb-2 rounded-pill"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToCheckout();
                }}
              >
                Checkout
              </button>

              <Button className="btn btn-outline-secondary btn-light w-100 rounded-pill" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <OrderTypeModal show={showOrderModal} onClose={() => setShowOrderModal(false)} />

      <TimePickerModal
        show={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        mode={orderMode === "pickup" ? "pickup" : "delivery"}
        weekdayText={weekdayText}
        timeZone={timeZone}
        slotMinutes={15}
        daysAhead={9}
        onConfirm={handleTimeConfirm}
      />
    </>
  );
}
