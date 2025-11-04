"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const id = searchParams.get("ID");
  const orderId = searchParams.get("orderId");
  const txFromUrl = searchParams.get("transactionId");

  const [transactionId, setTransactionId] = useState<string | null>(txFromUrl || null);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState("Finalizing your order...");

  useEffect(() => {
    let mounted = true;

    async function fetchFinal() {
      if (!orderId) {
        setMessage("Missing order information.");
        return;
      }

      try {
        const res = await fetch(`/api/square/get-transaction-id?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (!mounted) return;

        if (data?.success) {
          setTransactionId(data.transactionId || transactionId);
          setStatus(data.status || "UNKNOWN");
          setMessage("Payment confirmed. Thank you!");
          try {
            clearCart();
          } catch (e) {
            console.warn("clearCart failed", e);
          }
        } else {
          setMessage("Payment found but details are not ready. Please wait a moment or contact support.");
          setStatus("PENDING");
        }
      } catch (err) {
        console.error("Error fetching final payment:", err);
        setMessage("Error verifying payment. Contact support if you were charged.");
        setStatus("UNKNOWN");
      }
    }

    fetchFinal();

    return () => {
      mounted = false;
    };
  }, [orderId, clearCart]);

  return (
    <section
      className="hero bg-brand-light text-center d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="bg-white rounded-4 shadow p-md-5 p-3 col-md-9">
            <div className="hero-content text-center">
              <h1 className="display-6 fw-semibold mb-4">Payment Successful</h1>
              <p className="text-gray-700 mb-4">{message}</p>
            </div>

            <div className="alert alert-success">
              <div><strong>Order ID:</strong> {id || "—"}</div>
              <div><strong>Square Order ID:</strong> {orderId || "—"}</div>
              <div><strong>Transaction ID:</strong> {transactionId || "—"}</div>
              <div><strong>Payment Status:</strong> {status || "—"}</div>
            </div>

            <div className="mt-5 flex justify-center gap-3">
              <button onClick={() => router.push("/")} className="btn btn-wide btn-brand-orange">
                Back to store
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
