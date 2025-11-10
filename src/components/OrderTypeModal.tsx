"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
}

export default function OrderTypeModal({ show, onClose }: OrderTypeModalProps) {
  const { orderMode, setOrderMode } = useCart();
  const [localMode, setLocalMode] = useState(orderMode || "pickup");
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  // ✅ Load saved data when modal opens
  useEffect(() => {
    if (show) {
      const savedAddress = sessionStorage.getItem("deliveryAddress");
      const savedTime = sessionStorage.getItem("deliveryTime");

      if (savedAddress) setAddress(savedAddress);
      if (savedTime) setDeliveryTime(savedTime);
    }
  }, [show]);

  // ✅ Save data to sessionStorage on Confirm
  const handleConfirm = () => {
    if (localMode === "delivery") {
      sessionStorage.setItem("deliveryAddress", address);
      sessionStorage.setItem("deliveryTime", deliveryTime);
    } else {
      sessionStorage.removeItem("deliveryAddress");
      sessionStorage.removeItem("deliveryTime");
    }

    setOrderMode(localMode as "pickup" | "delivery");
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Order Type</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="btn-group mb-4 w-100">
          {["pickup", "delivery"].map((type) => (
            <Button
              key={type}
              variant={localMode === type ? "dark" : "outline-dark"}
              onClick={() => setLocalMode(type as "pickup" | "delivery")}
            >
              {type}
            </Button>
          ))}
        </div>

        {localMode === "delivery" && (
          <>
            <Form.Group controlId="address" className="mb-3">
              <Form.Label>Enter delivery address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Search address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="deliveryTime">
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
        <Button variant="dark" onClick={handleConfirm} className="w-100">
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
