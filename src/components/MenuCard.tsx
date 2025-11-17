"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { MenuItem } from "@/types/menu";
import MenuItemModal from "@/components/MenuItemModal";

interface MenuCardProps {
  menu: MenuItem;
  onAddressSelect: () => void;
}

export default function MenuCard({ menu, onAddressSelect }: MenuCardProps) {
  const { addToCart, cart, updateQuantity, removeFromCart, orderConfirmed } = useCart();
  const [showModal, setShowModal] = useState(false);

  const fields = menu.menuDetails;
  const imageUrl = fields?.menuImage?.node?.sourceUrl || "/images/img-dish-icon-bg.webp";
  const price = Number(fields?.menuPrice) || 0;
  const cartItem = cart.find((item) => item.id === menu.id);
  const isAvailable = fields?.isavailable ?? true;

  const handleAddToCart = () => {
    // ✅ force modal if not confirmed for current mode
    if (!orderConfirmed) {
      onAddressSelect();
      openModal();
      return;
    }
    addToCart({ id: menu.id, name: menu.title, price, quantity: 1, image: imageUrl });
  };

  function openModal() {
    setShowModal(true);
  }

  return (
    <>
    <div className="card menu-card h-100 bg-white border-0 shadow-sm overflow-hidden">
      <div className="row g-0">
        <div className="col-4 position-relative">
          <Image
            className="img-fluid position-absolute w-100 h-100"
            src={imageUrl}
            alt={menu.title}
            width={600}
            height={600}
          />
        </div>

        <div className="col-8">
          <div className="card-body d-flex flex-column text-dark" style={{ minHeight: "150px" }}>
            <p className="fw-bold mb-1">{menu.title}</p>
            {fields?.menuDescription && <p className="small mb-2">{fields.menuDescription}</p>}

            <div className="mt-auto d-flex justify-content-between align-items-center">
              <span className="fw-semibold">{formatPrice(price)}</span>

              {!isAvailable ? (
                <button className="btn px-3 w-auto btn-cart btn-secondary btn-sm small" disabled>
                  Not Available
                </button>
              ) : cartItem ? (
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-cart btn-outline-secondary btn-sm"
                    onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span>{cartItem.quantity}</span>
                  <button
                    className="btn btn-cart btn-outline-secondary btn-sm"
                    onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  <button
                    className="btn btn-cart btn-link text-danger btn-sm"
                    onClick={() => removeFromCart(menu.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <button className="btn btn-cart btn-brand-orange btn-sm" onClick={handleAddToCart}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
     <MenuItemModal show={showModal} onHide={() => setShowModal(false)} menu={menu} />
     </>
  );
}
