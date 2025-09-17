"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // dynamically import Bootstrap JS in the browser
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then((bootstrap) => {
        // You can use bootstrap here if needed
        console.log("Bootstrap loaded", bootstrap);
      })
      .catch((err) => console.error("Bootstrap failed to load", err));
  }, []);

  return null; // nothing to render
}
