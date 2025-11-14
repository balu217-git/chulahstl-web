// components/OrderModeAddress.tsx
"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faTaxi } from "@fortawesome/free-solid-svg-icons";
import { formatDateTimeForTZ } from "@/lib/formatDateTime";
import type { SelectedPlace } from "@/components/AddressPicker";

interface OrderModeAddressProps {
  className?: string;
  onAddressSelect?: () => void; // opens OrderTypeModal
  onTimeSelect?: () => void; // opens TimePickerModal
}

const DEFAULT_ASAP_MINUTES = 50;
const ASAP_TOLERANCE_MINUTES = 3;

function isAsapIso(iso?: string) {
  if (!iso) return false;
  const ts = new Date(iso).getTime();
  const target = Date.now() + DEFAULT_ASAP_MINUTES * 60_000;
  const diff = Math.abs(ts - target) / 60000;
  return diff <= ASAP_TOLERANCE_MINUTES;
}

export default function OrderModeAddress({
  className = "",
  onAddressSelect,
  onTimeSelect,
}: OrderModeAddressProps) {
  const { orderMode, address, deliveryTime, addressPlace } = useCart();

  // addressPlace may be a SelectedPlace (from context) or undefined/null.
  // Use a safe assertion to SelectedPlace so we can access timeZoneId without `any`.
  const ap = addressPlace as SelectedPlace | undefined | null;
  const timeZone = ap?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago";

  const timeLabel = (() => {
    if (!deliveryTime) return orderMode === "delivery" ? "Delivery time" : "Pickup time";

    if (isAsapIso(deliveryTime)) return `ASAP (${DEFAULT_ASAP_MINUTES} min)`;

    return formatDateTimeForTZ(deliveryTime, timeZone);
  })();

  return (
    <div className={`row gx-2 ${className}`}>
      {/* Address Box (DELIVERY ONLY) */}
      {orderMode === "delivery" && (
        <div className="col">
          <div
            className="overflow-hidden input-group border border-dark rounded-3"
            onClick={onAddressSelect}
            style={{ cursor: "pointer" }}
          >
            <span className="input-group-text pe-0 bg-transparent border border-light">
              <FontAwesomeIcon icon={faTaxi} />
            </span>
            <input
              className="form-control form-control-sm bg-transparent border-0"
              placeholder="Delivery address"
              value={address || ""}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Time Box (CLICK → OPEN TIME PICKER) */}
      <div className="col-auto">
        <div
          className="overflow-hidden input-group border border-dark rounded-3"
          onClick={onTimeSelect}
          style={{ cursor: "pointer" }}
        >
          <span className="input-group-text pe-0 bg-transparent border border-light">
            <FontAwesomeIcon icon={faClock} />
          </span>

          <div className="form-control form-control-sm bg-transparent border-0 d-flex align-items-center">
            <span className="small">{timeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
