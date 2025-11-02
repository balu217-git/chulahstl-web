"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Processing your payment...");

  const id = searchParams.get("ID"); // WordPress order ID
  const orderId = searchParams.get("orderId"); // Square order_id
  const transactionId = searchParams.get("transactionId"); // Square payment_id

  useEffect(() => {
    async function updateOrder() {
      if (!id || !orderId || !transactionId) {
        setMessage("Missing payment details.");
        return;
      }

      try {
        const res = await fetch("/api/update-order-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            paymentId: transactionId,
            orderId,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setMessage("✅ Payment successful! Your order has been updated.");
        } else {
          setMessage("⚠️ Failed to update order: " + data.message);
        }
      } catch (err) {
        console.error("Update Error:", err);
        setMessage("❌ Error updating order.");
      }
    }

    updateOrder();
  }, [id, orderId, transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Checkout Success</h1>
        <p className="mb-2 text-gray-600">{message}</p>

        <div className="text-sm mt-4 text-gray-500">
          <p><strong>Order ID:</strong> {orderId || "N/A"}</p>
          <p><strong>Payment ID:</strong> {transactionId || "N/A"}</p>
          <p><strong>Database ID:</strong> {id || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
