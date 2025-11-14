"use client";

import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useCart } from "@/context/CartContext";

interface OrderModeSelectorProps {
  onAddressSelect?: () => void;
}

export default function OrderModeSelector({ onAddressSelect }: OrderModeSelectorProps) {
  const { orderMode, setOrderMode } = useCart();
  const [localMode, setLocalMode] = useState<"pickup" | "delivery">(orderMode);

  useEffect(() => {
    if (orderMode !== localMode) setLocalMode(orderMode);
  }, [orderMode, localMode]);

  const handleClick = (mode: "pickup" | "delivery") => {
    setLocalMode(mode);
    setOrderMode(mode);
    if (mode === "delivery" && onAddressSelect) onAddressSelect();
  };

  return (
    <div className="btn-group">
      {["pickup", "delivery"].map((type) => (
        <Button className="btn-sm"
          key={type}
          variant={localMode === type ? "dark" : "outline-dark"}
          onClick={() => handleClick(type as "pickup" | "delivery")}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      ))}
    </div>
  );
}
