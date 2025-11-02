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
    const { id, paymentId, orderId } = await req.json();

    console.log("🔹 Updating order:", { id, paymentId, orderId });

    const res = await client.request(UPDATE_ORDER, {
      id: Number(id),
      paymentStatus: "success",
      orderStatus: "Paid",
      paymentId,
      paymentOrderId: orderId,
    });

    console.log("✅ WP Order Updated Successfully:", res.updateOrderWithACF.message);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: res.updateOrderWithACF.order,
    });
  } catch (error: any) {
    console.error("❌ Update Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
