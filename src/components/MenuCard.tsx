"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { MenuItem } from "@/types/menu";
import MenuItemModal from "./MenuItemModal";   // <— ADD THIS

interface MenuCardProps {
  menu: MenuItem;
  onAddressSelect: () => void;
}

export default function MenuCard({ menu, onAddressSelect }: MenuCardProps) {
  const { addToCart, cart, updateQuantity, removeFromCart, orderConfirmed } = useCart();
  const [showModal, setShowModal] = useState(false);

  const fields = menu.menuDetails;
  const imageUrl = fields?.menuImage?.node?.sourceUrl || "/images/img-dish-icon-bg.webp";
  const price = Number(fields?.menuPrice ?? 0);
  const cartItem = cart.find((c) => c.id === menu.id);

  const openModal = () => {
    if (!orderConfirmed) onAddressSelect();
    setShowModal(true);
  };

  return (
    <>
      <div className="card menu-card h-100 shadow-sm">
        <div className="row g-0">
          <div className="col-4 position-relative">
            <Image
              src={imageUrl}
              alt={menu.title}
              width={600}
              height={600}
              className="img-fluid position-absolute w-100 h-100"
            />
          </div>

          <div className="col-8">
            <div className="card-body d-flex flex-column">
              <p className="fw-bold mb-1">{menu.title}</p>

              {fields?.menuDescription && (
                <p className="small mb-2">{fields.menuDescription}</p>
              )}

              <div className="mt-auto d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{formatPrice(price)}</span>

                {cartItem ? (
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => updateQuantity(menu.id, cartItem.quantity - 1)}
                      disabled={cartItem.quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>

                    <span>{cartItem.quantity}</span>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => updateQuantity(menu.id, cartItem.quantity + 1)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>

                    <button
                      className="btn btn-link text-danger btn-sm"
                      onClick={() => removeFromCart(menu.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-brand-orange btn-sm" onClick={openModal}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL HERE */}
      <MenuItemModal
        show={showModal}
        onClose={() => setShowModal(false)}
        menu={menu}
      />
    </>
  );
}
