"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";

interface MenuCardProps {
  menu: any;
}

export default function MenuCard({ menu }: MenuCardProps) {

  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const fields = menu.menuFields;
  const imageUrl = fields?.menuImage?.node?.sourceUrl || "/images/img-dish-icon-bg.webp";
  const price = Number(fields?.menuPrice) || 0;
  const cartItem = cart.find((item) => item.id === menu.id);

  return (
    <div className="card h-100 bg-white text-white border-0 d-grid shadow-sm overflow-hidden">
      <div className="row g-0">
        {/* Image */}
        <div className="col-lg-4 col-4">
          <div className="position-relative h-100 w-100">
            <Image
              className="img-fluid position-absalute w-100 h-100"
              src={imageUrl}
              alt={menu.title || "Placeholder image"}
              width={600}
              height={600}
            />
          </div>
        </div>

        {/* Content */}
        <div className="col-xl-8 col-8">
          <div className="card-body d-flex flex-column text-dark" style={{ minHeight: "150px" }}>
            <p className="card-title fw-bold mb-1">{menu.title}</p>
            {fields?.menuDescription && (
              <p className="card-text small mb-2">{fields.menuDescription}</p>
            )}

            <div className="mt-auto d-flex justify-content-between align-items-center">
              <span className="fw-semibold">
                ${fields?.menuPrice || "0.00"}
              </span>

              {!cartItem ? (
                <button
                  onClick={() =>
                    addToCart({
                      id: menu.id,
                      title: menu.title,
                      price,
                      image: imageUrl,
                      quantity: 1,
                    })
                  }
                  className="btn btn-cart btn-sm btn-brand-orange"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-cart btn-outline-secondary"
                    onClick={() =>
                      updateQuantity(menu.id, cartItem.quantity - 1)
                    }
                    disabled={cartItem.quantity <= 1}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>

                  <span className="fw-bold">{cartItem.quantity}</span>

                  <button
                    className="btn btn-sm btn-cart btn-outline-secondary"
                    onClick={() =>
                      updateQuantity(menu.id, cartItem.quantity + 1)
                    }
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>

                  <button
                    className="btn btn-sm btn-cart btn-outline-danger ms-2"
                    onClick={() => removeFromCart(menu.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
