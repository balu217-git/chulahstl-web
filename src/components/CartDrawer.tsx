"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function CartDrawer() {
  const { cart, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");

  return (
    <>
    <div className="offcanvas offcanvas-end" tabIndex={-1} id="cartDrawer" aria-labelledby="cartDrawerLabel">
      {/* Header */}
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="cartDrawerLabel">
          Order Details
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      {/* Body */}
      <div className="offcanvas-body d-flex flex-column">
        {/* Toggle: Pickup / Delivery */}
        <div className="d-flex justify-content-center mb-3">
          <div className="btn-group w-100 rounded-pill shadow-sm" role="group" aria-label="Pickup or Delivery">
            <input
              type="radio"
              className="btn-check"
              name="orderMode"
              id="pickup"
              checked={mode === "pickup"}
              onChange={() => setMode("pickup")}
            />
            <label className="btn btn-outline-dark rounded-start-pill" htmlFor="pickup">
              Pickup
            </label>

            <input
              type="radio"
              className="btn-check"
              name="orderMode"
              id="delivery"
              checked={mode === "delivery"}
              onChange={() => setMode("delivery")}
            />
            <label className="btn btn-outline-dark rounded-end-pill" htmlFor="delivery">
              Delivery
            </label>
          </div>
        </div>

        {/* Scrollable Cart Body */}
        <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: "60vh" }}>
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <p className="fw-semibold">Your cart is empty.</p>
            </div>
          ) : (
            <>
              {/* Store Info */}
              <div className="border-bottom pb-3 mb-3">
                <h5 className="mb-1 fw-semibold text-dark">Chesterfield</h5>
                <small className="text-muted d-block mb-1">
                  <i className="bi bi-clock me-1"></i> Opens 11:00 AM CDT
                </small>
                <small className="text-muted d-block">
                  17392 Chesterfield Airport Rd
                </small>
              </div>

              {/* Cart Items */}
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <Image src={item.image || "/images/img-dish-icon-bg.webp"}
                      alt={item.title}
                      width={60}
                      height={60}
                      className="rounded"
                    />
                    <div>
                      <p className="mb-1 fw-semibold">{item.title}</p>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-cart btn-outline-secondary btn-sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span>{item.quantity}</span>
                        <button className="btn btn-cart btn-outline-secondary btn-sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="fw-bold mb-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      className="btn btn-sm btn-link text-danger p-0 shadow-none"
                      onClick={() => removeFromCart(item.id)}
                    >
                     <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-top pt-3 mt-auto">
          {cart.length > 0 && (
            <>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-semibold">Subtotal</span>
                <span className="fw-bold">₹{getTotalPrice().toFixed(2)}</span>
              </div>


              <button
                type="button"
                className="btn btn-wide btn-brand-orange w-100 mb-2"
                data-bs-toggle="modal"
                data-bs-target="#scheduleModal"
              >
                Schedule {mode === "pickup" ? "Pickup" : "Delivery"}
              </button>



              <button type="button" className="btn btn-outline-secondary w-100 rounded-pill" onClick={clearCart}>
                Clear Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>


    {/* Schedule Modal */}
<div
  className="modal fade"
  id="scheduleModal"
  tabIndex={-1}
  aria-labelledby="scheduleModalLabel"
  aria-hidden="true"
>
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title fw-bold" id="scheduleModalLabel">
          Schedule {mode === "pickup" ? "Pickup" : "Delivery"}
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>

      <div className="modal-body">
        <div className="mb-3">
          <label htmlFor="pickupDate" className="form-label">
            Select Date
          </label>
          <input
            type="date"
            className="form-control"
            id="pickupDate"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="pickupTime" className="form-label">
            Select Time
          </label>
          <input type="time" className="form-control" id="pickupTime" />
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Cancel
        </button>
        <button type="button" className="btn btn-primary">
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>

</>

  );
}
