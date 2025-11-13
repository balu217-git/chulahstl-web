// app/api/google/place-details/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("place_id");

  if (!placeId)
    return NextResponse.json({ error: "place_id required" }, { status: 400 });

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fields = searchParams.get("fields") || "geometry,formatted_address,name";

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=${encodeURIComponent(fields)}&key=${GOOGLE_API_KEY}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}
