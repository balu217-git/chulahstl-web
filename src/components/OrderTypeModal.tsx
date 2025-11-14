// components/OrderTypeModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import PlaceHeader from "@/components/PlaceHeader";
import AddressPicker, { SelectedPlace } from "@/components/AddressPicker";
import TimePickerModal from "@/components/TimePickerModal";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
}

const DEFAULT_ASAP_MINUTES = 50; // adjust if needed

export default function OrderTypeModal({ show, onClose }: OrderTypeModalProps) {
  const {
    orderMode,
    setOrderMode,
    address,
    setAddress,
    deliveryTime,
    setDeliveryTime,
    setOrderConfirmed,
    addressPlace,
    setAddressPlace,
  } = useCart();

  // Modal-local drafts
  const [draftAddress, setDraftAddress] = useState<string>(address || "");
  const [draftAddressPlace, setDraftAddressPlace] = useState<SelectedPlace | null>(
    (addressPlace as unknown as SelectedPlace) || null
  );
  const [draftDeliveryTime, setDraftDeliveryTime] = useState<string>(deliveryTime || "");

  // TimePicker control + opening hours (weekday_text)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  // prefer explicit open_now from API when available
  const [fetchedOpenNow, setFetchedOpenNow] = useState<boolean | null>(null);

  // What flow opened the time picker — "pickup" or "delivery"
  const [timePickerFor, setTimePickerFor] = useState<"pickup" | "delivery" | null>(null);

  // Initialize drafts and fetch opening hours when the modal opens
  useEffect(() => {
    if (!show) return;
    setDraftAddress(address || "");
    setDraftAddressPlace((addressPlace as unknown as SelectedPlace) || null);
    setDraftDeliveryTime(deliveryTime || "");

    // fetch place opening_hours (optional) so we can decide ASAP visibility.
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
        // prefer explicit open_now if available from API
        if (typeof j?.opening_hours?.open_now === "boolean") {
          setFetchedOpenNow(j.opening_hours.open_now);
        } else {
          setFetchedOpenNow(null);
        }
      } catch (err) {
        console.error("Failed to fetch opening hours:", err);
        setWeekdayText(null);
        setFetchedOpenNow(null);
      }
    })();
  }, [show, address, addressPlace, deliveryTime]);

  const handleModeChange = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
  };

  const handleConfirm = () => {
    // commit modal-local drafts into CartContext
    if (orderMode === "delivery") {
      setAddress(draftAddress);
      if (typeof setAddressPlace === "function") setAddressPlace(draftAddressPlace);
      setDeliveryTime(draftDeliveryTime || "");
      sessionStorage.setItem("deliveryAddress", draftAddress || "");
    } else {
      // pickup
      setDeliveryTime(draftDeliveryTime || "");
    }
    setOrderConfirmed(true);
    onClose();
  };

  const handleClearDraft = () => {
    setDraftAddress("");
    setDraftAddressPlace(null);
  };

  // confirm button disabled logic
  const canConfirmDelivery = () => {
    const hasText = draftAddress.trim().length > 0;
    if (!hasText) return false;
    if (draftAddressPlace) return draftAddressPlace.canDeliver !== false;
    return true;
  };
  const confirmDisabled = orderMode === "delivery" ? !canConfirmDelivery() : false;

  // ---------- Determine place open state ----------
  // prefer draftAddressPlace.open_now if provided by AddressPicker,
  // otherwise prefer fetchedOpenNow (from /api/google-reviews),
  // otherwise fallback to parsing weekday_text (rare).
  const placeOpenNow = useMemo(() => {
    // 1) place object from AddressPicker (most reliable if available)
    const placeFlag = (draftAddressPlace as any)?.open_now;
    if (typeof placeFlag === "boolean") return placeFlag;

    // 2) fetched open_now
    if (typeof fetchedOpenNow === "boolean") return fetchedOpenNow;

    // 3) fallback: parse weekday_text (basic check — you already have weekdayText)
    if (!weekdayText || weekdayText.length === 0) return false;

    // Map Monday..Sunday (Google) -> JS day 0..6 (Sunday=0)
    const now = draftAddressPlace?.timeZoneId
      ? new Date(new Date().toLocaleString("en-US", { timeZone: draftAddressPlace.timeZoneId }))
      : new Date();
    const jsDay = now.getDay(); // 0..6
    // google weekday_text index mapping: Monday..Sunday => map to (i+1)%7
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    const todayLine = weekdayText[idx] || "";
    // quick check: if 'closed' present -> closed, else open
    if (/closed/i.test(todayLine)) return false;
    // if line contains a dash like "9:00 AM – 10:00 PM" assume open for simplicity
    return /(\d{1,2}:\d{2}\s?[APMapm]+)/.test(todayLine);
  }, [draftAddressPlace, fetchedOpenNow, weekdayText]);

  // ---------- Schedule / ASAP flow ----------
  const openScheduleFlow = (forMode: "pickup" | "delivery") => {
    setTimePickerFor(forMode);

    if (forMode === "delivery") {
      const deliverable = draftAddress.trim().length > 0 && draftAddressPlace?.canDeliver !== false;
      if (!deliverable) return;
      // commit address immediately so scheduling UI can rely on cart state
      setAddress(draftAddress);
      if (typeof setAddressPlace === "function") setAddressPlace(draftAddressPlace);
      sessionStorage.setItem("deliveryAddress", draftAddress || "");
    }

    onClose();
    // give parent a short moment to close modal; if your parent unmounts immediately,
    // consider lifting TimePicker into parent. This small timeout works for many flows.
    setTimeout(() => {
      setShowTimePicker(true);
    }, 120);
  };

  // ASAP handler: commit address and set delivery time to now + DEFAULT_ASAP_MINUTES
  const handleDeliverASAP = () => {
    // ensure deliverable
    const deliverable = draftAddress.trim().length > 0 && draftAddressPlace?.canDeliver !== false;
    if (!deliverable) return;
    // ensure place open now
    if (!placeOpenNow) return;

    // commit address & place immediately
    setAddress(draftAddress);
    if (typeof setAddressPlace === "function") setAddressPlace(draftAddressPlace);
    sessionStorage.setItem("deliveryAddress", draftAddress || "");

    // set delivery time to "now + DEFAULT_ASAP_MINUTES"
    const asapDate = new Date(Date.now() + DEFAULT_ASAP_MINUTES * 60_000);
    setDeliveryTime(asapDate.toISOString());
    // close modal (we do NOT mark order confirmed; scheduling only)
    onClose();
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setTimePickerFor(null);
  };

  // When time is picked, write directly into cart context
  const onTimePicked = (iso: string) => {
    setDeliveryTime(iso);
    setDraftDeliveryTime(iso);
    setShowTimePicker(false);
    setTimePickerFor(null);
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

          {orderMode === "pickup" && (
            <>
              <PlaceHeader fontSize="fs-5" />
            </>
          )}

          {orderMode === "delivery" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-dark">Delivery Address</Form.Label>
                <AddressPicker
                  value={draftAddress}
                  initialPlace={draftAddressPlace ?? undefined}
                  onChange={(val) => setDraftAddress(val)}
                  onPlaceSelect={(p) => setDraftAddressPlace(p)}
                />
              </Form.Group>
              {draftAddressPlace && draftAddressPlace.canDeliver === true && (
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-dark">Delivery From</Form.Label>
                  <PlaceHeader fontSize="fs-6" />
                </Form.Group>
               )}

              {draftAddressPlace && draftAddressPlace.canDeliver === false && (
                <div className="mt-2 alert alert-danger small">This address is outside our delivery area.</div>
              )}

              {/* ASAP + Schedule UI (ASAP first). Buttons enabled/disabled via canConfirmDelivery/placeOpenNow */}
              <div className="d-grid gap-2 mt-4">
                {placeOpenNow && (
                  <Button
                    variant="danger"
                    className="py-2 w-100"
                    onClick={handleDeliverASAP}
                    disabled={!canConfirmDelivery()}
                    title={canConfirmDelivery() ? `Deliver ASAP (~${DEFAULT_ASAP_MINUTES} min)` : undefined}
                  >
                    Deliver ASAP ({DEFAULT_ASAP_MINUTES} min)
                  </Button>
                )}

                <Button
                  variant="outline-dark"
                  className="py-2 w-100 fw-semibold"
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
            <Button variant="outline-secondary" onClick={handleClearDraft}>
              Clear address
            </Button>
          )}



          {/* If user is in pickup mode show schedule pickup button in footer */}
          {orderMode === "pickup" && (
            <Button
              variant="dark"
              className="flex-grow-1 fw-semibold"
              onClick={() => openScheduleFlow("pickup")}
            >
              Schedule Pickup
            </Button>
            
          )}
        </Modal.Footer>
      </Modal>

      {/* TimePicker Modal - opened after closing this modal. */}
      <TimePickerModal
        show={showTimePicker}
        onClose={closeTimePicker}
        mode={timePickerFor ?? (orderMode === "pickup" ? "pickup" : "delivery")}
        weekdayText={weekdayText}
        timeZone={draftAddressPlace?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago"}
        slotMinutes={15}
        daysAhead={9}
        onConfirm={onTimePicked}
      />
    </>
  );
}
