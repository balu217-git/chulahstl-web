import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing Google API Key or Place ID" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    );

    // Ensure it's JSON, not HTML
    if (!res.ok) {
      const text = await res.text();
      console.error("Google API response error:", text);
      return NextResponse.json({ error: "Google API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ reviews: data.result?.reviews || [] });
  } catch (error) {
    console.error("Fetch failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
