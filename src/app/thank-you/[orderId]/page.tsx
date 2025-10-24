import { db } from "@/lib/db"; // your MySQL pool
import { notFound } from "next/navigation";

interface Props {
  params: { orderId: string };
}

export default async function ThankYou({ params }: Props) {
  const [rows]: any = await db.query("SELECT * FROM orders WHERE order_id = ?", [
    params.orderId,
  ]);

  const order = rows[0];
  if (!order) return notFound();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🎉 Thank You!</h1>
      <p>Your order #{order.order_id} has been placed successfully.</p>
      <p>Total: ${order.total_amount}</p>
    </main>
  );
}
