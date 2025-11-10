"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";

interface CartIconProps {
  mode?: "page" | "drawer";
  href?: string;
  onOpenDrawer?: () => void; // ✅ add callback
  className?: string;
}

export default function CartIcon({
  mode = "page",
  href = "/cart",
  onOpenDrawer,
  className = "",
}: CartIconProps) {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const badge =
    totalItems > 0 ? (
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {totalItems}
      </span>
    ) : null;

  if (mode === "drawer") {
    return (
      <button
        type="button"
        className={`btn btn-link shadow-none p-0 border-0 position-relative ${className}`}
        onClick={onOpenDrawer} // ✅ controlled by React state
      >
        <FontAwesomeIcon
          icon={faShoppingCart}
          className="text-dark"
          style={{ fontSize: "24px" }}
        />
        {badge}
      </button>
    );
  }

  return (
    <a href={href} className={`position-relative ${className}`}>
      <FontAwesomeIcon
        icon={faShoppingCart}
        className="text-dark"
        style={{ fontSize: "24px" }}
      />
      {badge}
    </a>
  );
}
