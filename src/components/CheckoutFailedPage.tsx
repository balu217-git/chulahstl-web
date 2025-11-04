"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const id = searchParams.get("ID");
  const reason = searchParams.get("reason") || null;

  const [message, setMessage] = useState("Your payment could not be completed.");

  useEffect(() => {
    if (reason === "timeout") {
      setMessage("Payment confirmation timed out. Please check your email or contact support.");
    } else if (reason === "error") {
      setMessage("There was an error confirming your payment. Please try again.");
    } else {
      setMessage("Your payment was not successful. You can retry payment or contact support.");
    }
  }, [reason]);

  const handleRetry = () => {
    router.push("/cart");
  };

  return (
    <section
      className="hero bg-brand-light text-center d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="bg-white rounded-4 shadow p-md-5 p-3 col-md-9">
            <div className="hero-content text-center">
              <h1 className="display-6 fw-semibold mb-4">Payment Problem</h1>
              <p className="text-gray-700 mb-4">{message}</p>
            </div>

            <div className="alert alert-danger">
              <div><strong>Order ID:</strong> {id || "—"}</div>
              <div><strong>Square Order ID:</strong> {orderId || "—"}</div>
            </div>

            <div className="d-grid gap-2 col-md-4 mx-auto mt-5">
              <button onClick={handleRetry} className="btn btn-brand-green btn-sm">
                Retry Payment
              </button>

              <a href="/contact" className="btn btn-brand-orange btn-sm">
                Contact Support
              </a>

              <button onClick={() => router.push("/")} className="btn btn-brand-yellow btn-sm">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
