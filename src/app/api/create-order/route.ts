import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

const CREATE_ORDER = gql`
  mutation CreateOrderWithACF(
    $title: String!
    $name: String!
    $phone: String!
    $items: String!
    $total: Float!
    $paymentStatus: String!
    $orderStatus: String!
  ) {
    createOrderWithACF(
      input: {
        title: $title
        customer_name: $name
        customer_phone: $phone
        order_items: $items
        total_amount: $total
        payment_status: $paymentStatus
        order_status: $orderStatus
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
    const { name, phone, items, total, paymentStatus, orderStatus } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are missing." },
        { status: 400 }
      );
    }

    const orderTitle = `Order-${Date.now()}`;
    const orderItems = JSON.stringify(items);

    const response = await client.request(CREATE_ORDER, {
      title: orderTitle,
      name,
      phone,
      items: orderItems,
      total,
      paymentStatus,
      orderStatus,
    });

    const order = response.createOrderWithACF?.order;

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
