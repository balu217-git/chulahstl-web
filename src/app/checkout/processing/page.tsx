"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") ?? ""; // Square order ID
  const wpId = searchParams.get("ID") ?? ""; // WordPress post ID

  const [message, setMessage] = useState("Confirming your payment...");
  const [attempt, setAttempt] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setMessage("Missing order details. Please contact support.");
      return;
    }

    let mounted = true;
    const maxAttempts = 8;
    const baseDelay = 2500;

    async function checkStatus(retryCount = 0) {
      try {
        setAttempt(retryCount + 1);
        setMessage(`Checking payment status... (${retryCount + 1}/${maxAttempts})`);

        const res = await fetch(`/api/square/get-payment?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (!mounted) return;

        if (data?.success) {
          const status = (data.status || "").toUpperCase();
          const transactionId = data.transactionId || "";

          console.log("💳 Square payment check:", { status, transactionId });

          if (status === "COMPLETED" || status === "CAPTURED") {
            // ✅ Update WordPress order before redirecting
            try {
              await fetch("/api/update-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: wpId,
                  paymentId: transactionId,
                  orderId,
                  paymentStatus: "success",
                }),
              });
              console.log("✅ WordPress order updated successfully");
            } catch (wpErr) {
              console.warn("⚠️ Failed to update WordPress order:", wpErr);
            }

            setIsDone(true);
            const q = new URLSearchParams({ ID: wpId, orderId, transactionId });
            router.push(`/checkout/success?${q.toString()}`);
            return;
          }

          if (["FAILED", "CANCELED", "DECLINED"].includes(status)) {
            try {
              await fetch("/api/update-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: wpId,
                  paymentId: transactionId,
                  orderId,
                  paymentStatus: "failed",
                }),
              });
            } catch (wpErr) {
              console.warn("⚠️ Failed to update WordPress order:", wpErr);
            }

            setIsDone(true);
            const q = new URLSearchParams({ ID: wpId, orderId });
            router.push(`/checkout/failed?${q.toString()}`);
            return;
          }

          // Still pending
          setMessage(`Payment status: ${status}. Waiting for final confirmation...`);
        } else {
          setMessage(data?.message || "Waiting for Square to finish processing payment...");
        }

        // Retry logic
        if (retryCount < maxAttempts - 1) {
          const delay = baseDelay * (retryCount + 1);
          setTimeout(() => {
            if (mounted) checkStatus(retryCount + 1);
          }, delay);
        } else {
          // Too many attempts → fail
          setIsDone(true);
          const q = new URLSearchParams({ ID: wpId, orderId });
          router.push(`/checkout/failed?${q.toString()}&reason=timeout`);
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (!mounted) return;

        if (retryCount < maxAttempts - 1) {
          const delay = baseDelay * (retryCount + 1);
          setTimeout(() => {
            if (mounted) checkStatus(retryCount + 1);
          }, delay);
        } else {
          setIsDone(true);
          const q = new URLSearchParams({ ID: wpId, orderId });
          router.push(`/checkout/failed?${q.toString()}&reason=error`);
        }
      }
    }

    checkStatus(0);

    return () => {
      mounted = false;
    };
  }, [orderId, wpId, router]);

  return (

<section className="hero bg-brand-light text-center d-flex align-items-center justify-content-center" style={{
          minHeight: "80vh"
        }}>
      <div className="container">
      <div className="bg-white rounded-4 shadow p-md-5 p-3">
        <div className="hero-content text-center">
          <h1 className="display-6 fw-semibold mb-4">Almost done — confirming payment</h1>
            <p className="text-gray-700 mb-4">{message}</p>
        </div>

        {!isDone && (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full border-4 border-t-blue-600 animate-spin" />
            <div className="text-sm text-gray-500">Attempt {attempt}</div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          If this takes longer than a minute, we’ll keep checking for updates automatically.
        </div>
      </div>
    </div>
    </section>
  );
}
