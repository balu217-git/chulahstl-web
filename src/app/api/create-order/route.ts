import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

/**
 * ✅ GraphQL mutation to create a new Order in WordPress
 * Requires your "orders" CPT and ACF fields (set up earlier)
 */
const CREATE_ORDER = gql`
  mutation CreateOrder(
    $title: String!
    $name: String!
    $phone: String!
    $items: String!
    $total: Float!
    $paymentStatus: String!
  ) {
    createOrder(
      input: {
        title: $title
        status: PUBLISH
        orderDetails: {
          customerName: $name
          customerPhone: $phone
          orderItems: $items
          totalAmount: $total
          paymentStatus: $paymentStatus
        }
      }
    ) {
      order {
        id
        databaseId
        title
        slug
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { name, phone, items, total, paymentStatus } = await req.json();

    // 1️⃣ Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are missing." },
        { status: 400 }
      );
    }

    // 2️⃣ Create a title like “Order #123456”
    const orderTitle = `Order-${Date.now()}`;

    // 3️⃣ Convert cart items into a readable JSON string for storage
    const orderItems = JSON.stringify(items);

    // 4️⃣ Call GraphQL API
    const response = await client.request(CREATE_ORDER, {
      title: orderTitle,
      name,
      phone,
      items: orderItems,
      total,
      paymentStatus,
    });

    const order = response.createOrder?.order;

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not created." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating order." },
      { status: 500 }
    );
  }
}
