import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN!;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!;
const SQUARE_CURRENCY = process.env.SQUARE_CURRENCY || "USD";

// ✅ Update WP order mutation
const UPDATE_ORDER = gql`
  mutation UpdateOrderWithACF(
    $id: ID!
    $paymentStatus: String
    $orderStatus: String
    $paymentOrderId: String
  ) {
    updateOrderWithACF(
      input: {
        id: $id
        payment_status: $paymentStatus
        order_status: $orderStatus
        payment_order_id: $paymentOrderId
      }
    ) {
      success
      message
      order {
        databaseId
        title
        orderDetails {
          paymentStatus
          paymentOrderId
          orderStatus
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { amount, items, orderId, databaseId } = await req.json();

    if (!amount || !orderId || !Array.isArray(items) || !databaseId) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid order details." },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);

    console.log("🟢 Creating Square checkout link:", {
      databaseId,
      orderId,
      total: amountInCents,
      location: SQUARE_LOCATION_ID,
    });

    // Create Square payment link
    const response = await fetch(
      `https://connect.squareupsandbox.com/v2/online-checkout/payment-links`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          idempotency_key: `order-${databaseId}-${orderId}-${Date.now()}`,
          order: {
            location_id: SQUARE_LOCATION_ID,
            line_items: items.map((item: any) => ({
              name: item.title,
              quantity: item.quantity.toString(),
              base_price_money: {
                amount: Math.round(item.price * 100),
                currency: SQUARE_CURRENCY,
              },
            })),
          },
          checkout_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout/processing?ID=${databaseId}&orderId=${orderId}`,
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

    const checkoutUrl = data.payment_link.url;
    const checkoutOrderId = data.payment_link.order_id;

    // Update WP order to pending
    await client.request(UPDATE_ORDER, {
      id: Number(databaseId),
      paymentStatus: "Pending",
      orderStatus: "Awaiting Payment",
      paymentOrderId: checkoutOrderId,
    });

    console.log("✅ WP Order Updated: Awaiting Payment");

    return NextResponse.json({
      success: true,
      checkoutUrl,
      checkoutOrderId,
      message: "Payment link created and order updated successfully.",
    });
  } catch (error: any) {
    console.error("Square Payment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating payment." },
      { status: 500 }
    );
  }
}
