// components/OrderTypeModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import PlaceHeader from "@/components/PlaceHeader";
import AddressDistance, { SelectedPlace } from "@/components/AddressDistance";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
}

export default function OrderTypeModal({ show, onClose }: OrderTypeModalProps) {
  // useCart is strongly typed in your CartContext; do NOT cast to `any`
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

  // Local drafts (modal-local)
  const [draftAddress, setDraftAddress] = useState<string>(address || "");
  const [draftAddressPlace, setDraftAddressPlace] = useState<SelectedPlace | null>(
    (addressPlace as unknown as SelectedPlace) || null
  );

  // When modal opens, (re)initialize drafts from context
  useEffect(() => {
    if (show) {
      setDraftAddress(address || "");
      setDraftAddressPlace((addressPlace as unknown as SelectedPlace) || null);
    }
  }, [show, address, addressPlace]);

  const handleModeChange = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
  };

  const handleConfirm = () => {
    if (orderMode === "delivery") {
      // commit drafts to context (and sessionStorage via CartContext effects)
      setAddress(draftAddress);
      setAddressPlace && setAddressPlace(draftAddressPlace);
      sessionStorage.setItem("deliveryAddress", draftAddress || "");
    }
    setOrderConfirmed(true);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="text-brand-green">
        <Modal.Title className="fw-bold text-brand-green">Confirm Order Type</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-brand-green">
        <div className="btn-group mb-4 w-100">
          {["pickup", "delivery"].map((type) => (
            <Button
              key={type}
              variant={orderMode === type ? "dark" : "outline-dark"}
              onClick={() => handleModeChange(type as "pickup" | "delivery")}
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
              <Form.Control
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
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
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-dark">Preferred Delivery Time</Form.Label>
              <Form.Control
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-semibold text-dark">Delivery From</Form.Label>
              <PlaceHeader fontSize="fs-6" />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="text-brand-green">
        <Button
          variant="dark"
          className="w-100 fw-semibold"
          onClick={handleConfirm}
          disabled={orderMode === "delivery" && draftAddress.trim().length === 0}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
