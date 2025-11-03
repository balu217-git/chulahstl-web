import { NextRequest, NextResponse } from "next/server";

const SQUARE_BASE_URL = "https://connect.squareupsandbox.com/v2";
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Missing orderId in request." },
      { status: 400 }
    );
  }

  try {
    // 1️⃣ Try fetching payment details first
    const paymentsRes = await fetch(
      `${SQUARE_BASE_URL}/payments?order_id=${orderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentsData = await paymentsRes.json();

    if (!paymentsRes.ok) {
      throw new Error(
        paymentsData?.errors?.[0]?.detail || "Failed to fetch payments."
      );
    }

    // Extract payment details if available
    let payment = paymentsData?.payments?.[0];
    let transactionId =
      payment?.id ||
      payment?.tenders?.[0]?.id ||
      null;
    let status = payment?.status || "UNKNOWN";

    // 2️⃣ If not found in payments API, try fetching order details
    if (!transactionId) {
      const orderRes = await fetch(`${SQUARE_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(
          orderData?.errors?.[0]?.detail || "Failed to fetch order details."
        );
      }

      transactionId =
        orderData?.order?.tenders?.[0]?.id ||
        orderData?.order?.payment_ids?.[0] ||
        null;

      // If we got a payment ID, get its status too
      if (transactionId) {
        const paymentCheckRes = await fetch(
          `${SQUARE_BASE_URL}/payments/${transactionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        const paymentCheckData = await paymentCheckRes.json();
        status = paymentCheckData?.payment?.status || "UNKNOWN";
      }
    }

    // 3️⃣ Final response
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        message: "No transaction/payment found for this order yet.",
        raw: { paymentsData },
      });
    }

    return NextResponse.json({
      success: true,
      transactionId,
      status,
      message: "✅ Payment found successfully.",
    });
  } catch (error: any) {
    console.error("🚨 Square Payment Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching payment from Square.",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
