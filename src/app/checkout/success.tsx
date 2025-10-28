"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("Verifying payment...");
  const { clearCart } = useCart();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus("Invalid Order ID");
        return;
      }

      try {
        // 1️⃣ Call API to mark order as paid
        const res = await fetch("/api/update-order-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentStatus: "paid",
          }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("Payment successful! Your order is confirmed 🎉");
          clearCart(); // 2️⃣ Empty cart after success
        } else {
          setStatus("Order update failed: " + data.message);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("Something went wrong while verifying payment.");
      }
    };

    verifyPayment();
  }, [orderId, clearCart]);

  return (
    <section className="info bg-brand-light py-5">
      <div className="container text-center">
        <h2 className="fw-bold mb-4">Order Status</h2>
        <p className="fs-5 text-brand-green">{status}</p>

        <a href="/" className="btn btn-brand-orange mt-4">
          Back to Home
        </a>
      </div>
    </section>
  );
}
