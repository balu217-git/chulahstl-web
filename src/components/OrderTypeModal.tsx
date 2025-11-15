"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import Address from "@/components/Address";
import AddressPicker, { SelectedPlace } from "@/components/AddressPicker";
import TimePickerModal from "@/components/TimePickerModal";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
}

const DEFAULT_ASAP_MINUTES = 50; // used for display (estimate window)

/** Local extension of SelectedPlace for optional Google properties we rely on */
interface LocalSelectedPlace extends Partial<SelectedPlace> {
  open_now?: boolean;
  timeZoneId?: string;
  canDeliver?: boolean;
}

/** Shape of metadata we persist */
type OrderTypeTag = "ASAP" | "SCHEDULED";
interface OrderMetadata {
  type: OrderTypeTag;
  aptSuite?: string | null;
  instructions?: string | null;
  address?: string | null;
  timeIso?: string | null;
  updatedAt?: string;
}

/**
 * Optional subset of your CartContext that this component may call if present.
 * We avoid 'any' by defining an interface and using a type assertion to it.
 */
interface CartContextOptional {
  orderMode?: "pickup" | "delivery";
  setOrderMode?: (mode: "pickup" | "delivery") => void;
  address?: string | null;
  setAddress?: (addr: string | null) => void;
  deliveryTime?: string | null;
  setDeliveryTime?: (iso: string | null) => void;
  setOrderConfirmed?: (b: boolean) => void;
  addressPlace?: SelectedPlace | null;
  setAddressPlace?: (p: SelectedPlace | null) => void;
  setOrderMetadata?: (meta: OrderMetadata | null) => void;
  setOrderType?: (t: OrderTypeTag) => void;
  setDeliveryNotes?: (notes: { aptSuite?: string | null; instructions?: string | null }) => void;
}

export default function OrderTypeModal({ show, onClose }: OrderTypeModalProps) {
  // get the cart context and treat it as the optional shape
  const rawCart = useCart();
  const cart = rawCart as unknown as CartContextOptional;

  // destructure safely (may be undefined)
  const orderMode = rawCart.orderMode ?? "delivery";
  const setOrderMode = rawCart.setOrderMode;
  const address = rawCart.address ?? "";
  const setAddress = rawCart.setAddress;
  const deliveryTime = rawCart.deliveryTime ?? "";
  const setDeliveryTime = rawCart.setDeliveryTime;
  const setOrderConfirmed = rawCart.setOrderConfirmed;
  const addressPlace = rawCart.addressPlace ?? null;
  const setAddressPlace = rawCart.setAddressPlace;

  // Modal-local drafts
  const [draftAddress, setDraftAddress] = useState<string>(address || "");
  const [draftAddressPlace, setDraftAddressPlace] = useState<LocalSelectedPlace | null>(
    addressPlace ? (addressPlace as LocalSelectedPlace) : null
  );
  const [draftDeliveryTime, setDraftDeliveryTime] = useState<string>(deliveryTime || "");

  // Delivery details (persisted to CartContext via setDeliveryNotes)
  const [aptSuite, setAptSuite] = useState<string>("");
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>("");

  // TimePicker control + opening hours (weekday_text)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);
  const [fetchedOpenNow, setFetchedOpenNow] = useState<boolean | null>(null);

  // What flow opened the time picker — "pickup" or "delivery"
  const [timePickerFor, setTimePickerFor] = useState<"pickup" | "delivery" | null>(null);

  // Helper: normalize LocalSelectedPlace -> SelectedPlace (guarantee canDeliver boolean)
  function normalizeToSelectedPlace(p?: LocalSelectedPlace | null): SelectedPlace | null {
    if (!p) return null;
    const canDeliverValue = typeof p.canDeliver === "boolean" ? p.canDeliver : true;
    return { ...(p as SelectedPlace), canDeliver: canDeliverValue } as SelectedPlace;
  }

  // Initialize apt/instructions from context when modal opens (preferred over sessionStorage direct read)
  useEffect(() => {
    if (!show) return;
    setDraftAddress(address || "");
    setDraftAddressPlace(addressPlace ? (addressPlace as LocalSelectedPlace) : null);
    setDraftDeliveryTime(deliveryTime || "");

    // use cart deliveryNotes if available
    if ((rawCart.deliveryNotes?.aptSuite ?? null) !== null) {
      setAptSuite(rawCart.deliveryNotes!.aptSuite ?? "");
    } else {
      setAptSuite("");
    }
    if ((rawCart.deliveryNotes?.instructions ?? null) !== null) {
      setDeliveryInstructions(rawCart.deliveryNotes!.instructions ?? "");
    } else {
      setDeliveryInstructions("");
    }

    // Fetch opening hours (same as before)
    (async () => {
      try {
        const res = await fetch("/api/google-reviews");
        if (!res.ok) {
          setWeekdayText(null);
          setFetchedOpenNow(null);
          return;
        }
        const j = await res.json();
        setWeekdayText(j?.opening_hours?.weekday_text || null);
        if (typeof j?.opening_hours?.open_now === "boolean") {
          setFetchedOpenNow(j.opening_hours.open_now);
        } else {
          setFetchedOpenNow(null);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch opening hours:", err);
        setWeekdayText(null);
        setFetchedOpenNow(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Propagate edits immediately into context deliveryNotes so CheckoutPage sees updates
  useEffect(() => {
    if (typeof cart.setDeliveryNotes === "function") {
      cart.setDeliveryNotes({ aptSuite: aptSuite || null, instructions: deliveryInstructions || null });
    } else {
      // fallback: if cart doesn't have setDeliveryNotes, try using setOrderMetadata to store notes
      if (typeof cart.setOrderMetadata === "function") {
        cart.setOrderMetadata({
          type: (rawCart.orderType as OrderTypeTag) ?? "ASAP",
          aptSuite: aptSuite || null,
          instructions: deliveryInstructions || null,
          address: draftAddress || null,
          timeIso: draftDeliveryTime || null,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aptSuite, deliveryInstructions]);

  // If the selected place becomes non-deliverable, clear apt/instructions
  useEffect(() => {
    if (draftAddressPlace?.canDeliver === false) {
      setAptSuite("");
      setDeliveryInstructions("");
    }
  }, [draftAddressPlace?.canDeliver]);

  const handleModeChange = (mode: "pickup" | "delivery") => {
    if (typeof setOrderMode === "function") setOrderMode(mode);
  };

  const handleClearDraft = () => {
    setDraftAddress("");
    setDraftAddressPlace(null);
    setAptSuite("");
    setDeliveryInstructions("");
    try {
      sessionStorage.removeItem("orderMetadata");
    } catch {
      /* ignore */
    }
    // Also clear context delivery notes
    if (typeof cart.setDeliveryNotes === "function") {
      cart.setDeliveryNotes({ aptSuite: null, instructions: null });
    }
    if (typeof cart.setOrderMetadata === "function") {
      cart.setOrderMetadata(null);
    }
  };

  // confirm button disabled logic (used for schedule button enabling)
  const canConfirmDelivery = (): boolean => {
    const hasText = draftAddress.trim().length > 0;
    if (!hasText) return false;
    if (draftAddressPlace) return draftAddressPlace.canDeliver !== false;
    return true;
  };

  // ---------- Determine place open state ----------
  const placeOpenNow = useMemo(() => {
    if (typeof draftAddressPlace?.open_now === "boolean") return draftAddressPlace.open_now;
    if (typeof fetchedOpenNow === "boolean") return fetchedOpenNow;
    if (!weekdayText || weekdayText.length === 0) return false;

    const now = draftAddressPlace?.timeZoneId
      ? new Date(new Date().toLocaleString("en-US", { timeZone: draftAddressPlace.timeZoneId }))
      : new Date();

    const jsDay = now.getDay(); // 0..6
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    const todayLine = weekdayText[idx] || "";

    if (/closed/i.test(todayLine)) return false;
    return /(\d{1,2}:\d{2}\s?[APMapm]+)/.test(todayLine);
  }, [draftAddressPlace, fetchedOpenNow, weekdayText]);

  // Persist order metadata wrapper (ensures context is updated)
  function persistOrderMetadata(meta: OrderMetadata) {
    try {
      const merged: OrderMetadata = { ...(meta as OrderMetadata), updatedAt: new Date().toISOString() };
      if (typeof cart.setOrderMetadata === "function") {
        cart.setOrderMetadata(merged);
      }
      if (typeof cart.setOrderType === "function") {
        cart.setOrderType(merged.type);
      }
      if (typeof cart.setDeliveryNotes === "function") {
        cart.setDeliveryNotes({ aptSuite: merged.aptSuite ?? null, instructions: merged.instructions ?? null });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Could not persist order metadata:", e);
    }
  }

  // ---------- Schedule / ASAP flow ----------
  const openScheduleFlow = (forMode: "pickup" | "delivery") => {
    setTimePickerFor(forMode);

    if (forMode === "delivery") {
      const deliverable = draftAddress.trim().length > 0 && draftAddressPlace?.canDeliver !== false;
      if (!deliverable) return;

      // commit address immediately so scheduling UI can rely on cart state
      if (typeof setAddress === "function") setAddress(draftAddress);
      const normalized = normalizeToSelectedPlace(draftAddressPlace);
      if (typeof setAddressPlace === "function") setAddressPlace(normalized);
      try {
        sessionStorage.setItem("deliveryAddress", draftAddress || "");
      } catch {
        /* ignore */
      }
    }

    onClose();
    setTimeout(() => setShowTimePicker(true), 120);
  };

  // unified ASAP handler for pickup & delivery (now stored as exact current time)
  const handleASAP = (forMode: "pickup" | "delivery") => {
    if (forMode === "delivery") {
      const deliverable = draftAddress.trim().length > 0 && draftAddressPlace?.canDeliver !== false;
      if (!deliverable) return; // can't ASAP without deliverable address
      // commit address
      if (typeof setAddress === "function") setAddress(draftAddress);
      const normalized = normalizeToSelectedPlace(draftAddressPlace);
      if (typeof setAddressPlace === "function") setAddressPlace(normalized);
      try {
        sessionStorage.setItem("deliveryAddress", draftAddress || "");
      } catch {
        /* ignore */
      }
    } else {
      // pickup: ensure place is open
      if (!placeOpenNow) return;
    }

    // Save exact current time for ASAP
    const nowIso = new Date().toISOString();
    if (typeof setDeliveryTime === "function") setDeliveryTime(nowIso);
    setDraftDeliveryTime(nowIso);

    // Persist metadata: type ASAP + delivery details (only include notes if deliverable)
    persistOrderMetadata({
      type: "ASAP",
      aptSuite: draftAddressPlace?.canDeliver === true ? aptSuite || null : null,
      instructions: draftAddressPlace?.canDeliver === true ? deliveryInstructions || null : null,
      address: draftAddress || null,
      timeIso: nowIso,
    });

    // Optionally mark order confirmed in cart
    if (typeof setOrderConfirmed === "function") setOrderConfirmed(true);

    // Close modal
    onClose();
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setTimePickerFor(null);
  };

  // Called when user picks a scheduled time in the TimePickerModal
  const onTimePicked = (iso: string) => {
    if (typeof setDeliveryTime === "function") setDeliveryTime(iso);
    setDraftDeliveryTime(iso);
    setShowTimePicker(false);
    setTimePickerFor(null);

    // Persist metadata as scheduled (only include notes if deliverable)
    persistOrderMetadata({
      type: "SCHEDULED",
      aptSuite: draftAddressPlace?.canDeliver === true ? aptSuite || null : null,
      instructions: draftAddressPlace?.canDeliver === true ? deliveryInstructions || null : null,
      address: draftAddress || null,
      timeIso: iso,
    });

    // Optionally mark order confirmed in cart (you can change this behavior)
    if (typeof setOrderConfirmed === "function") setOrderConfirmed(true);
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered backdrop="static">
        <Modal.Header closeButton className="text-brand-green">
          <Modal.Title className="fw-bold text-brand-green">Confirm Order Type</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-brand-green">
          <div className="btn-group mb-4 w-100">
            {(["pickup", "delivery"] as const).map((type) => (
              <Button
                key={type}
                variant={orderMode === type ? "dark" : "outline-dark"}
                onClick={() => handleModeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {orderMode === "pickup" && <Address fontSize="fs-5" />}

          {orderMode === "delivery" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-dark">Delivery Address</Form.Label>
                <AddressPicker
                  value={draftAddress}
                  initialPlace={normalizeToSelectedPlace(draftAddressPlace) ?? undefined}
                  onChange={(val: string) => setDraftAddress(val)}
                  onPlaceSelect={(place: SelectedPlace | null) => {
                    setDraftAddressPlace(place ? (place as LocalSelectedPlace) : null);
                    // also update context addressPlace immediately so other UI can use it
                    if (typeof setAddressPlace === "function") {
                      setAddressPlace(place ?? null);
                    }
                  }}
                />
              </Form.Group>

              {/* Show additional delivery fields only when address is deliverable */}
              {draftAddressPlace?.canDeliver === true && (
                <>
                  <div className="col-12 mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-dark">Apt / Suite / Floor</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Apt, Suite or Floor (optional)"
                        value={aptSuite}
                        onChange={(e) => setAptSuite(e.target.value)}
                        className="form-control"
                      />
                    </Form.Group>
                  </div>

                  <div className="col-12 mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-dark">Delivery instructions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Leave at door, call on arrival, etc. (optional)"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="form-control"
                      />
                    </Form.Group>
                  </div>
                </>
              )}

              {draftAddressPlace?.canDeliver === true && (
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-dark">Delivery From</Form.Label>
                  <Address fontSize="fs-6" />
                </Form.Group>
              )}

              {draftAddressPlace?.canDeliver === false && (
                <div className="mt-2 alert alert-danger small">This address is outside our delivery area.</div>
              )}

              <div className="d-grid gap-2 mt-4">
                {placeOpenNow && (
                  <Button
                    variant="danger"
                    className="py-2 w-100"
                    onClick={() => handleASAP("delivery")}
                    disabled={!canConfirmDelivery()}
                    title={canConfirmDelivery() ? `Deliver ASAP (~${DEFAULT_ASAP_MINUTES} min)` : undefined}
                  >
                    Deliver ASAP ({DEFAULT_ASAP_MINUTES} min)
                  </Button>
                )}

                <Button
                  className="py-2 btn-brand-green w-100 fw-semibold border border-brand-green"
                  onClick={() => openScheduleFlow("delivery")}
                  disabled={!canConfirmDelivery()}
                >
                  Schedule delivery
                </Button>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="text-brand-green d-flex gap-2">
          {orderMode === "delivery" && draftAddress.trim().length > 0 && (
            <Button variant="outline-secondary" className="btn-sm" onClick={handleClearDraft}>
              Clear address & notes
            </Button>
          )}

          {orderMode === "pickup" && (
            <>
              <Button
                variant="danger"
                className="py-2 w-100"
                onClick={() => handleASAP("pickup")}
                disabled={!placeOpenNow}
                title={placeOpenNow ? `Pickup ASAP (~${DEFAULT_ASAP_MINUTES} min)` : undefined}
              >
                Pickup ASAP ({DEFAULT_ASAP_MINUTES} min)
              </Button>
              <Button
                className="py-2 btn-brand-green w-100 fw-semibold border border-brand-green"
                onClick={() => openScheduleFlow("pickup")}
              >
                Schedule Pickup
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <TimePickerModal
        show={showTimePicker}
        onClose={closeTimePicker}
        mode={timePickerFor ?? (orderMode === "pickup" ? "pickup" : "delivery")}
        weekdayText={weekdayText}
        timeZone={draftAddressPlace?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago"}
        slotMinutes={15}
        daysAhead={9}
        onConfirm={onTimePicked}
        asapEstimateMinutes={DEFAULT_ASAP_MINUTES}
      />
    </>
  );
}
