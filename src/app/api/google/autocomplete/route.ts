// app/api/google/autocomplete/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");
  if (!input) return NextResponse.json({ predictions: [] });

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");
  const sessiontoken = searchParams.get("sessiontoken");

  const params = new URLSearchParams({
    input,
    key: GOOGLE_API_KEY,
    // NOTE: do NOT set `types` here — allowing addresses + establishments improves results.
    // Optional: components: "country:US",
  });

  if (lat && lng) {
    params.set("location", `${lat},${lng}`);
    if (radius) params.set("radius", radius);
  }
  if (sessiontoken) params.set("sessiontoken", sessiontoken);

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
