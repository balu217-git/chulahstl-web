import { Suspense } from "react";
import CheckoutSuccessPage from "./CheckoutSuccessClient";

export const dynamic = "force-dynamic"; // prevent prerendering

export default function Page() {
  return (
    <Suspense fallback={<div>Loading payment details...</div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
