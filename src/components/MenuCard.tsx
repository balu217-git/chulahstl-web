"use client";
import { useCartStore } from "@/store/cartStore";

export default function MenuCard({ menu }: any) {
  const addToCart = useCartStore((state) => state.addItem);

  return (
    <div className="border p-4 rounded-xl shadow">
      <img
        src={menu.featuredImage?.node?.sourceUrl || menu.menuFields.menu_image}
        alt={menu.title}
        className="w-full h-40 object-cover mb-3"
      />
      <h2 className="text-xl font-bold">{menu.title}</h2>
      <p>{menu.menuFields.menu_description}</p>
      <p className="font-semibold">${menu.menuFields.menu_price}</p>
      <p>Category: {menu.menuFields.menu_category}</p>
      <p>Available: {menu.menuFields.isavailable ? "Yes" : "No"}</p>
      {menu.menuFields.isavailable && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          onClick={() =>
            addToCart({
              id: menu.id,
              title: menu.title,
              price: menu.menuFields.menu_price,
            })
          }
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
