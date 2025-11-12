"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function TestDistancePage() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const restaurantPlaceId = "ChIJURrsfnsr2YcRzVzfazRfg8g"; // replace this
  const googleApiKey = "AIzaSyCEHWSfeZNEM8Vxd0uIWSM0K_UEQzuaiMA"; // replace this

  useEffect(() => {
    // ✅ dynamically load Google Maps JS API
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }

    function initAutocomplete() {
      const input = document.getElementById("address-input") as HTMLInputElement;
      if (!input || !window.google) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          setAddress(place.formatted_address);
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            calculateDistance(lat, lng);
          }
        }
      });
    }

    async function calculateDistance(userLat: number, userLng: number) {
      const service = new window.google.maps.DistanceMatrixService();
      const origin = { placeId: restaurantPlaceId };
      const destination = { lat: userLat, lng: userLng };

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: "DRIVING",
        },
        (response: any, status: string) => {
          if (status === "OK") {
            const element = response.rows[0].elements[0];
            if (element.status === "OK") {
              const distanceText = element.distance.text;
              const distanceValue = element.distance.value / 1000; // km
              const canDeliver = distanceValue <= 10;
              setResult(
                `Distance: ${distanceText} — ${canDeliver ? "✅ Within delivery range" : "❌ Out of range"}`
              );
            } else {
              setResult("Error: destination not found.");
            }
          } else {
            setResult(`Distance API error: ${status}`);
          }
        }
      );
    }
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🚗 Test Delivery Distance</h2>
      <input
        id="address-input"
        type="text"
        placeholder="Enter your address"
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />
      {address && <p><strong>Selected:</strong> {address}</p>}
      {result && <p>{result}</p>}
    </div>
  );
}
