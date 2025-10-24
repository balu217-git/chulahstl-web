"use client";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = items.reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0);

  if (items.length === 0)
    return (
      <main className="p-10">
        <h1>Your cart is empty 🛒</h1>
        <Link href="/menu" className="text-blue-600 underline">
          Go to Menu
        </Link>
      </main>
    );

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="flex justify-between mb-2">
            {item.title} x {item.quantity} - ${item.price * (item.quantity || 1)}
          </li>
        ))}
      </ul>
      <p className="font-bold mt-4">Total: ${total.toFixed(2)}</p>
      <div className="flex gap-4 mt-4">
        <Link
          href="/checkout"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Checkout
        </Link>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>
    </main>
  );
}
