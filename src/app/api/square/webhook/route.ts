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
      order {
        databaseId
        title
        orderDetails {
          paymentStatus
          paymentId
          paymentOrderId
          orderStatus
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Square Webhook Received:", JSON.stringify(body, null, 2));

    // Verify webhook event type
    if (body.type !== "payment.updated" && body.type !== "payment.created") {
      console.log("⚠️ Ignoring non-payment event:", body.type);
      return NextResponse.json({ success: true, ignored: true });
    }

    const payment = body.data.object.payment;

    // Extract Square data
    const squareOrderId = payment.order_id;
    const paymentId = payment.id;
    const paymentStatus = payment.status;

    console.log("✅ Extracted:", { squareOrderId, paymentId, paymentStatus });

    // Match WordPress order by custom meta field "payment_order_id"
    const FIND_ORDER = gql`
      query FindOrderByPaymentOrderId($paymentOrderId: String!) {
        orders(where: { metaQuery: { metaArray: { key: "payment_order_id", value: $paymentOrderId, compare: EQUAL } } }) {
          nodes {
            databaseId
            title
          }
        }
      }
    `;

    const findRes = await client.request(FIND_ORDER, { paymentOrderId: squareOrderId });
    const wpOrder = findRes.orders?.nodes?.[0];

    if (!wpOrder) {
      console.log("❌ No WP order found for Square order:", squareOrderId);
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    console.log("🟢 Found WP Order:", wpOrder.title);

    // Determine final order status
    const newOrderStatus = paymentStatus === "COMPLETED" ? "Paid" : "Pending";
    const newPaymentStatus = paymentStatus.toLowerCase();

    // Update order in WordPress
    const updateRes = await client.request(UPDATE_ORDER, {
      id: wpOrder.databaseId,
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
      paymentId,
      paymentOrderId: squareOrderId,
    });

    console.log("✅ WP Order Updated via Webhook:", updateRes.updateOrderWithACF.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
