"use client";

import { Suspense } from "react";
import CheckoutFailedPage from "@/components/CheckoutFailedPage";

export default function CheckoutFailedWrapper() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading failed payment page...</div>}>
      <CheckoutFailedPage />
    </Suspense>
  );
}
