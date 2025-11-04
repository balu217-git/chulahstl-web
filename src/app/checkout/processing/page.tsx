"use client";

import { Suspense } from "react";
import CheckoutProcessingPage from "@/components/CheckoutProcessingPage";

export default function ProcessingWrapper() {
  return (
    <Suspense fallback={<div className="text-center p-10">Processing your payment...</div>}>
      <CheckoutProcessingPage />
    </Suspense>
  );
}
