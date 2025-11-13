import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");
  if (!input) return NextResponse.json({ predictions: [] });

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=geocode&components=country:US&key=${GOOGLE_API_KEY}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}
