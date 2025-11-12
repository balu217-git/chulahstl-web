// app/api/distance/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dest = url.searchParams.get("dest") || "";
    const placeId = process.env.NEXT_PUBLIC_PLACE_ID;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || !placeId) {
      return NextResponse.json({ error: "Missing server API key or PLACE_ID" }, { status: 400 });
    }

    if (!dest || dest.trim().length === 0) {
      return NextResponse.json({ error: "Missing destination address" }, { status: 400 });
    }

    // Distance Matrix web service (units=metric -> meters)
    // Use place_id: prefix for origin (restaurant Place ID)
    const dmUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${encodeURIComponent(
      placeId
    )}&destinations=${encodeURIComponent(dest)}&units=metric&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(dmUrl);
    if (!res.ok) {
      const txt = await res.text();
      console.error("Distance Matrix non-ok:", res.status, txt);
      return NextResponse.json({ error: "Failed to fetch distance" }, { status: 502 });
    }

    const data = await res.json();

    if (data.status !== "OK") {
      console.error("Distance Matrix error:", data);
      return NextResponse.json({ error: data.error_message || data.status }, { status: 502 });
    }

    // parse elements
    const element = data.rows?.[0]?.elements?.[0];
    if (!element) {
      return NextResponse.json({ error: "No distance result" }, { status: 502 });
    }

    // element.status might be "OK" or "NOT_FOUND" etc.
    if (element.status !== "OK") {
      return NextResponse.json({ error: element.status }, { status: 400 });
    }

    const distanceMeters = element.distance?.value ?? null;
    const distanceText = element.distance?.text ?? null;
    const durationText = element.duration?.text ?? null;

    return NextResponse.json({
      distanceMeters,
      distanceText,
      durationText,
    });
  } catch (err) {
    console.error("Distance route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
