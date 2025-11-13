"use client";

import { useState, useEffect } from "react";

interface Suggestion {
  description: string;
  place_id: string;
}

interface SelectedPlace {
  formatted_address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  canDeliver: boolean;
}

interface AddressDistanceProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AddressDistance({ value, onChange }: AddressDistanceProps) {
  const RESTAURANT_PLACE_ID = process.env.NEXT_PUBLIC_PLACE_ID;
  const MAX_DELIVERY_KM = 10;

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [restaurantLocation, setRestaurantLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Sync query with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fetch restaurant location once
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoadingRestaurant(true);
        const res = await fetch(`/api/google/place-details?place_id=${RESTAURANT_PLACE_ID}`);
        const data = await res.json();
        if (data.status === "OK") {
          setRestaurantLocation({
            lat: data.result.geometry.location.lat,
            lng: data.result.geometry.location.lng,
          });
        }
      } catch (err) {
        console.error("Error fetching restaurant location", err);
      } finally {
        setLoadingRestaurant(false);
      }
    };
    fetchRestaurant();
  }, []);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await fetch(`/api/google/autocomplete?input=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.predictions || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = async (placeId: string) => {
    if (!restaurantLocation) return;
    try {
      setLoadingSuggestions(true);
      const res = await fetch(`/api/google/place-details?place_id=${placeId}`);
      const data = await res.json();
      if (data.status !== "OK") return;

      const loc = data.result.geometry.location;
      const distanceKm = getDistanceKm(
        restaurantLocation.lat,
        restaurantLocation.lng,
        loc.lat,
        loc.lng
      );

      const canDeliver = distanceKm <= MAX_DELIVERY_KM;

      setSelectedPlace({
        formatted_address: data.result.formatted_address,
        lat: loc.lat,
        lng: loc.lng,
        distanceKm,
        canDeliver,
      });

      setSuggestions([]);
      setQuery(data.result.formatted_address);
      onChange(data.result.formatted_address); // Update external value
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        className="form-control"
        placeholder={loadingRestaurant ? "Loading..." : "Enter your delivery address"}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        disabled={loadingRestaurant}
      />

      {/* Suggestions Dropdown */}
      {loadingSuggestions && (
        <div className="mt-1">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="placeholder-glow mb-1">
              <span className="placeholder col-12"></span>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <ul
          className="list-group position-absolute w-100 shadow"
          style={{ zIndex: 2000, maxHeight: 250, overflowY: "auto" }}
        >
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(s.place_id)}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}

      {/* Selected Place */}
      {selectedPlace && (
        <div
          className={`mt-2 p-2 border rounded ${
            selectedPlace.canDeliver ? "border-success bg-light" : "border-danger bg-light"
          }`}
        >
          <small>{selectedPlace.canDeliver ? "✅ Deliverable" : "❌ Out of range"}</small>
          <div style={{ fontSize: 12 }}>
            {selectedPlace.formatted_address} — {selectedPlace.distanceKm.toFixed(2)} km
          </div>
        </div>
      )}
    </div>
  );
}
