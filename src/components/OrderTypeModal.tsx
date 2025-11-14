// components/OrderTypeModal.tsx
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

const DEFAULT_ASAP_MINUTES = 50; // adjust if needed

/** Local extension of SelectedPlace for optional Google properties we rely on */
interface LocalSelectedPlace extends Partial<SelectedPlace> {
  open_now?: boolean;
  timeZoneId?: string;
  canDeliver?: boolean;
}

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
  const [draftAddressPlace, setDraftAddressPlace] = useState<LocalSelectedPlace | null>(
    addressPlace ? (addressPlace as LocalSelectedPlace) : null
  );
  const [draftDeliveryTime, setDraftDeliveryTime] = useState<string>(deliveryTime || "");

  // TimePicker control + opening hours (weekday_text)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  // prefer explicit open_now from API when available
  const [fetchedOpenNow, setFetchedOpenNow] = useState<boolean | null>(null);

  // What flow opened the time picker — "pickup" or "delivery"
  const [timePickerFor, setTimePickerFor] = useState<"pickup" | "delivery" | null>(null);

  // Helper: normalize LocalSelectedPlace -> SelectedPlace (guarantee canDeliver boolean)
  function normalizeToSelectedPlace(p?: LocalSelectedPlace | null): SelectedPlace | null {
    if (!p) return null;

    const canDeliverValue = typeof p.canDeliver === "boolean" ? p.canDeliver : true;

    // We assume other fields from p match SelectedPlace. Override canDeliver.
    return { ...(p as SelectedPlace), canDeliver: canDeliverValue } as SelectedPlace;
  }

  // Initialize drafts and fetch opening hours when the modal opens
  useEffect(() => {
    if (!show) return;

    setDraftAddress(address || "");
    setDraftAddressPlace(addressPlace ? (addressPlace as LocalSelectedPlace) : null);
    setDraftDeliveryTime(deliveryTime || "");

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
  }, [show, address, addressPlace, deliveryTime]);

  const handleModeChange = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
  };

  const handleClearDraft = () => {
    setDraftAddress("");
    setDraftAddressPlace(null);
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

  // ---------- Schedule / ASAP flow ----------
  const openScheduleFlow = (forMode: "pickup" | "delivery") => {
    setTimePickerFor(forMode);

    if (forMode === "delivery") {
      const deliverable = draftAddress.trim().length > 0 && draftAddressPlace?.canDeliver !== false;
      if (!deliverable) return;

      // commit address immediately so scheduling UI can rely on cart state
      setAddress(draftAddress);
      const normalized = normalizeToSelectedPlace(draftAddressPlace);
      if (typeof setAddressPlace === "function") setAddressPlace(normalized);
      sessionStorage.setItem("deliveryAddress", draftAddress || "");
    }

    onClose();
    setTimeout(() => setShowTimePicker(true), 120);
  };

  const handleDeliverASAP = () => {
    const deliverable = draftAddress.trim().length > 0 && draftAddressPlace?.canDeliver !== false;
    if (!deliverable) return;
    if (!placeOpenNow) return;

    setAddress(draftAddress);
    const normalized = normalizeToSelectedPlace(draftAddressPlace);
    if (typeof setAddressPlace === "function") setAddressPlace(normalized);
    sessionStorage.setItem("deliveryAddress", draftAddress || "");

    const asapDate = new Date(Date.now() + DEFAULT_ASAP_MINUTES * 60_000);
    setDeliveryTime(asapDate.toISOString());
    onClose();
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setTimePickerFor(null);
  };

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
            <Address fontSize="fs-5" />
          )}

          {orderMode === "delivery" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-dark">Delivery Address</Form.Label>
                <AddressPicker
                  value={draftAddress}
                  initialPlace={normalizeToSelectedPlace(draftAddressPlace) ?? undefined}
                  onChange={(val: string) => setDraftAddress(val)}
                  onPlaceSelect={(place: SelectedPlace | null) => {
                    // Accept null from picker; store draft as LocalSelectedPlace | null
                    setDraftAddressPlace(place ? (place as LocalSelectedPlace) : null);
                  }}
                />
              </Form.Group>

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
