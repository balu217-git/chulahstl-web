import { NextResponse } from "next/server";
import { SquareClient, SquareEnvironment } from "square"; // ✅ Correct import

const client = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.NODE_ENV === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

export async function POST(req: Request) {
  try {
    const { amount, items } = await req.json(); // items can be typed if needed

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: "Food Order",
        priceMoney: {
          amount: Math.round(amount * 100), // smallest currency unit
          currency: "INR",
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
    });

    return NextResponse.json({
      checkoutUrl: response.result.paymentLink?.url,
    });
  } catch (error: any) {
    console.error("Square Payment Error:", error);
    return NextResponse.json(
      { error: error.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}
