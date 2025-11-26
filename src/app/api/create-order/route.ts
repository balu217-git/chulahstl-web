// app/api/orders/route.ts (or wherever your endpoint lives)
import { NextResponse } from "next/server";
import client from "@/lib/graphql/client";
import { CREATE_ORDER } from "@/lib/graphql/mutations/createOrder";


/* ----------------------
   Type definitions
   ---------------------- */
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export type OrderMode = "pickup" | "delivery";

export interface AddressPlace {
  place_id?: string;
  name?: string;
  formatted_address: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  canDeliver?: boolean;
}

export interface DeliveryNotes {
  aptSuite?: string | null;
  instructions?: string | null;
}

export type OrderTypeTag = "ASAP" | "SCHEDULED";

interface OrderRequestBody {
  name: string;
  email: string;
  phone: string;
  orderMode: OrderMode;
  address?: string | null;
  deliveryTime?: string | null;
  items: OrderItem[]; // client sends structured items
  total: number | string;
  paymentOrderId?: string | null;
  paymentStatus?: string | null;
  orderStatus?: string | null;

  // New metadata:
  orderType?: OrderTypeTag | null;
  deliveryNotes?: DeliveryNotes | null;
  addressPlace?: AddressPlace | null;
}

/* ----------------------
   Helper
   ---------------------- */
function isValidEmail(e: string) {
  // simple check (you may use more strict regex if desired)
  return typeof e === "string" && /\S+@\S+\.\S+/.test(e);
}

function parseNumericTotal(t: number | string): number | null {
  if (typeof t === "number" && Number.isFinite(t)) return t;
  if (typeof t === "string") {
    const n = parseFloat(t.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/* ----------------------
   Handler
   ---------------------- */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderRequestBody;

    // Basic validation
    const { name, email, phone, orderMode, items } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ success: false, message: "Customer name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "A valid email is required." }, { status: 400 });
    }
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
    }
    if (orderMode !== "pickup" && orderMode !== "delivery") {
      return NextResponse.json({ success: false, message: "orderMode must be 'pickup' or 'delivery'." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart items are missing." }, { status: 400 });
    }
    // validate each item minimally
    for (const it of items) {
      if (!it.id || !it.name || typeof it.price !== "number" || typeof it.quantity !== "number") {
        return NextResponse.json({ success: false, message: "Each item must have id, name, price (number) and quantity (number)." }, { status: 400 });
      }
    }

    // parse numeric total
    const numericTotal = parseNumericTotal(body.total);
    if (numericTotal === null) {
      return NextResponse.json({ success: false, message: "Total must be a valid number." }, { status: 400 });
    }

    // Prepare values to send to GraphQL
    const orderTitle = `Order-${Date.now()}`;
    // if your GraphQL expects items as JSON string (previous behavior), keep same:
    const orderItems = JSON.stringify(items);

    // Sanitize optional fields
    const deliveryTime = body.deliveryTime ?? null;
    const address = body.address ?? null;
    const paymentOrderId = body.paymentOrderId ?? "";
    const paymentStatus = body.paymentStatus ?? "Pending";
    const orderStatus = body.orderStatus ?? "New";

    // New metadata - convert to strings for GraphQL ACF if needed
    const orderType = body.orderType ?? null; // "ASAP" | "SCHEDULED" | null
    const deliveryNotes = body.deliveryNotes ? JSON.stringify(body.deliveryNotes) : null;
    const addressPlace = body.addressPlace ? JSON.stringify(body.addressPlace) : null;
    // New: normalize/pick apart deliveryNotes
    const deliveryNotesFromBody = body.deliveryNotes ?? null;

    // Build values to send to GraphQL (variable names must match mutation)
const variables = {
  title: orderTitle,
  name,
  email,
  phone,
  orderMode,
  address,
  deliveryTime,
  items: orderItems, // this is the JSON string of items you already build
  total: numericTotal,
  paymentOrderId,
  paymentStatus,
  orderStatus,

  // Map metadata into the fields your WP mutation accepts:
  orderType: orderType ?? null,
  aptSuite: (deliveryNotesFromBody && typeof deliveryNotesFromBody.aptSuite !== "undefined")
    ? deliveryNotesFromBody.aptSuite
    : null,
  instructions: (deliveryNotesFromBody && typeof deliveryNotesFromBody.instructions !== "undefined")
    ? deliveryNotesFromBody.instructions
    : null,
  // orderNotes: store the full deliveryNotes JSON as order_notes (optional)
  orderNotes: deliveryNotesFromBody ? JSON.stringify(deliveryNotesFromBody) : null,
  // addressPlace: store JSON string of place if present
  addressPlace: body.addressPlace ? JSON.stringify(body.addressPlace) : null,
};

    // Execute GraphQL mutation
    const response = await client.request(CREATE_ORDER, variables);

    const order = response?.createOrderWithACF?.order ?? response?.createOrder?.order ?? null;

    if (!order) {
      // log full response for debugging (be careful not to leak PII in logs)
      console.error("Create order: GraphQL response:", response);
      return NextResponse.json(
        { success: false, message: "Order not created on the server." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (err: unknown) {
    console.error("Create Order Error:", err);

    const message = err instanceof Error ? err.message : "Unexpected error occurred while creating the order.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
