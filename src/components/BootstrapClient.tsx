// src/components/BootstrapClient.tsx
"use client"; // makes this a client component

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // dynamically import Bootstrap JS only in browser
    require ("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null; // nothing is rendered, it just triggers the effect
}
