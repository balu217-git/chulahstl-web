import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

const SQUARE_BASE_URL = process.env.SQUARE_BASE_URL!;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN!;

// 🔹 WordPress Query — find by square_order_id
const FIND_ORDER_BY_SQUARE_ID = gql`
  query GetOrderBySquareId($squareOrderId: String!) {
    orders(
      where: { metaQuery: { metaArray: [{ key: "square_order_id", value: $squareOrderId }] } }
    ) {
      nodes {
        databaseId
        title
        orderDetails {
          paymentStatus
          orderStatus
          paymentId
        }
      }
    }
  }
`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId parameter." },
        { status: 400 }
      );
    }

    // 1️⃣ Check WordPress first (may already have webhook-updated data)
    const wpRes = await client.request(FIND_ORDER_BY_SQUARE_ID, { squareOrderId: orderId });
    const wpOrder = wpRes?.orders?.nodes?.[0] || null;

    if (wpOrder?.orderDetails?.paymentStatus) {
      const status = wpOrder.orderDetails.paymentStatus;
      const paymentId = wpOrder.orderDetails.paymentId;
      const orderStatus = wpOrder.orderDetails.orderStatus;

      return NextResponse.json({
        success: true,
        source: "wordpress",
        transactionId: paymentId,
        status,
        orderStatus,
        message: "Fetched payment info from WordPress.",
      });
    }

    // 2️⃣ Fallback: fetch live from Square
    const squareRes = await fetch(`${SQUARE_BASE_URL}/payments?order_id=${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const squareData = await squareRes.json();
    if (!squareRes.ok) {
      throw new Error(squareData?.errors?.[0]?.detail || "Failed to fetch Square payment info.");
    }

    const payment = squareData?.payments?.[0] || null;
    if (!payment) {
      return NextResponse.json({
        success: false,
        message: "No payment found for this order yet.",
      });
    }

    const transactionId = payment.id;
    const status = payment.status;
    const amount = payment.amount_money?.amount / 100 || 0;
    const currency = payment.amount_money?.currency || "USD";

    return NextResponse.json({
      success: true,
      source: "square",
      transactionId,
      status,
      amount,
      currency,
      message: "Fetched payment info from Square API.",
    });
  } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("❌ Payment status error:", err);
      return NextResponse.json(
        { success: false, message: err.message || "Internal server error." },
        { status: 500 }
      );
    }
}
