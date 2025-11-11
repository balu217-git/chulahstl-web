"use client";

import { useEffect, useState } from "react";

export const usePlacesAutocomplete = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Avoid duplicate script loading
    if (document.querySelector("#google-maps-script")) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  const initAutocomplete = (inputId: string, callback: (address: string) => void) => {
    if (!isLoaded) return;

    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["address"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        callback(place.formatted_address);
      }
    });
  };

  return { initAutocomplete, isLoaded };
};
