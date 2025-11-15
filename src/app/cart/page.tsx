"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";


export default function CartDrawer() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();

  if (cart.length === 0)
    return (
      // <section className="info bg-brand-light">
      //     <div className="text-center py-5">
      //       <p className="fw-semibold">Your cart is empty.</p>
      //     </div>
      // </section>

      <section className="hero bg-brand-light text-center d-flex align-items-center justify-content-center"
        style={{
          minHeight: "80vh"
        }}
      >
        <div className="container">
            <div className="hero-content">
                <h1 className="fw-bold text-dark mb-3 fs-2">Your cart is empty.</h1>
                {/* <p className="text-muted mb-4">
                  Our website is getting a delicious makeover. Stay tuned!
                </p> */}
            </div>
        </div>
    </section>
    );

  return (
    <section className="hero bg-brand-light"
        style={{
          minHeight: "80vh"
        }}
      >
      <div className="container">
        <h2 className="fw-bold mb-4">Your Cart</h2>
        <div className="list-group mb-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="list-group-item d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-3">
                <Image
                  src={item.image || "/images/img-dish-icon-bg.webp"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded"
                />
                <div>
                  <h6 className="fw-semibold mb-2 font-family-body">{item.name}</h6>
                  <p className="mb-0">₹{item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary btn-cart btn-sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span>{item.quantity}</span>
                <button
                  className="btn btn-outline-secondary btn-cart btn-sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
                <button
                  className="btn btn-danger btn-cart btn-sm ms-2"
                  onClick={() => removeFromCart(item.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="font-family-body ">Total: <span className="fw-bold">₹{getTotalPrice().toFixed(2)}</span></h5>
          <div>
            <button className="btn btn-wide btn-outline-secondary me-2" onClick={clearCart}>
              Clear
            </button>
            <Link href="/checkout" className="btn btn-wide btn-brand-green">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
