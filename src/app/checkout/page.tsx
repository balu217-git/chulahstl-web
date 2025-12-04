"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faStore, faClipboardList, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Address from "@/components/Address";
import { formatDateTimeForTZ } from "@/lib/formatDateTime";
import type { SelectedPlace } from "@/components/AddressPicker";
import { useCart, ChoiceSelected } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import CustomTipModal from "@/components/CustomTipModal";

interface InternalCartItem {
  id: string;
  cartItemKey?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  choices?: ChoiceSelected[];
  addons?: ChoiceSelected[];
}

/**
 * CONFIGURABLE RATES — adjust to your real values
 */
const TAX_RATE = 0.091; // 9.1%
const PROCESSING_FEE_RATE = 0.061; // 6.1%
const PLATFORM_FEE_RATE = 0.05; // 5.0%

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
  } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [editingNotes, setEditingNotes] = useState(false);
  const [localApt, setLocalApt] = useState<string>(deliveryNotes?.aptSuite ?? "");
  const [localInstructions, setLocalInstructions] = useState<string>(deliveryNotes?.instructions ?? "");

  useEffect(() => {
    setLocalApt(deliveryNotes?.aptSuite ?? "");
    setLocalInstructions(deliveryNotes?.instructions ?? "");
  }, [deliveryNotes?.aptSuite, deliveryNotes?.instructions]);

  const ap = addressPlace as SelectedPlace | null | undefined;
  const timeZone = ap?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago";

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
    const notes = {
      aptSuite: localApt || null,
      instructions: localInstructions || null,
    };
    setDeliveryNotes(notes);

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

  const computeChoicesTotal = (choices?: ChoiceSelected[]) =>
    (choices || []).reduce((s, c) => s + (Number(c.price) || 0), 0);

  const computeAddonsTotal = (addons?: ChoiceSelected[]) =>
    (addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);

  const lineTotal = (item: InternalCartItem) => {
    const choicesTotal = computeChoicesTotal(item.choices);
    const addonsTotal = computeAddonsTotal(item.addons);
    return (Number(item.price || 0) + choicesTotal + addonsTotal) * item.quantity;
  };

  /** TIP state & modal */
  const TIP_OPTIONS = [0.10, 0.15, 0.20];
  const [selectedTipPercent, setSelectedTipPercent] = useState<number | null>(0.20); // default 20%
  const [customTipValue, setCustomTipValue] = useState<string>(""); // stored as dollars string like "2.99"
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const selectPercentTip = (p: number) => {
    setSelectedTipPercent(p);
    setCustomTipValue("");
  };
  const openCustomTipModal = () => {
    setSelectedTipPercent(null);
    setCustomModalOpen(true);
  };
  const handleSaveCustomTip = (amount: number) => {
    setCustomTipValue(amount.toFixed(2));
    setCustomModalOpen(false);
  };

  /** ---------------------
   * Subtotal, taxes, fees, tip, total
   * --------------------- */
  const subtotal = useMemo(() => {
    return cart.reduce((s, raw) => {
      const item = raw as InternalCartItem;
      return s + lineTotal(item);
    }, 0);
  }, [cart]);

  const taxes = useMemo(() => +(subtotal * TAX_RATE), [subtotal]);
  const processingFee = useMemo(() => +(subtotal * PROCESSING_FEE_RATE), [subtotal]);
  const platformFee = useMemo(() => +(subtotal * PLATFORM_FEE_RATE), [subtotal]);

  const tipAmount = useMemo(() => {
    if (selectedTipPercent !== null && typeof selectedTipPercent === "number") {
      return +(subtotal * selectedTipPercent);
    }
    const parsed = parseFloat((customTipValue || "").replace(/[^\d.-]/g, ""));
    if (!isFinite(parsed) || parsed <= 0) return 0;
    return +parsed;
  }, [subtotal, selectedTipPercent, customTipValue]);

  const total = useMemo(() => {
    const t = subtotal + taxes + processingFee + platformFee + tipAmount;
    return Math.round(t * 100) / 100;
  }, [subtotal, taxes, processingFee, platformFee, tipAmount]);

  const [taxesExpanded, setTaxesExpanded] = useState(false);

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
      const itemsPayload = cart.map((i: InternalCartItem) => {
        const priceNum = Number(i.price) || 0;
        const qtyNum = Number(i.quantity) || 0;
        return {
          id: String(i.id),
          cartItemKey: i.cartItemKey ?? null,
          name: String(i.name),
          price: priceNum,
          quantity: qtyNum,
          image: String(i.image ?? ""),
          choices: (i.choices || []).map((c) => ({
            id: String(c.id ?? ""),
            label: String(c.label ?? ""),
            price: Number(c.price || 0),
            kind: c.kind ?? "choice",
          })),
          addons: (i.addons || []).map((a) => ({
            id: String(a.id ?? ""),
            label: String(a.label ?? ""),
            price: Number(a.price || 0),
            kind: a.kind ?? "addon",
          })),
        };
      });

      for (const it of itemsPayload) {
        if (!it.id || !it.name || typeof it.price !== "number" || typeof it.quantity !== "number") {
          console.error("Invalid item payload:", it);
          return alert("There was an issue with an item in your cart. Please review your cart and try again.");
        }
      }

      const totalPayload = {
        subtotal: Math.round(subtotal * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        processingFee: Math.round(processingFee * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        tip: Math.round(tipAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
      };

      const notesPayload = {
        aptSuite: deliveryNotes?.aptSuite ?? localApt ?? null,
        instructions: deliveryNotes?.instructions ?? localInstructions ?? null,
      };

      const addressPlacePayload = addressPlace ? { ...addressPlace } : null;

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
          totals: totalPayload,
          paymentOrderId: "N/A",
          paymentStatus: "pending",
          orderStatus: "pending",
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

      const paymentRes = await fetch("/api/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          items: itemsPayload,
          orderId: orderData.order.id,
          databaseId: orderData.order.databaseId,
          totals: totalPayload,
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
          {/* Left Column: Customer Info + Tip Picker */}
          <div className="col-lg-6">
            <div className="mb-md-5 mb-4">
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
                        <p className="mb-0">{deliveryTime ? formattedDeliveryTime : "Delivery time not set"}</p>
                      </div>
                    </Card.Body>
                    <Card.Footer className="text-center bg-brand-green-light">
                      <small>You&apos;re saving <b>$1.87</b> by ordering directly from us vs. other websites</small>
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
                      <small>You&apos;re saving <b>$1.87</b> by ordering directly from us vs. other websites</small>
                    </Card.Footer>
                  </Card>
                </>
              )}
            </div>

            {/* Tip picker (10/15/20 + custom) */}
            <div className="mb-4">
              <h5 className="mb-3 fw-semibold font-family-body">Tip</h5>
              <div className="d-flex gap-2 flex-wrap">
                {TIP_OPTIONS.map((p) => {
                  const amount = Math.round(subtotal * p * 100) / 100;
                  const active = selectedTipPercent === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`btn ${active ? "btn-brand-brown" : "btn-outline-dark"} rounded-3`}
                      onClick={() => selectPercentTip(p)}
                      style={{ minWidth: 120, padding: "14px" }}
                    >
                      <div className="fw-semibold">{formatPrice(amount)}</div>
                      <div className="small text-mute">{Math.round(p * 100)}%</div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  className={`btn ${selectedTipPercent === null ? "btn-brand-brown" : "btn-outline-dark"} rounded-3`}
                  onClick={() => openCustomTipModal()}
                  style={{ minWidth: 120, padding: "14px" }}
                >
                  <div className="fw-semibold">{customTipValue ? formatPrice(Number(customTipValue)) : "Custom"}</div>
                </button>
              </div>
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

          {/* Right Column: Cart Summary + taxes/fees breakdown */}
          <div className="col-lg-6">
            <h5 className="mb-3 font-family-body fw-semibold">Order summary</h5>
            <Card className="shadow-sm font-family-body text-brand-green rounded-4 border-brand-orang">
              <Card.Body className="p-4">
                <ul className="list-group mb-3 info-brand">
                  {cart.map((itemRaw) => {
                    const item = itemRaw as InternalCartItem;
                    const key = item.cartItemKey ?? item.id;
                    const perLine = lineTotal(item);
                    const choicesTotal = computeChoicesTotal(item.choices);
                    const addonsTotal = computeAddonsTotal(item.addons);
                    const perItemPrice = Number(item.price || 0) + choicesTotal + addonsTotal;

                    return (
                      <li key={key} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ maxWidth: "70%" }}>
                            <div className="fw-semibold">{item.name} <small className="text-muted">× {item.quantity}</small></div>

                            {/* choices */}
                            {item.choices && item.choices.length > 0 && (
                              <div className="mt-2 small text-muted">
                                {item.choices.map((c, idx) => (
                                  <div key={`${key}-choice-${idx}`} className="d-flex justify-content-between">
                                    <div>{c.label}</div>
                                    <div>{formatPrice(Number(c.price || 0))}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* addons */}
                            {item.addons && item.addons.length > 0 && (
                              <div className="mt-2 small text-muted">
                                <div className="small text-muted">Add-ons</div>
                                {item.addons.map((a, idx) => (
                                  <div key={`${key}-addon-${idx}`} className="d-flex justify-content-between">
                                    <div>{a.label}</div>
                                    <div>{formatPrice(Number(a.price || 0))}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            { (item.choices && item.choices.length > 0) || (item.addons && item.addons.length > 0) ? (
                              <div className="mt-1 d-flex justify-content-between">
                                <div className="small">Per item:</div>
                                <div className="small">{formatPrice(perItemPrice)}</div>
                              </div>
                            ) : null }
                          </div>

                          <div className="text-end">
                            <div className="fw-bold">{formatPrice(perLine)}</div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Totals breakdown */}
                <div className="mb-2 d-flex justify-content-between">
                  <div>Subtotal</div>
                  <div className="fw-bold">{formatPrice(subtotal)}</div>
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 shadow-none text-brand-green fw-semibold text-decoration-none"
                      onClick={() => setTaxesExpanded((s) => !s)}
                      aria-expanded={taxesExpanded}
                    >
                      Taxes & fees 
                      <FontAwesomeIcon
                        icon={taxesExpanded ? faChevronUp : faChevronDown}
                        className="ms-1"
                        style={{ fontSize: "0.85rem" }}
                      />
                    </button>

                    <div className="d-flex justify-content-between">
                      <div></div>
                      <div className="fw-bold">{formatPrice(taxes + processingFee + platformFee)}</div>
                    </div>
                  </div>
                  <div>
                    {taxesExpanded && (
                      <div className="mt-2 small text-mute ps-2">
                        <div className="d-flex justify-content-between">
                          <div>Taxes</div>
                          <div>{formatPrice(taxes)}</div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div>Credit card processing fee</div>
                          <div>{formatPrice(processingFee)}</div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <div>Online platform fee</div>
                          <div>{formatPrice(platformFee)}</div>
                        </div>
                        <div className="mt-2 text-mute">
                          Our online provider charges a small fee. This helps cover costs related to your order including 24/7 support.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-2 d-flex justify-content-between">
                  <div>Tip</div>
                  <div className="fw-bold">{formatPrice(tipAmount)}</div>
                </div>

                <hr />

                <h4 className="text-end font-family-body">
                  Total: <span className="fw-bold">{formatPrice(total)}</span>
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

      {/* Custom tip modal */}
      <CustomTipModal
        show={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        subtotal={subtotal}
        initialAmount={customTipValue ? Number(customTipValue) : 0}
        onSave={(amount) => handleSaveCustomTip(amount)}
      />
    </section>
  );
}
