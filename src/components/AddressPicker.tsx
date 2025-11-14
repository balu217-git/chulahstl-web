"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export interface Suggestion {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

export interface SelectedPlace {
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  canDeliver: boolean;
  place_id?: string;
  timeZoneId?: string; // <- optional IANA timezone (e.g. "America/Chicago")
}

interface AddressPickerProps {
  value: string;
  onChange: (value: string) => void; // draft changes
  initialPlace?: SelectedPlace | null; // optional initial/hydration
  onPlaceSelect?: (place: SelectedPlace | null) => void; // draft place callback
}

export default function AddressPicker({
  value,
  onChange,
  initialPlace = null,
  onPlaceSelect,
}: AddressPickerProps) {
  const RESTAURANT_PLACE_ID = process.env.NEXT_PUBLIC_PLACE_ID;
  const MAX_DELIVERY_KM = 10;

  const [query, setQuery] = useState<string>(value || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(initialPlace);
  const [restaurantLocation, setRestaurantLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [selectionConfirmed, setSelectionConfirmed] = useState<boolean>(!!initialPlace);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(value || "");
    if (selectedPlace && value !== selectedPlace.formatted_address) {
      setSelectionConfirmed(false);
      setSelectedPlace(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!RESTAURANT_PLACE_ID) {
        setLoadingRestaurant(false);
        return;
      }
      try {
        setLoadingRestaurant(true);
        const res = await fetch(
          `/api/google/place-details?place_id=${encodeURIComponent(
            RESTAURANT_PLACE_ID
          )}&fields=geometry,formatted_address,name`
        );
        const data = await res.json();
        if (data?.status === "OK" && data.result?.geometry?.location) {
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
  }, [RESTAURANT_PLACE_ID]);

  // heuristic to detect full/pasted addresses
  const looksLikeFullAddress = (q: string) => {
    if (!q) return false;
    if (q.length > 25) return true;
    return /\d/.test(q) && q.includes(",");
  };

  // AUTOCOMPLETE with geocode fallback
  useEffect(() => {
    if (selectionConfirmed && selectedPlace && query === selectedPlace.formatted_address) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    if (!query) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        // 1) try autocomplete
        const acRes = await fetch(`/api/google/autocomplete?input=${encodeURIComponent(query)}`);
        const acData = await acRes.json();
        const preds: Suggestion[] = acData.predictions || [];

        if (!cancelled && preds.length > 0) {
          setSuggestions(preds);
          setHighlightIndex(-1);
          return;
        }

        // 2) if no predictions and input looks like a full address -> geocode
        if (!cancelled && looksLikeFullAddress(query)) {
          const gRes = await fetch(`/api/google/geocode?address=${encodeURIComponent(query)}`);
          const gData = await gRes.json();
          const first = gData?.results?.[0];
          if (first) {
            const fakePred: Suggestion = {
              description: first.formatted_address,
              place_id: first.place_id,
              structured_formatting: {
                main_text: first.formatted_address,
                secondary_text: "",
              },
            };
            setSuggestions([fakePred]);
            setHighlightIndex(-1);
            return;
          }
        }

        if (!cancelled) setSuggestions([]);
      } catch (err) {
        console.error("Autocomplete/geocode fetch failed", err);
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, selectionConfirmed, selectedPlace]);

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

 const handleSelect = async (placeId: string) => {
  if (!restaurantLocation) {
    console.warn("Restaurant location not loaded yet.");
    return;
  }
  try {
    setLoadingSuggestions(true);

    const res = await fetch(
      `/api/google/place-details?place_id=${encodeURIComponent(placeId)}&fields=geometry,formatted_address,name`
    );
    const data = await res.json();
    if (data?.status !== "OK") {
      console.warn("place-details status:", data?.status);
      return;
    }

    const loc = data.result.geometry.location;
    const distanceKm = getDistanceKm(
      restaurantLocation.lat,
      restaurantLocation.lng,
      loc.lat,
      loc.lng
    );
    const canDeliver = distanceKm <= MAX_DELIVERY_KM;

    const formattedAddress = data.result.formatted_address || data.result.name || "";
    const newSel: SelectedPlace = {
      name: data.result.name || "",
      formatted_address: formattedAddress,
      lat: loc.lat,
      lng: loc.lng,
      distanceKm,
      canDeliver,
      place_id: placeId,
    };

    // --- Fetch timezone for this lat/lng (server route you added) ---
    try {
      const tzRes = await fetch(`/api/google/timezone?lat=${loc.lat}&lng=${loc.lng}&timestamp=${Math.floor(Date.now()/1000)}`);
      if (tzRes.ok) {
        const tzJson = await tzRes.json();
        if (tzJson?.timeZoneId) {
          newSel.timeZoneId = tzJson.timeZoneId; // attach IANA timezone
        }
      } else {
        // optional: fallback or log
        console.warn("timezone lookup failed", await tzRes.text());
      }
    } catch (tzErr) {
      console.error("timezone lookup error", tzErr);
    }

    setSelectedPlace(newSel);
    setQuery(formattedAddress);
    onChange(formattedAddress);
    if (onPlaceSelect) onPlaceSelect(newSel);

    setSelectionConfirmed(true);
    setSuggestions([]);
    setHighlightIndex(-1);
  } catch (err) {
    console.error("Error fetching place details", err);
  } finally {
    setLoadingSuggestions(false);
  }
};


  const clearAll = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedPlace(null);
    setSelectionConfirmed(false);
    onChange("");
    if (onPlaceSelect) onPlaceSelect(null);
    inputRef.current?.focus();
  };

  const handleInputChange = (v: string) => {
    if (selectionConfirmed) {
      if (!selectedPlace || v !== selectedPlace.formatted_address) {
        setSelectionConfirmed(false);
        setSelectedPlace(null);
        if (onPlaceSelect) onPlaceSelect(null);
      }
    }
    setQuery(v);
    onChange(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightIndex].place_id);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlightIndex(-1);
    }
  };

  const showSuggestions =
    suggestions.length > 0 &&
    !(selectionConfirmed && selectedPlace && query === selectedPlace.formatted_address);

  return (
    <div style={{ position: "relative" }}>
      <div className="input-group border text-brand-green rounded-3">
        <span className="input-group-text bg-white border-0">
          <FontAwesomeIcon icon={faSearch} />
        </span>

        <input
          ref={inputRef}
          type="text"
          className="input-group border text-brand-green rounded-4 border-brand-green overflow-hidden"
          placeholder={loadingRestaurant ? "Loading restaurant..." : "Enter your delivery address"}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loadingRestaurant}
          aria-autocomplete="list"
          aria-controls="addr-suggestions"
          aria-expanded={showSuggestions}
        />

        {(query || selectedPlace) && (
          <button
            type="button"
            className="btn border-0 shadow-none small"
            onClick={clearAll}
            style={{ whiteSpace: "nowrap" }}
          >
            <small className="fw-semibold">Change</small>
          </button>
        )}
      </div>

      {loadingSuggestions && (
        <div className="mt-1" style={{ maxWidth: "100%" }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="placeholder-glow mb-1">
              <span className="placeholder col-12" />
            </div>
          ))}
        </div>
      )}

      {showSuggestions && (
        <ul
          id="addr-suggestions"
          role="listbox"
          className="list-group position-absolute w-100 shadow"
          style={{ zIndex: 2000, maxHeight: 250, overflowY: "auto" }}
        >
          {suggestions.map((s, idx) => {
            const main = s.structured_formatting?.main_text || s.description;
            const secondary = s.structured_formatting?.secondary_text || "";
            const isHighlighted = idx === highlightIndex;
            return (
              <li
                key={s.place_id}
                role="option"
                aria-selected={isHighlighted}
                className={`list-group-item list-group-item-action ${isHighlighted ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseLeave={() => setHighlightIndex(-1)}
                onClick={() => handleSelect(s.place_id)}
              >
                <div style={{ fontWeight: 600 }}>{main}</div>
                {secondary ? <small className="">{secondary}</small> : <small className="text-muted">{s.description}</small>}
              </li>
            );
          })}
        </ul>
      )}

      {selectedPlace && (
        <div
          className={`mt-2 p-2 alert ${selectedPlace.canDeliver ? "alert-success" : "alert-danger"}`}
          style={{ zIndex: 1500 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "top" }}>
            <div>
              <strong>{selectedPlace.name || "Selected place"}</strong>
              <div style={{ fontSize: 12 }}>
                {selectedPlace.formatted_address} — {selectedPlace.distanceKm.toFixed(2)} km
              </div>
              <small>{selectedPlace.canDeliver ? "✅ Deliverable" : "❌ Out of range"}</small>
            </div>

            <div>
              <button
                type="button"
                className="btn-close small"
                onClick={() => {
                  setSelectionConfirmed(false);
                  setQuery("");
                  setSelectedPlace(null);
                  if (onPlaceSelect) onPlaceSelect(null);
                  onChange("");
                  inputRef.current?.focus();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
