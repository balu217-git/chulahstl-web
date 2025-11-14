// components/PlaceTimePickerLauncher.tsx
"use client";

import React, { useState } from "react";
import TimePickerModal from "@/components/TimePickerModal";
import { fetchTimeZoneForLatLng } from "@/lib/googleClient";

interface Props {
  // You can pass placeId, or lat/lng directly. If you pass placeId we'll fetch place-details.
  placeId?: string;
  lat?: number;
  lng?: number;
  // optional: pass weekdayText if you already fetched it elsewhere
  initialWeekdayText?: string[] | null;
  triggerLabel?: string;
}

export default function PlaceTimePickerLauncher({
  placeId,
  lat,
  lng,
  initialWeekdayText = null,
  triggerLabel = "Choose time",
}: Props) {
  const [timeZone, setTimeZone] = useState<string | undefined>();
  const [weekdayText, setWeekdayText] = useState<string[] | null>(initialWeekdayText);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function openForPlace() {
    setLoading(true);
    try {
      // If lat/lng were not provided, fetch place-details by placeId
      let usedLat = lat;
      let usedLng = lng;
      if (!usedLat || !usedLng) {
        if (!placeId) throw new Error("placeId or lat/lng required");
        const pdRes = await fetch(`/api/google/place-details?place_id=${encodeURIComponent(placeId)}&fields=geometry,opening_hours`);
        const pdJson = await pdRes.json();
        usedLat = pdJson?.result?.geometry?.location?.lat;
        usedLng = pdJson?.result?.geometry?.location?.lng;
        const wd = pdJson?.result?.opening_hours?.weekday_text;
        if (wd) setWeekdayText(wd);
      }

      if (!usedLat || !usedLng) {
        console.warn("Could not determine geometry for place");
        // fallback timezone if you prefer:
        setTimeZone("America/Chicago");
        setShow(true);
        return;
      }

      // call timezone helper (calls /api/google/timezone)
      const tzJson = await fetchTimeZoneForLatLng(usedLat, usedLng);
      if (tzJson?.timeZoneId) {
        setTimeZone(tzJson.timeZoneId);
      } else {
        console.warn("timezone lookup failed, falling back to America/Chicago", tzJson);
        setTimeZone("America/Chicago");
      }

      setShow(true);
    } catch (err) {
      console.error("openForPlace error", err);
      // fallback and still show modal
      setTimeZone("America/Chicago");
      setShow(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={openForPlace} disabled={loading}>
        {loading ? "Loading…" : triggerLabel}
      </button>

      <TimePickerModal
        show={show}
        onClose={() => setShow(false)}
        mode="pickup"
        weekdayText={weekdayText}
        timeZone={timeZone}
        onConfirm={(iso) => {
          console.log("chosen time (ISO):", iso, "tz:", timeZone);
          setShow(false);
        }}
      />
    </>
  );
}
