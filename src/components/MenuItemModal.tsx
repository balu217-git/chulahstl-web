"use client";

import Image from "next/image";
import { Modal, Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { MenuItem } from "@/types/menu";

interface MenuItemModalProps {
  show: boolean;
  onClose: () => void;
  menu: MenuItem;
}

interface MenuFields {
  menuImage?: { node?: { sourceUrl?: string } };
  menuPrice?: string | number;
  menuDescription?: string;
  isavailable?: boolean;
  choiceOptions?: string[];
}

export default function MenuItemModal({ show, onClose, menu }: MenuItemModalProps) {
  const { addToCart, cart, updateQuantity } = useCart();

  const fields = (menu.menuDetails as MenuFields) || {};
  const imageUrl = fields.menuImage?.node?.sourceUrl ?? "/images/img-dish-icon-bg.webp";
  const basePrice = Number(fields.menuPrice ?? 0);
  const cartItem = cart.find((c) => c.id === menu.id);

  const [qty, setQty] = useState(1);
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    if (cartItem) setQty(cartItem.quantity);
  }, [cartItem]);

  const handleAdd = () => {
    addToCart({
      id: menu.id,
      name: menu.title,
      price: basePrice,
      quantity: qty,
      image: imageUrl,
      ...(choice ? { choice } : {}),
    });
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md" backdrop="static">
      <Modal.Body className="bg-brand-light  text-brand-green p-0">

        {/* TOP IMAGE */}
        <div style={{ position: "relative", height: 180 }}>
          <Image
            src={imageUrl}
            alt={menu.title}
            fill
            style={{ objectFit: "cover" }}
          />
          <button
            className="btn btn-cart btn-light position-absolute"
            style={{ top: 10, right: 10 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* TITLE */}
          <h4 className="mb-2">{menu.title}</h4>

          {/* DESCRIPTION */}
          {fields.menuDescription && (
            <p className="text-muted small">{fields.menuDescription}</p>
          )}

          <hr className="border-secondary" />

          {/* CHOICE FIELD (if exists) */}
          {fields.choiceOptions && fields.choiceOptions.length > 0 && (
            <div className="mb-4">
              <strong className="d-block mb-2">CHOICE</strong>

              {fields.choiceOptions.map((opt) => (
                <Form.Check
                  key={opt}
                  type="radio"
                  name="menu-choice"
                  label={opt}
                  checked={choice === opt}
                  onChange={() => setChoice(opt)}
                />
              ))}
            </div>
          )}

          {/* QUANTITY + ADD BUTTON */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button
                className="btn-cart"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                –
              </Button>
              <div className="text-white px-3">
                {qty}
              </div>
              <Button className="btn-cart" onClick={() => setQty(qty + 1)}>
                +
              </Button>
            </div>

            <Button className="btn btn-wide btn-brand-orange d-flex w-100 justify-content-between" onClick={handleAdd}>
              Add Item  <span className="fw-semibold">{formatPrice(qty * basePrice)}</span>
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
