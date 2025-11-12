"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import { useAddressAndTime } from "@/hooks/useAddressAndTime";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";

interface OrderTypeModalProps {
  show: boolean;
  onClose: () => void;
}

const STORE_ADDRESS = "CHULAH INDIAN HEARTH & BAR, 16721 Main St, Wildwood, MO 63040, USA";
const STORE_LAT = -33.8688;
const STORE_LNG = 151.2195;

export default function OrderTypeModal({ show, onClose }: OrderTypeModalProps) {
  const {
    orderMode,
    setOrderMode,
    address,
    setAddress,
    deliveryTime,
    setDeliveryTime,
  } = useCart();

  const [localMode, setLocalMode] = useState<"pickup" | "delivery">("pickup");
  const [isValidAddress, setIsValidAddress] = useState(false);

  // 🌍 User geolocation
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        (err) => console.error("Location access denied:", err)
      );
    }
  }, []);

  // 🧭 Reverse geocode & time
  const { data: addressData, loading: locationLoading } = useAddressAndTime(lat, lng);

  // 🗺️ Google Places Autocomplete
  const { initAutocomplete, isLoaded } = usePlacesAutocomplete(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
  );

  useEffect(() => {
    if (isLoaded && localMode === "delivery") {
      initAutocomplete("deliveryAddressInput", (val) => setAddress(val));
    }
  }, [isLoaded, localMode, setAddress, initAutocomplete]);

  // 💾 Sync with global mode
  useEffect(() => {
    if (show && orderMode) setLocalMode(orderMode);
  }, [show, orderMode]);

  // ✅ Check if user within 10 km
  const isWithin10Km = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a)) <= 10;
  };

  useEffect(() => {
    if (localMode === "delivery" && lat && lng) {
      setIsValidAddress(isWithin10Km(STORE_LAT, STORE_LNG, lat, lng));
    } else {
      setIsValidAddress(false);
    }
  }, [lat, lng, localMode]);

  // 🕒 Format to U.S. 12-hour time (AM/PM)
  const formatUSTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  // Auto-fill delivery time
  useEffect(() => {
    if (addressData?.formattedTime) {
      const formatted = formatUSTime(addressData.formattedTime);
      setDeliveryTime(formatted);
    }
  }, [addressData, setDeliveryTime]);

  const isConfirmEnabled =
    localMode === "pickup"
      ? deliveryTime.trim().length > 0
      : isValidAddress && address.trim().length > 0 && deliveryTime.trim().length > 0;

  const handleConfirm = () => {
    setOrderMode(localMode);
    if (localMode === "delivery") sessionStorage.setItem("deliveryAddress", address);
    else sessionStorage.removeItem("deliveryAddress");
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Select Order Type</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Toggle Buttons */}
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

        {/* Pickup */}
        {localMode === "pickup" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Store Address</Form.Label>
              <Form.Control type="text" value={STORE_ADDRESS} readOnly plaintext />
            </Form.Group>

            <Form.Group>
              <Form.Label>Pickup Time (Local)</Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={formatUSTime(addressData?.formattedTime || "") || "Fetching time..."}
              />
            </Form.Group>
          </>
        )}

        {/* Delivery */}
        {localMode === "delivery" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Delivery Address</Form.Label>
              <Form.Control
                id="deliveryAddressInput"
                type="text"
                placeholder="Start typing your address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {address && !isValidAddress && (
                <small className="text-danger">
                  Address must be within 10 km of store.
                </small>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Detected Location</Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={
                  locationLoading
                    ? "Detecting your location..."
                    : addressData
                    ? `${addressData.city}, ${addressData.state} ${addressData.zip}`
                    : "Location not available"
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Preferred Delivery Time (Local)</Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={formatUSTime(addressData?.formattedTime || "") || "Fetching time..."}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="dark"
          className="w-100"
          onClick={handleConfirm}
          disabled={!isConfirmEnabled}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
