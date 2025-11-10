"use client";

import { Offcanvas, Button } from "react-bootstrap";
import OrderTypeModal from "@/components/OrderTypeModal";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";

interface CartDrawerProps {
  show?: boolean;
  onClose?: () => void;
}

export default function CartDrawer({ show, onClose }: CartDrawerProps) {
  const { cart, getTotalPrice, updateQuantity, removeFromCart, clearCart, orderMode, setOrderMode } =
    useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleOrderModeClick = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
    if (mode === "delivery") setShowOrderModal(true);
  };

  return (
    <>
      <Offcanvas show={show} onHide={onClose} placement="end" backdrop={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column justify-content-between h-100">
  <div className="cart-items flex-grow-1 overflow-auto">
    <div className="btn-group mb-4 w-100">
      {["pickup", "delivery"].map((type) => (
        <Button
          key={type}
          type="button"
          className={`btn ${
            orderMode === type
              ? "btn-dark"
              : "btn-outline-dark bg-transparent text-dark"
          }`}
          onClick={() => handleOrderModeClick(type as "pickup" | "delivery")}
        >
          {type}
        </Button>
      ))}
    </div>

    {cart.length === 0 ? (
      <div className="text-center py-5">
        <p>Your cart is empty.</p>
        <Link className="btn btn-brand-green" href="/menu">
          View Menu
        </Link>
      </div>
    ) : (
      cart.map((item) => (
        <div
          key={item.id}
          className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3"
        >
          <div className="d-flex align-items-center gap-3">
            <Image
              src={item.image || "/images/img-dish-icon-bg.webp"}
              alt={item.title}
              width={60}
              height={60}
              className="rounded"
            />
            <div>
              <p className="mb-1 fw-semibold">{item.title}</p>
              <div className="d-flex align-items-center gap-2">
                <Button
                  className="btn btn-cart btn-outline-secondary btn-sm btn-light"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <span>{item.quantity}</span>
                <Button
                  className="btn btn-cart btn-outline-secondary btn-sm btn-light"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>
            </div>
          </div>
          <div className="text-end">
            <p className="fw-bold mb-1">₹{(item.price * item.quantity).toFixed(2)}</p>
            <Button
              className="btn btn-sm btn-link text-danger p-0 shadow-none"
              onClick={() => removeFromCart(item.id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        </div>
      ))
    )}
  </div>

  {cart.length > 0 && (
    <div className="border-top pt-3 sticky-bottom bg-white">
      <div className="d-flex justify-content-between mb-3">
        <span>Subtotal</span>
        <span>₹{getTotalPrice().toFixed(2)}</span>
      </div>

      <Link href="/checkout" className="btn btn-brand-orange w-100 mb-2 rounded-pill">
        Checkout
      </Link>
      <Button
        className="btn btn-outline-secondary btn-light w-100 rounded-pill"
        onClick={clearCart}
      >
        Clear Cart
      </Button>
    </div>
  )}
</Offcanvas.Body>

      </Offcanvas>

      <OrderTypeModal show={showOrderModal} onClose={() => setShowOrderModal(false)} />
    </>
  );
}
