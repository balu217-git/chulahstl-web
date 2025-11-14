// components/CartDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Offcanvas, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import OrderModeSelector from "@/components/OrderModeSelector";
import OrderModeAddress from "@/components/OrderModeAddress";
import OrderTypeModal from "@/components/OrderTypeModal";
import TimePickerModal from "@/components/TimePickerModal";
import type { SelectedPlace } from "@/components/AddressPicker";

interface CartDrawerProps {
  show?: boolean;
  onClose?: () => void;
}

export default function CartDrawer({ show, onClose }: CartDrawerProps) {
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
    setDeliveryTime,
  } = useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);

  // TimePicker parent-controlled state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  const handleOrderModeClick = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
    if (mode === "delivery") {
      // Ensure modal shows above Offcanvas (small delay)
      setTimeout(() => setShowOrderModal(true), 150);
    }
  };

  const handleDeliverySelect = () => {
    setShowOrderModal(true);
  };

  // fetch weekday_text when timepicker opens (on-demand)
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

  // Called when user picks a time in TimePickerModal
  const handleTimeConfirm = (iso: string) => {
    setDeliveryTime(iso);
    setShowTimePicker(false);
  };

  // timeZone for TimePicker: prefer selected place timezone, fallback to env default
  // avoid `any` by asserting addressPlace to SelectedPlace | null | undefined
  const ap = addressPlace as SelectedPlace | null | undefined;
  const timeZone = ap?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago";

  return (
    <>
      <Offcanvas show={show} onHide={onClose} placement="end" backdrop={true} scroll={true}>
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>Cart</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column justify-content-between h-100">
          {/* --- Order Type Buttons --- */}
          <OrderModeSelector onAddressSelect={handleDeliverySelect} />
          {/* Address box opens OrderTypeModal; Time box opens TimePickerModal */}
          <OrderModeAddress
            className="my-3"
            onAddressSelect={() => setShowOrderModal(true)}
            onTimeSelect={() => setShowTimePicker(true)}
          />

          {/* --- Cart Items --- */}
          <div className="cart-items flex-grow-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="text-center py-5">
                <p>Your cart is empty.</p>
                <Link className="btn btn-brand-green" href="/menu" onClick={onClose}>
                  View Menu
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <Image
                      src={item.image || "/images/img-dish-icon-bg.webp"}
                      alt={item.title}
                      width={60}
                      height={60}
                      className="rounded"
                    />
                    <div>
                      <p className="mb-1 fw-semibold">{item.title}</p>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          className="btn btn-cart btn-outline-secondary btn-sm btn-light"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          className="btn btn-cart btn-outline-secondary btn-sm btn-light"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <p className="fw-bold mb-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      className="btn btn-sm btn-link text-danger p-0 shadow-none"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- Cart Footer --- */}
          {cart.length > 0 && (
            <div className="border-top pt-3 sticky-bottom bg-white">
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="btn btn-brand-orange w-100 mb-2 rounded-pill" onClick={onClose}>
                Checkout
              </Link>

              <Button className="btn btn-outline-secondary btn-light w-100 rounded-pill" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* --- Order Modal --- */}
      <OrderTypeModal show={showOrderModal} onClose={() => setShowOrderModal(false)} />

      {/* --- TimePicker Modal (parent-controlled) --- */}
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
