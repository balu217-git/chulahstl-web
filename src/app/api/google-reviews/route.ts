import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: "Missing API key or Place ID" },
      { status: 500 }
    );
  }

  try {
    // ✅ include opening_hours field
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,reviews,opening_hours&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.error("Google API error:", data);
      return NextResponse.json({ error: data.error_message }, { status: 500 });
    }

    const {
      name,
      formatted_address,
      rating,
      user_ratings_total,
      reviews,
      opening_hours,
    } = data.result;

    return NextResponse.json({
      name,
      address: formatted_address,
      rating,
      totalReviews: user_ratings_total,
      reviews,
      opening_hours,
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
