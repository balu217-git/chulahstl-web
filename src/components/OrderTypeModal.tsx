// components/OrderTypeModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import PlaceHeader from "@/components/PlaceHeader";
import AddressDistance, { SelectedPlace } from "@/components/AddressDistance";
import TimePickerModal from "@/components/TimePickerModal";
import PlaceTimePickerLauncher from "@/components/PlaceTimePickerLauncher";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
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
  const [draftAddressPlace, setDraftAddressPlace] = useState<SelectedPlace | null>(
    (addressPlace as unknown as SelectedPlace) || null
  );
  const [draftDeliveryTime, setDraftDeliveryTime] = useState<string>(deliveryTime || "");

  // TimePicker control + opening hours (weekday_text)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  // Initialize drafts and fetch opening hours when the modal opens
  useEffect(() => {
    if (!show) return;
    setDraftAddress(address || "");
    setDraftAddressPlace((addressPlace as unknown as SelectedPlace) || null);
    setDraftDeliveryTime(deliveryTime || "");

    // fetch place opening_hours.weekday_text (optional)
    (async () => {
      try {
        const res = await fetch("/api/google-reviews");
        if (!res.ok) {
          setWeekdayText(null);
          return;
        }
        const j = await res.json();
        const wd = j?.opening_hours?.weekday_text || null;
        setWeekdayText(wd);
      } catch (err) {
        console.error("Failed to fetch opening hours:", err);
        setWeekdayText(null);
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
        // store timezone in cart/context if you have a setter e.g. setTimeZone
        // setTimeZone?.(draftAddressPlace?.timeZoneId);
        sessionStorage.setItem("deliveryAddress", draftAddress || "");
      } else {
            // pickup: we still may want to set deliveryTime (used as pickup time)
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

  // TimePicker open/close + callback
  const openTimePicker = () => setShowTimePicker(true);
  const closeTimePicker = () => setShowTimePicker(false);

  // onConfirm from TimePicker stores into modal-local draft
  const onTimePicked = (iso: string) => {
    setDraftDeliveryTime(iso);
    setShowTimePicker(false);
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
              <Form.Group className="mt-3">
                <Form.Label className="small fw-semibold text-dark">Pickup Time</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={draftDeliveryTime ? new Date(draftDeliveryTime).toLocaleString() : ""}
                    placeholder="No time selected"
                    readOnly
                  />
                  <Button variant="outline-secondary" onClick={openTimePicker}>
                    Select time
                  </Button>
                </div>
              </Form.Group>
            </>
          )}

          {orderMode === "delivery" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-dark">Delivery Address</Form.Label>
                <AddressDistance
                  value={draftAddress}
                  initialPlace={draftAddressPlace ?? undefined}
                  onChange={(val) => setDraftAddress(val)}
                  onPlaceSelect={(p) => setDraftAddressPlace(p)}
                />
                {/* Option A: Manual launcher button (user clicks) */}
                {/* {draftAddressPlace?.place_id && (
                  <PlaceTimePickerLauncher placeId={draftAddressPlace.place_id} />
                )} */}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-dark">Preferred Delivery Time</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={draftDeliveryTime ? new Date(draftDeliveryTime).toLocaleString() : ""}
                    placeholder="No time selected"
                    readOnly
                  />
                  <Button variant="outline-secondary" onClick={openTimePicker} disabled={!draftAddress.trim()}>
                    Select time
                  </Button>
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label className="small fw-semibold text-dark">Delivery From</Form.Label>
                <PlaceHeader fontSize="fs-6" />
              </Form.Group>

              {draftAddressPlace && draftAddressPlace.canDeliver === false && (
                <div className="mt-2 alert alert-danger small">This address is outside our delivery area.</div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="text-brand-green d-flex gap-2">
          {orderMode === "delivery" && draftAddress.trim().length > 0 && (
            <Button variant="outline-secondary" onClick={handleClearDraft}>
              Clear address
            </Button>
          )}

          {/* footer button opens the TimePicker (schedule) */}
          <Button
            variant="dark"
            className="flex-grow-1 fw-semibold"
            onClick={openTimePicker}
            disabled={confirmDisabled}
          >
            {orderMode === "pickup" ? "Schedule Pickup" : "Schedule Delivery"}
          </Button>

          {/* Final commit */}
          <Button
            variant="secondary"
            onClick={handleConfirm}
            className="ms-2"
            disabled={orderMode === "delivery" && draftAddress.trim().length === 0}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* TimePicker Modal - gets weekdayText fetched earlier */}
      <TimePickerModal
  show={showTimePicker}
  onClose={closeTimePicker}
  mode={orderMode === "pickup" ? "pickup" : "delivery"}
  weekdayText={weekdayText}
  // prefer place timezone, fallback to app default
  timeZone={draftAddressPlace?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago"}
  slotMinutes={15}
  daysAhead={9}
  onConfirm={onTimePicked}
/>
    </>
  );
}
