"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface CartIconProps {
  mode?: "page" | "drawer"; // page = go to cart page, drawer = open offcanvas
  href?: string; // used if mode = "page"
  drawerTarget?: string; // used if mode = "drawer"
  className?: string;
}

export default function CartIcon({
  mode = "page",
  href = "/cart",
  drawerTarget = "#cartDrawer",
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

  // 🧭 Drawer Mode (Offcanvas trigger)
  if (mode === "drawer") {
    return (
      <button
        className={`btn btn-link shadow-none p-0 border-0 position-relative ${className}`}
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target={drawerTarget}
        aria-controls={drawerTarget.replace("#", "")}
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

  // 🧭 Page Mode (Normal link)
  return (
    <Link href={href} className={`position-relative ${className}`}>
      <FontAwesomeIcon
        icon={faShoppingCart}
        className="text-dark"
        style={{ fontSize: "24px" }}
      />
      {badge}
    </Link>
  );
}
