"use client";
import { useEffect, useState } from "react";

interface OpeningHours {
  open_now?: boolean;
  weekday_text?: string[];
}

interface PlaceInfo {
  name: string;
  address: string;
  rating: number;
  totalReviews: number;
  opening_hours?: OpeningHours;
}

interface PlaceHeaderProps {
  fontSize?: string; // Bootstrap/Tailwind/custom class
}

export default function PlaceHeader({ fontSize = "fs-4" }: PlaceHeaderProps) {
  const [place, setPlace] = useState<PlaceInfo | null>(null);

  useEffect(() => {
    const fetchPlaceInfo = async () => {
      const res = await fetch("/api/google-reviews");
      const data = await res.json();
      if (data.name) setPlace(data);
    };
    fetchPlaceInfo();
  }, []);

  if (!place) return <p>Loading...</p>;

  const isOpen = place.opening_hours?.open_now;
  const todayIndex = new Date().getDay();
  const todaySchedule =
    place.opening_hours?.weekday_text?.[todayIndex === 0 ? 6 : todayIndex - 1] || "";

  const { openTime, closeTime } = parseTimes(todaySchedule);

  return (
    <div className="mb-3">
      <h5 className={`fw-bold font-family-body ${fontSize}`}>
        🍴 {place.name}
      </h5>

      <p className="text-mute mb-1 small">
        📍 {place.address} |{" "}
        <span className={`small fw-semibold ${isOpen ? "text-success" : "text-danger"}`}>
          {isOpen ? "Open Now" : "Closed"}
        </span>{" "}
        |{" "}
        <span className="small">
          {isOpen
            ? closeTime && (
                <>
                  Closes at <strong>{closeTime}</strong> CST
                </>
              )
            : openTime && (
                <>
                  Opens at <strong>{openTime}</strong> CST
                </>
              )}
        </span>
      </p>

      {/* <p className="mb-0">
      ⭐ {place.rating} ({place.totalReviews} reviews)
    </p> */}
    </div>
  );
}

function parseTimes(text: string) {
  const match = text.match(
    /(\d{1,2}:\d{2}\s?[APM]+)\s?[–-]\s?(\d{1,2}:\d{2}\s?[APM]+)/i
  );
  if (match) {
    return { openTime: match[1], closeTime: match[2] };
  }
  return { openTime: null, closeTime: null };
}
