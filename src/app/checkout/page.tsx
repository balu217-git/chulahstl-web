"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your cart is empty.");

    setLoading(true);

    try {
      const total = getTotalPrice();

      // 1️⃣ Create Order in WordPress first (status: pending)
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Guest User", // Later replace with actual logged-in user
          phone: "9999999999",
          items: cart,
          total,
          paymentStatus: "pending",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        console.error("Order creation failed:", orderData);
        alert("Failed to create order. Please try again.");
        return;
      }

      // 2️⃣ Get Square Payment Link
      const res = await fetch("/api/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items: cart,
          orderId: orderData.order.id, // pass WordPress order ID to Square
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        setPaymentUrl(data.checkoutUrl);
        window.location.href = data.checkoutUrl; // redirect to payment
      } else {
        alert("Failed to initialize payment.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return <p className="text-center py-5">Your cart is empty.</p>;

  return (
    <section className="info bg-brand-light">
      <div className="container py-5">
        <h2 className="fw-bold mb-4">Checkout</h2>
        <ul className="list-group mb-4">
          {cart.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between p-3">
              <span className="fw-semibold">
                {item.title} × <span className="fw-bold">{item.quantity}</span>
              </span>
              <span className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <h4>
          Total:{" "}
          <span className="font-family-body fw-bold">
            ₹{getTotalPrice().toFixed(2)}
          </span>
        </h4>

        <button
          className="btn btn-wide btn-brand-orange mt-4"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay with Square"}
        </button>

        {paymentUrl && (
          <p className="mt-3 text-muted">Redirecting to Square checkout...</p>
        )}
      </div>
    </section>
  );
}
