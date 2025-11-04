"use client";

import { Suspense } from "react";
import CheckoutSuccessPage from "@/components/CheckoutSuccessPage";

export default function CheckoutSuccessWrapper() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading payment success...</div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
