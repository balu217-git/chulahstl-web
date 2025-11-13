"use client";

import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import PlaceHeader from "@/components/PlaceHeader";
import AddressDistance from "@/components/AddressDistance";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
}

export default function OrderTypeModal({ show, onClose }: OrderTypeModalProps) {
  const { orderMode, setOrderMode, address, setAddress, deliveryTime, setDeliveryTime, setOrderConfirmed } =
    useCart();

  const handleModeChange = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
  };

  const handleConfirm = () => {
    if (orderMode === "delivery") {
      sessionStorage.setItem("deliveryAddress", address);
    }
    setOrderConfirmed(true); // ✅ mark confirmed for this mode
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-uppercase">Confirm Order Type</Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
            <PlaceHeader />
            <Form.Group className="mt-3">
              <Form.Label>Pickup Time</Form.Label>
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
              <Form.Label>Delivery Address</Form.Label>
              <AddressDistance
                value={address}
                onChange={(val) => setAddress(val)}
              />
            </Form.Group>


            <Form.Group>
              <Form.Label>Preferred Delivery Time</Form.Label>
              <Form.Control
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="dark"
          className="w-100 fw-semibold"
          onClick={handleConfirm}
          disabled={orderMode === "delivery" && address.trim().length === 0}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
