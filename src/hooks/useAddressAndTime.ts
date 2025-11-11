"use client";

import { useEffect, useState } from "react";

interface AddressData {
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  formattedTime: string;
}

export function useAddressAndTime(lat: number | null, lng: number | null) {
  const [data, setData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchAddressAndTime = async () => {
      setLoading(true);
      setError(null);

      try {
        const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!key) throw new Error("Missing Google Maps API key");

        // 1️⃣ Reverse Geocoding
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
        );
        const geoData = await geoRes.json();

        if (geoData.status !== "OK" || !geoData.results.length) {
          throw new Error("No address found");
        }

        const addressComponents = geoData.results[0].address_components;
        const city =
          addressComponents.find((c: any) =>
            c.types.includes("locality")
          )?.long_name || "";
        const state =
          addressComponents.find((c: any) =>
            c.types.includes("administrative_area_level_1")
          )?.short_name || "";
        const zip =
          addressComponents.find((c: any) =>
            c.types.includes("postal_code")
          )?.long_name || "";

        // 2️⃣ Time Zone API
        const timestamp = Math.floor(Date.now() / 1000);
        const tzRes = await fetch(
          `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${key}`
        );
        const tzData = await tzRes.json();

        if (tzData.status !== "OK") throw new Error("Timezone fetch failed");

        const localTime = new Date(
          (timestamp + tzData.rawOffset + tzData.dstOffset) * 1000
        );

        // 🕒 Format to US-style 12-hour with AM/PM
        const formattedTime = localTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        setData({
          city,
          state,
          zip,
          fullAddress: geoData.results[0].formatted_address,
          formattedTime,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressAndTime();
  }, [lat, lng]);

  return { data, loading, error };
}
