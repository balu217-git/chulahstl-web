import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";
import crypto from "crypto";

const SQUARE_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!; // From Square Dashboard
const WEBHOOK_NOTIFICATION_URL = process.env.SQUARE_WEBHOOK_URL!; // e.g., https://yourdomain.com/api/square/webhook

// --- 🔍 Query: Find WP Order by square_order_id ---
const FIND_ORDER_BY_SQUARE_ID = gql`
  query GetOrderBySquareId($squareOrderId: String!) {
    orders(
      where: {
        metaQuery: {
          metaArray: [{ key: "square_order_id", value: $squareOrderId }]
        }
      }
    ) {
      nodes {
        databaseId
        title
      }
    }
  }
`;

// --- 🔧 Mutation: Update WP Order ---
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
    // 1️⃣ Read raw body for signature validation
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-square-hmacsha256-signature");

    // 2️⃣ Verify webhook signature
    const hash = crypto
      .createHmac("sha256", SQUARE_SIGNATURE_KEY)
      .update(WEBHOOK_NOTIFICATION_URL + rawBody)
      .digest("base64");

    if (hash !== signatureHeader) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3️⃣ Parse JSON body
    const event = JSON.parse(rawBody);
    const { type, data } = event;

    console.log("🔔 Square Webhook Event:", type);

    // 4️⃣ Handle only payment events
    if (type === "payment.updated" || type === "payment.created") {
      const payment = data.object.payment;
      const paymentId = payment.id;
      const paymentStatus = payment.status;
      const orderId = payment.order_id;

      console.log("💳 Payment Update:", { paymentId, paymentStatus, orderId });

      // 5️⃣ Map Square payment status to WP equivalents
      const mappedStatus =
        paymentStatus === "COMPLETED"
          ? "success"
          : paymentStatus === "FAILED"
          ? "failed"
          : paymentStatus === "CANCELED"
          ? "canceled"
          : "pending";

      // 6️⃣ Find WordPress order by `square_order_id`
      const wpOrderRes = await client.request(FIND_ORDER_BY_SQUARE_ID, {
        squareOrderId: orderId,
      });

      const wpOrderNode = wpOrderRes?.orders?.nodes?.[0];
      if (!wpOrderNode) {
        console.warn("⚠️ No WordPress order found for Square orderId:", orderId);
        return NextResponse.json({ received: true });
      }

      const wpOrderId = wpOrderNode.databaseId;
      console.log("🔗 Found WordPress Order:", wpOrderId);

      // 7️⃣ Determine WordPress orderStatus
      const orderStatus =
        mappedStatus === "success"
          ? "Order Confirmed"
          : mappedStatus === "failed"
          ? "Failed"
          : mappedStatus === "canceled"
          ? "Canceled"
          : "Pending Order Confirmation";

      // 8️⃣ Update WordPress order
      await client.request(UPDATE_ORDER, {
        id: Number(wpOrderId),
        paymentStatus: mappedStatus,
        orderStatus,
        paymentId,
        paymentOrderId: orderId,
      });

      console.log("✅ WordPress order updated via Square webhook");
    }

    // 9️⃣ Always respond to Square quickly (required)
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
      console.error("❌ Webhook Error:", error);
      const message = error instanceof Error ? error.message : "Server error";
      return NextResponse.json({ success: false, message }, { status: 500 });
    }

}



















