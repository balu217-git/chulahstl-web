import { NextResponse } from "next/server";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN!;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!;

export async function POST(req: Request) {
  try {
    const { amount, items, orderId } = await req.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { success: false, message: "Missing order details." },
        { status: 400 }
      );
    }

    // Convert amount to cents (required by Square)
    const amountInCents = Math.round(amount * 100);

    // 1️⃣ Create Square checkout link
    const response = await fetch(
      `https://connect.squareupsandbox.com/v2/online-checkout/payment-links`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          idempotency_key: `order-${orderId}-${Date.now()}`,
          order: {
            location_id: SQUARE_LOCATION_ID,
            line_items: items.map((item: any) => ({
              name: item.title,
              quantity: item.quantity.toString(),
              base_price_money: {
                amount: Math.round(item.price * 100),
                currency: "INR",
              },
            })),
          },
          checkout_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?orderId=${orderId}`,
            ask_for_shipping_address: false,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.payment_link) {
      console.error("Square API error:", data);
      return NextResponse.json(
        { success: false, message: "Failed to create payment link." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: data.payment_link.url,
    });
  } catch (error: any) {
    console.error("Square Payment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating payment." },
      { status: 500 }
    );
  }
}
