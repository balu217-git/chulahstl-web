import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { CREATE_ORDER } from "@/lib/graphql/mutations/createOrder";

// Define the expected request body type for clarity
// Define item structure
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Define request body type
interface OrderRequestBody {
  name: string;
  email: string;
  phone: string;
  orderMode: "pickup" | "delivery";
  address?: string;
  deliveryTime?: string;
  items: OrderItem[]; // ✅ use specific type
  total: number | string;
  paymentOrderId?: string;
  paymentStatus?: string;
  orderStatus?: string;
}


export async function POST(req: Request) {
  try {
    const body: OrderRequestBody = await req.json();
    const {
      name,
      email,
      phone,
      orderMode,
      address,
      deliveryTime,
      items,
      total,
      paymentOrderId,
      paymentStatus,
      orderStatus,
    } = body;

    // 🧩 Validate required fields
    if (!name || !email || !phone || !orderMode) {
      return NextResponse.json(
        { success: false, message: "Customer name, email, phone, and order mode are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are missing." },
        { status: 400 }
      );
    }

    // 🧾 Prepare data
    const orderTitle = `Order-${Date.now()}`;
    const orderItems = JSON.stringify(items);
    const numericTotal = typeof total === "string" ? parseFloat(total) : total;

    // 🚀 Send GraphQL Mutation
    const response = await client.request(CREATE_ORDER, {
      title: orderTitle,
      name,
      email,
      phone,
      orderMode,
      address,
      deliveryTime,
      items: orderItems,
      total: numericTotal,
      paymentOrderId: paymentOrderId || "",
      paymentStatus: paymentStatus || "pending",
      orderStatus: orderStatus || "new",
    });

    const order = response?.createOrderWithACF?.order;

    if (!order) {
      console.error("❌ No order returned from GraphQL:", response);
      return NextResponse.json(
        { success: false, message: "Order not created on the server." },
        { status: 500 }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      message: "✅ Order created successfully.",
      order,
    });
  } catch (error: unknown) {
    console.error("🛑 Create Order Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error occurred while creating the order.";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
