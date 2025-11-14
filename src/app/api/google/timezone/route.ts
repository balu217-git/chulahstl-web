// app/api/google/timezone/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    // timestamp (seconds). If not provided, use current timestamp.
    const ts = searchParams.get("timestamp") || String(Math.floor(Date.now() / 1000));

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat & lng required" }, { status: 400 });
    }

    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google API key not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      timestamp: ts,
      key: GOOGLE_API_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/timezone/json?${params.toString()}`;
    const r = await fetch(url);
    const data = await r.json();

    // Google returns status + timeZoneId + timeZoneName + dstOffset + rawOffset
    if (data.status !== "OK") {
      return NextResponse.json({ error: data.status || "timezone lookup failed", details: data }, { status: 502 });
    }

    // return the useful fields
    return NextResponse.json({
      timeZoneId: data.timeZoneId,          // e.g. "America/Chicago"
      timeZoneName: data.timeZoneName,      // e.g. "Central Daylight Time"
      dstOffset: data.dstOffset,            // seconds
      rawOffset: data.rawOffset,            // seconds
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
