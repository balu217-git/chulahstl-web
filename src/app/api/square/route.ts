import { NextResponse } from "next/server";
import { SquareClient, SquareEnvironment } from "square";

interface PaymentRequestBody {
  amount: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

const client = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.NODE_ENV === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

export async function POST(req: Request) {
  try {
    const body: PaymentRequestBody = await req.json();

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: "Food Order",
        priceMoney: {
          amount: Math.round(body.amount * 100),
          currency: "INR",
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
    });

    return NextResponse.json({
      checkoutUrl: response.result.paymentLink?.url,
    });
  } catch (error: unknown) {
    console.error("Square Payment Error:", error);
    const message =
      error instanceof Error ? error.message : "Payment processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
