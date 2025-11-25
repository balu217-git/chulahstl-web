// src/components/MenuCard.tsx
"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { MenuItem } from "@/types/menu";
import MenuItemModal from "./MenuItemModal";

interface MenuCardProps {
  menu: MenuItem;
  onAddressSelect: () => void;
}

export default function MenuCard({ menu, onAddressSelect }: MenuCardProps) {
  const { cart, updateQuantity, removeFromCart, orderConfirmed } = useCart();
  const [showModal, setShowModal] = useState(false);

  const fields = menu.menuDetails;
  const imageUrl = fields?.menuImage?.node?.sourceUrl || "/images/img-dish-icon-bg.webp";
  const price = Number(fields?.menuPrice ?? 0);

  // find all variants in cart for this menu id
  const variants = cart.filter((c) => c.id === menu.id);
  const totalQty = variants.reduce((s, v) => s + v.quantity, 0);

  // singleVariant if exactly one variant exists
  const singleVariant = variants.length === 1 ? variants[0] : null;

  const openModal = () => {
    if (!orderConfirmed) onAddressSelect();
    setShowModal(true);
  };

  return (
    <>
      <div className="card menu-card h-100 shadow-sm" onClick={openModal}>
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

              {fields?.menuDescription && <p className="small mb-2">{fields.menuDescription}</p>}

              <div className="mt-auto d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{formatPrice(price)}</span>

                {totalQty > 0 ? (
                  singleVariant ? (
                    <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-cart btn-outline-dark btn-sm border-brand-green"
                        onClick={() =>
                          updateQuantity(singleVariant.cartItemKey ?? singleVariant.id, Math.max(1, singleVariant.quantity - 1))
                        }
                        disabled={singleVariant.quantity <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>

                      <span className="fw-semibold">{singleVariant.quantity}</span>

                      <button
                        className="btn btn-cart btn-outline-dark btn-sm border-brand-green"
                        onClick={() =>
                          updateQuantity(singleVariant.cartItemKey ?? singleVariant.id, singleVariant.quantity + 1)
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>

                      <button
                        className="btn btn-cart shadow-none text-danger btn-sm"
                        onClick={() => removeFromCart(singleVariant.cartItemKey ?? singleVariant.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2" onClick={(e) => { e.stopPropagation(); openModal(); }}>
                      <span className="badge bg-secondary text-white">Items: {totalQty}</span>
                      <button className="btn btn-cart btn-brand-orange btn-sm" onClick={(e) => { e.stopPropagation(); openModal(); }}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  )
                ) : (
                  <button className="btn btn-cart btn-brand-orange btn-sm" onClick={(e) => { e.stopPropagation(); openModal(); }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MenuItemModal show={showModal} onClose={() => setShowModal(false)} menu={menu} />
    </>
  );
}
