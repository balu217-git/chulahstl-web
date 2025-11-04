import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

const UPDATE_ORDER = gql`
  mutation UpdateOrderWithACF(
    $id: ID!
    $paymentStatus: String
    $orderStatus: String
    $paymentId: String
    $paymentOrderId: String
  ) {
    updateOrderWithACF(
      input: {
        id: $id
        payment_status: $paymentStatus
        order_status: $orderStatus
        payment_id: $paymentId
        payment_order_id: $paymentOrderId
      }
    ) {
      success
      message
    }
  }
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Webhook received:", JSON.stringify(body, null, 2));

    // ✅ Validate the webhook type
    const eventType = body?.type;
    const payment = body?.data?.object?.payment;

    if (!payment) {
      console.warn("⚠️ No payment object found in webhook.");
      return NextResponse.json({ success: false });
    }

    // Extract relevant fields
    const paymentId = payment.id;
    const orderId = payment.order_id;
    const status = payment.status;

    // You can map Square payment order_id to your WP Order ID here
    // Example: you stored payment_order_id in WP earlier when creating the order
    // So find the WordPress ID that matches this orderId

    console.log("🔹 Payment ID:", paymentId);
    console.log("🔹 Order ID:", orderId);
    console.log("🔹 Payment Status:", status);

    // Only update for completed or failed payments
    if (status === "COMPLETED" || status === "FAILED" || status === "CANCELED") {
      const paymentStatus = status === "COMPLETED" ? "success" : "failed";
      const orderStatus = status === "COMPLETED" ? "Paid" : "Failed";

      // Example: assume you store mapping of Square order_id ↔️ WordPress order database ID
      // Replace with your lookup logic (if stored in DB)
      const wordpressOrderId = Number(payment.order_id?.replace("wp-", "")) || null;

      if (!wordpressOrderId) {
        console.warn("⚠️ Missing mapped WordPress order ID.");
        return NextResponse.json({ success: false });
      }

      // ✅ Update WordPress order
      const res = await client.request(UPDATE_ORDER, {
        id: wordpressOrderId,
        paymentStatus,
        orderStatus,
        paymentId,
        paymentOrderId: orderId,
      });

      console.log("✅ WordPress order updated:", res.updateOrderWithACF?.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
  console.error("❌ Webhook error:", error);

  const message =
    error instanceof Error ? error.message : "An unexpected server error occurred.";

  return NextResponse.json(
    { success: false, message },
    { status: 500 }
  );
}

}
