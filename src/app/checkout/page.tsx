"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faStore, faClipboardList } from "@fortawesome/free-solid-svg-icons";
import Address from "@/components/Address";
import { formatDateTimeForTZ } from "@/lib/formatDateTime";
import type { SelectedPlace } from "@/components/AddressPicker";
import { useCart } from "@/context/CartContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CheckoutPage() {
  const {
    cart,
    getTotalPrice,
    orderMode,
    address,
    deliveryTime,
    addressPlace,
    orderType,
    deliveryNotes,
    setDeliveryNotes,
    orderMetadata,
    setOrderMetadata,
    setDeliveryTime,
  } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Local state for editing delivery notes inline on checkout
  const [editingNotes, setEditingNotes] = useState(false);
  const [localApt, setLocalApt] = useState<string>(deliveryNotes?.aptSuite ?? "");
  const [localInstructions, setLocalInstructions] = useState<string>(deliveryNotes?.instructions ?? "");

  // Keep local fields in sync when context deliveryNotes change
  useEffect(() => {
    setLocalApt(deliveryNotes?.aptSuite ?? "");
    setLocalInstructions(deliveryNotes?.instructions ?? "");
  }, [deliveryNotes?.aptSuite, deliveryNotes?.instructions]);

  // --- timeZone: prefer selected place timezone ---
  const ap = addressPlace as SelectedPlace | null | undefined;
  const timeZone = ap?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago";

  // 🕒 Format delivery time display (use your helper)
  const formattedDeliveryTime = useMemo(() => {
    return deliveryTime ? formatDateTimeForTZ(deliveryTime, timeZone) : "";
  }, [deliveryTime, timeZone]);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? "-" + match[3] : ""}`;
  };

  const saveDeliveryNotes = () => {
    // persist into context
    const notes = {
      aptSuite: localApt || null,
      instructions: localInstructions || null,
    };
    setDeliveryNotes(notes);

    // also build orderMetadata and set it so sessionStorage gets updated
    const meta = {
      type: orderType ?? (orderMetadata?.type ?? "ASAP"),
      aptSuite: notes.aptSuite,
      instructions: notes.instructions,
      address: address || null,
      timeIso: deliveryTime || null,
      updatedAt: new Date().toISOString(),
    };
    setOrderMetadata(meta);

    setEditingNotes(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your cart is empty.");
    if (!name.trim() || !email.trim() || !phone.trim())
      return alert("Please fill in your name, email, and phone number.");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return alert("Please enter a valid email address.");

    if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone))
      return alert("Please enter a valid US phone number (e.g. (555) 555-5555).");

    if (orderMode === "delivery" && !address.trim()) return alert("Please enter your delivery address.");

    setLoading(true);

    try {
      const total = getTotalPrice();

      // Build deliveryNotes payload consistently with context
      const notesPayload = {
        aptSuite: deliveryNotes?.aptSuite ?? localApt ?? null,
        instructions: deliveryNotes?.instructions ?? localInstructions ?? null,
      };

      // Build addressPlace payload (if exists)
      const addressPlacePayload = addressPlace ? { ...addressPlace } : null;

      // ---------- NEW: normalize cart items to server shape ----------
      const itemsPayload = cart.map((i: CartItem) => ({
        id: String(i.id),
        name: String(i.name),
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 0,
        image: String(i.image ?? ""),
      }));

      for (const it of itemsPayload) {
        if (!it.id || !it.name || typeof it.price !== "number" || typeof it.quantity !== "number") {
          console.error("Invalid item payload:", it);
          return alert("There was an issue with an item in your cart. Please review your cart and try again.");
        }
      }

      // 1️⃣ Create order in WordPress - include new metadata fields
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          orderMode,
          address,
          deliveryTime,
          items: itemsPayload,
          total,
          paymentOrderId: "N/A",
          paymentStatus: "pending",
          orderStatus: "pending",

          // new metadata
          orderType: orderType ?? (orderMetadata?.type ?? "ASAP"),
          deliveryNotes: notesPayload,
          addressPlace: addressPlacePayload,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.order) {
        console.error("Order creation failed:", orderData);
        alert("Failed to create order. Please try again.");
        return;
      }

      // 2️⃣ Generate Square payment link
      const paymentRes = await fetch("/api/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items: itemsPayload,
          orderId: orderData.order.id,
          databaseId: orderData.order.databaseId,
        }),
      });

      const data = await paymentRes.json();

      if (data.success && data.checkoutUrl) {
        setPaymentUrl(data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return (
      <section
        className="hero bg-brand-light text-center d-flex align-items-center justify-content-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="container">
          <h1 className="fw-bold text-dark mb-3 fs-2">Your cart is empty.</h1>
        </div>
      </section>
    );

  return (
    <section className="hero bg-brand-light" style={{ minHeight: "80vh" }}>
      <div className="container">
        <h1 className="fw-bold mb-5 text-center">Checkout</h1>

        <div className="row">
          {/* Left Column: Customer Info */}
          <div className="col-lg-6">
            <div className="mb-md-5 mb-4">
              {/* Delivery Option */}
              {orderMode === "pickup" ? (
                <>
                  <h5 className="mb-3 fw-semibold font-family-body">Pickup details</h5>
                  <Card className="bg-brand-green text-light border-brand-orange rounded-4 mb-3 overflow-hidden">
                    <Card.Body>
                      <div className="d-flex align-items-start">
                        <FontAwesomeIcon icon={faStore} className="me-2 pt-1" />
                        <p className="mb-0">
                          Pickup from:{" "}
                          <strong>
                            <Address fontSize="fs-6" showName={false} showOpenStatus={false} showTimings={false} />
                          </strong>
                        </p>
                      </div>
                      <div className="d-flex align-items-start mb-3">
                        <FontAwesomeIcon icon={faClock} className="me-2 pt-1" />
                        <p className="mb-0">
                          {deliveryTime ? formattedDeliveryTime : "Delivery time not set"}
                        </p>
                      </div>
                    </Card.Body>
                    <Card.Footer className="text-center bg-brand-green-light">
                      <small>You're saving <b>$1.87</b> by ordering directly from us vs. other websites</small>
                    </Card.Footer>
                  </Card>
                </>
              ) : (
                <>
                  <h5 className="fw-semibold mb-3 font-family-body">Delivery details</h5>
                  <Card className="bg-brand-green text-light border-brand-orang border-1 rounded-4 mb-3 overflow-hidden">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 pt-1" />
                        <p className="mb-0">
                          Delivering to: <strong className="d-block">{address || "No address set yet"}</strong>
                        </p>
                      </div>

                      <div className="d-flex align-items-start mb-3">
                        <FontAwesomeIcon icon={faClock} className="me-2 pt-1" />
                        <p className="mb-0">{deliveryTime ? formattedDeliveryTime : "Delivery time not set"}</p>
                      </div>

                      <div className="d-flex align-items-start mb-3">
                        <FontAwesomeIcon icon={faClipboardList} className="me-2 pt-1" />
                        <div style={{ flex: 1 }}>
                          {(!deliveryNotes?.instructions && !deliveryNotes?.aptSuite && !editingNotes) ? (
                            <>
                              <div className="small text-light mb-2">No delivery instructions added.</div>
                              {!editingNotes ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-light btn-sm"
                                  onClick={() => {
                                    setLocalApt(deliveryNotes?.aptSuite ?? "");
                                    setLocalInstructions(deliveryNotes?.instructions ?? "");
                                    setEditingNotes(true);
                                  }}
                                >
                                  Add delivery instructions
                                </button>
                              ) : (
                                <div className="mt-2">
                                  <div className="mb-2">
                                    <label className="form-label small">Apt / Suite / Floor (optional)</label>
                                    <input
                                      className="form-control form-control-sm"
                                      value={localApt}
                                      onChange={(e) => setLocalApt(e.target.value)}
                                      placeholder="Apt, Suite or Floor"
                                    />
                                  </div>
                                  <div className="mb-2">
                                    <label className="form-label small">Delivery instructions</label>
                                    <textarea
                                      className="form-control form-control-sm"
                                      rows={3}
                                      value={localInstructions}
                                      onChange={(e) => setLocalInstructions(e.target.value)}
                                      placeholder="Leave at door, call on arrival, etc. (optional)"
                                    />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button className="btn btn-light btn-sm" onClick={saveDeliveryNotes}>Save</button>
                                    <button className="btn btn-outline-light btn-sm" onClick={() => setEditingNotes(false)}>Cancel</button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div>
                              <div className="small text-light mb-2">
                                {deliveryNotes?.aptSuite ? <div><strong>Apt/Suite:</strong> {deliveryNotes.aptSuite}</div> : null}
                                {deliveryNotes?.instructions ? <div className="mt-1"><strong>Instructions:</strong> {deliveryNotes.instructions}</div> : null}
                              </div>
                              {!editingNotes ? (
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => {
                                      setLocalApt(deliveryNotes?.aptSuite ?? "");
                                      setLocalInstructions(deliveryNotes?.instructions ?? "");
                                      setEditingNotes(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <div className="mb-2">
                                    <label className="form-label small">Apt / Suite / Floor (optional)</label>
                                    <input
                                      className="form-control form-control-sm"
                                      value={localApt}
                                      onChange={(e) => setLocalApt(e.target.value)}
                                      placeholder="Apt, Suite or Floor"
                                    />
                                  </div>
                                  <div className="mb-2">
                                    <label className="form-label small">Delivery instructions</label>
                                    <textarea
                                      className="form-control form-control-sm"
                                      rows={3}
                                      value={localInstructions}
                                      onChange={(e) => setLocalInstructions(e.target.value)}
                                      placeholder="Leave at door, call on arrival, etc. (optional)"
                                    />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button className="btn btn-light btn-sm" onClick={saveDeliveryNotes}>Save</button>
                                    <button className="btn btn-outline-light btn-sm" onClick={() => setEditingNotes(false)}>Cancel</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="text-center bg-brand-green-light">
                      <small>You're saving <b>$1.87</b> by ordering directly from us vs. other websites</small>
                    </Card.Footer>
                  </Card>
                </>
              )}
            </div>

            <div className="mb-md-5 mb-4 form-container">
              <h5 className="mb-3 fw-semibold font-family-body">Customer Information</h5>
              <Card className="bg-transparent border-brand-green border-1 rounded-4 text-brand-green">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <input type="text" className="form-control" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email Address</label>
                    <input type="email" className="form-control" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input type="tel" className="form-control" placeholder="(555) 555-5555" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Right Column: Cart Summary */}
          <div className="col-lg-6">
            <h5 className="mb-3 font-family-body fw-semibold">Your Order</h5>
            <Card className="shadow-sm font-family-body text-brand-green rounded-4 border-brand-orang">
              <Card.Body className="p-4">
                <ul className="list-group mb-3">
                  {cart.map((item) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between text-brand-green align-items-center">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="text-end font-family-body">
                  Total: <span className="fw-bold">₹{getTotalPrice().toFixed(2)}</span>
                </h4>

                <button className="btn btn-brand-orange w-100 mt-4" onClick={handleCheckout} disabled={loading}>
                  {loading ? "Processing..." : "Pay with Square"}
                </button>

                {paymentUrl && <p className="mt-3 text-muted text-center">Redirecting to Square checkout...</p>}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
