import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { gql } from "graphql-request";

// ✅ GraphQL mutation for creating order (added email)
const CREATE_ORDER = gql`
  mutation CreateOrderWithACF(
    $title: String!
    $name: String!
    $email: String!
    $phone: String!
    $address: String!
    $deliveryType: String!
    $deliveryTime: String!
    $items: String!
    $total: Float!
    $paymentOrderId: String!
    $paymentStatus: String!
    $orderStatus: String!
  ) {
    createOrderWithACF(
      input: {
        title: $title
        customer_name: $name
        customer_email: $email
        customer_phone: $phone
        address: $address
        delivery_type: $deliveryType
        delivery_time: $deliveryTime
        order_items: $items
        total_amount: $total
        payment_order_id: $paymentOrderId
        payment_status: $paymentStatus
        order_status: $orderStatus
      }
    ) {
      success
      message
      order {
        id
        databaseId
        title
        date
        slug
        orderDetails {
          customerName
          customerEmail
          customerPhone
          address
          deliveryType
          deliveryTime
          totalAmount
          paymentOrderId
          paymentStatus
          orderStatus
          paymentId
          notes
          orderItems
        }
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      deliveryType,
      address,
      deliveryTime,
      items,
      total,
      paymentOrderId,
      paymentStatus,
      orderStatus,
    } = await req.json();

    // 🔒 Validation
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are missing." },
        { status: 400 }
      );
    }

    if (!name || !phone || !email || !deliveryType) {
      return NextResponse.json(
        { success: false, message: "Customer name, email, and phone are required." },
        { status: 400 }
      );
    }

    const orderTitle = `Order-${Date.now()}`;
    const orderItems = JSON.stringify(items);

    // 🧠 Ensure numeric total
    const numericTotal = typeof total === "string" ? parseFloat(total) : total;

    // 🚀 Send GraphQL mutation
    const response = await client.request(CREATE_ORDER, {
      title: orderTitle,
      name,
      email,
      phone,
      deliveryType,
      address,
      deliveryTime,
      items: orderItems,
      total: numericTotal,
      paymentOrderId,
      paymentStatus,
      orderStatus,
    });

    const order = response?.createOrderWithACF?.order;

    if (!order) {
      console.error("❌ No order returned from GraphQL:", response);
      return NextResponse.json(
        { success: false, message: "Order not created on server." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ Order created successfully.",
      order,
    });
  } catch (error: any) {
    console.error("🛑 Create Order Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error creating order." },
      { status: 500 }
    );
  }
}
