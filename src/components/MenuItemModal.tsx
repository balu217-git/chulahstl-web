"use client";

import Image from "next/image";
import { Modal, Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { MenuItem } from "@/types/menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash, faClose } from "@fortawesome/free-solid-svg-icons";

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
    <Modal show={show} onHide={onClose} centered scrollable size="md" backdrop="static">
      <Modal.Body className="bg-brand-light  text-brand-green p-0">

        {/* TOP IMAGE */}
        <div style={{ position: "relative", height: 280 }} >
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
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <div className="form-container p-4">
          {/* TITLE */}
          <h4 className="mb-2 font-family-body fw-bold">{menu.title}</h4>

          {/* DESCRIPTION */}
          {fields.menuDescription && (
            <p className="">{fields.menuDescription}</p>
          )}

          <hr className="border-secondary" />

          {/* CHOICE FIELD (if exists) */}
          {fields.choiceOptions && fields.choiceOptions.length > 0 && (
            <>
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
            <hr className="border-secondary" />
            </>
          )}

          <div className="flex flex-col gap-4">
            <h5 className="font-family-body fw-semibold">Special Requests</h5>
            <p className="small">We’ll try our best to accommodate requests, but can’t make changes that affect pricing.</p>
          </div>

          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Leave at door, call on arrival, etc. (optional)"
              // value={'0'}
            />
          </Form.Group>

          
          
        </div>
      </Modal.Body>
      <Modal.Footer className="d-block bg-brand-green-light">
        {/* QUANTITY + ADD BUTTON */}
          <div className="d-flex justify-content-between align-items-center d-grid gap-md-5">
            <div className="btn-group gap-0 border-brand-green ">
              <Button className="btn p-3 btn-cart btn-light border border-brand-yellow text-brand-yellow bg-transparent"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                 <FontAwesomeIcon icon={faMinus} />
              </Button>
              <div className="text-brnad-green btn fw-semibold px-3 shadow-none text-white">
                {qty}
              </div>
              <Button className="btn p-3 btn-cart btn-light border border-brand-yellow bg-transparent text-brand-yellow" onClick={() => setQty(qty + 1)}>
                 <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>

            <Button className="btn btn-wide btn-brand-orange d-flex w-100 justify-content-between" onClick={handleAdd}>
              Add Item  <span className="fw-semibold">{formatPrice(qty * basePrice)}</span>
            </Button>
          </div>
      </Modal.Footer>
    </Modal>
  );
}
