"use client";

import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faTaxi } from "@fortawesome/free-solid-svg-icons";

interface OrderModeAddressProps {
  className?: string;
  onDeliverySelect?: () => void;
}

export default function OrderModeAddress({
  className = "",
  onDeliverySelect,
}: OrderModeAddressProps) {
  const { orderMode, address, deliveryTime } = useCart();

  const handleClick = () => {
    if (onDeliverySelect) onDeliverySelect();
  };

  return (
    <div className={`row gx-2 ${className}`}>

      {/* Delivery Address - Only in delivery mode */}
      {orderMode === "delivery" && (
        <div className="col">
          <div
            className="overflow-hidden input-group border border-dark rounded-3"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <span className="input-group-text pe-0 bg-transparent border border-light">
              <FontAwesomeIcon icon={faTaxi} />
            </span>

            <input
              className="form-control form-control-sm bg-transparent border-0"
              placeholder="Delivery address"
              value={address}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Pickup Time */}
      <div className="col">
        <div className="overflow-hidden input-group border border-dark rounded-3">
          <span className="input-group-text pe-0 bg-transparent border border-light">
            <FontAwesomeIcon icon={faClock} />
          </span>

          <select className="form-select form-select-sm bg-transparent border-0" disabled>
            <option>
              {deliveryTime
                ? deliveryTime 
                : orderMode === "delivery"
                    ? "Delivery time"
                    : "Pickup time"
              }
            </option>
          </select>
        </div>
      </div>

    </div>
  );
}
