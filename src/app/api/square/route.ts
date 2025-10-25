import { NextResponse } from "next/server";
import { Client, Environment } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox,
});

export async function POST(req: Request) {
  try {
    const { amount /*, items */ }: { amount: number /*, items?: any[] */ } = await req.json();

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: "Food Order",
        priceMoney: {
          amount: Math.round(amount * 100), // Square expects smallest currency unit
          currency: "INR",
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
    });

    return NextResponse.json({
      checkoutUrl: response.result.paymentLink?.url,
    });
  } catch (error: unknown) {
    let message = "Payment processing failed";

    if (error instanceof Error) {
      message = error.message;
    }

    console.error("Square Payment Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
