"use client";
import React, { useState, useEffect } from "react";
import { useAddressAndTime } from "@/hooks/useAddressAndTime";

export default function LocationInfo() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // 🌍 Get current location (browser)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        (err) => console.error("Location error:", err)
      );
    }
  }, []);

  const { data, loading, error } = useAddressAndTime(lat, lng);

  if (loading) return <p>Loading location data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 border rounded shadow-sm bg-white max-w-md mx-auto">
      {data ? (
        <>
          <p>
            <strong>Address:</strong> {data.fullAddress}
          </p>
          <p>
            <strong>City:</strong> {data.city}, {data.state} {data.zip}
          </p>
          <p>
            <strong>Local Time:</strong> {data.formattedTime}
          </p>
        </>
      ) : (
        <p>Fetching address...</p>
      )}
    </div>
  );
}
