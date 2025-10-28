import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrder($id: ID!, $paymentStatus: String!) {
    updateOrder(input: { id: $id, fields: { paymentStatus: $paymentStatus } }) {
      order {
        id
        title
        fields {
          paymentStatus
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { orderId, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId" },
        { status: 400 }
      );
    }

    const response = await client.request(UPDATE_ORDER_STATUS, {
      id: orderId,
      paymentStatus,
    });

    if (!response.updateOrder) {
      return NextResponse.json(
        { success: false, message: "Failed to update order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: response.updateOrder.order,
    });
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating order." },
      { status: 500 }
    );
  }
}
