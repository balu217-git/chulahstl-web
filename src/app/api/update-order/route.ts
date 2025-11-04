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
    $squareOrderId: String
  ) {
    updateOrderWithACF(
      input: {
        id: $id
        payment_status: $paymentStatus
        order_status: $orderStatus
        payment_id: $paymentId
        payment_order_id: $paymentOrderId
        square_order_id: $squareOrderId
      }
    ) {
      success
      message
      order {
        databaseId
        title
        orderDetails {
          paymentStatus
          orderStatus
          paymentId
          paymentOrderId
          squareOrderId
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { id, paymentId, orderId, paymentStatus } = await req.json();

    // 🧩 Validate required fields
    if (!id || !orderId || !paymentId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (id, orderId, paymentId)." },
        { status: 400 }
      );
    }

    console.log("🔹 Updating WordPress Order:", {
      id,
      paymentId,
      orderId,
      paymentStatus,
    });

    // 🧠 Determine proper WordPress order status
    let orderStatus = "Pending";
    const normalizedStatus = (paymentStatus || "").toLowerCase();

    switch (normalizedStatus) {
      case "paid":
      case "success":
      case "completed":
        orderStatus = "Paid";
        break;
      case "processing":
      case "pending":
        orderStatus = "Processing";
        break;
      case "failed":
        orderStatus = "Failed";
        break;
      case "canceled":
      case "cancelled":
        orderStatus = "Canceled";
        break;
      default:
        orderStatus = "Pending";
        break;
    }

    // 🧾 Execute GraphQL Mutation
    const response = await client.request(UPDATE_ORDER, {
      id: Number(id),
      paymentStatus: orderStatus.toLowerCase(),
      orderStatus,
      paymentId,
      paymentOrderId: orderId,
      squareOrderId: orderId,
    });

    const result = response?.updateOrderWithACF;

    if (!result?.success) {
      console.error("⚠️ WordPress returned failure:", result?.message);
      return NextResponse.json(
        {
          success: false,
          message: result?.message || "WordPress update failed.",
        },
        { status: 500 }
      );
    }

    console.log("✅ WordPress Order Updated:", result.order?.databaseId);

    return NextResponse.json({
      success: true,
      message: result.message || "Order updated successfully.",
      data: result.order,
    });
  } catch (error: unknown) {
      console.error("❌ Update Order Error:", error);

      const wpError =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
            error !== null &&
            "response" in error &&
            Array.isArray((error as { response: { errors?: { message?: string }[] } }).response?.errors)
          ? (error as { response: { errors?: { message?: string }[] } }).response.errors?.[0]?.message ||
            "Unexpected server error."
          : "Unexpected server error.";

      return NextResponse.json({ success: false, message: wpError }, { status: 500 });
    }
}
