import { NextResponse } from "next/server";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN!;
const SQUARE_API_URL = "https://connect.squareupsandbox.com/v2/payments";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId)
    return NextResponse.json(
      { success: false, message: "Missing payment ID." },
      { status: 400 }
    );

  try {
    const res = await fetch(`${SQUARE_API_URL}/${paymentId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.errors?.[0]?.detail || "Square error");

    return NextResponse.json({ success: true, payment: data.payment });
  } catch (error: any) {
    console.error("Error fetching Square payment:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
