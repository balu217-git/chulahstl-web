// src/components/MenuItemModal.tsx
"use client";
import Image from "next/image";
import { Modal, Button, Form } from "react-bootstrap";
import React, { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/currency";
import { useCart, ChoiceSelected } from "@/context/CartContext";
import { MenuItem, ChoiceOptionFromAPI } from "@/types/menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faClose } from "@fortawesome/free-solid-svg-icons";

interface MenuItemModalProps {
  show: boolean;
  onClose: () => void;
  menu: MenuItem;
}

type NormalizedChoice = {
  id: string;
  label: string;
  price: number;
  isDefault?: boolean;
  isAvailable?: boolean;
};

type ChoiceState = {
  single?: string | null;
  multiple?: Set<string>;
};

export default function MenuItemModal({ show, onClose, menu }: MenuItemModalProps) {
  const { addToCart } = useCart();

  const details = menu.menuDetails || {};
  const imageUrl = details.menuImage?.node?.sourceUrl ?? "/images/img-dish-icon-bg.webp";
  const basePrice = Number(details.menuPrice ?? 0);
  const isAvailable = details.isAvailable ?? false; // global availability for the menu item

  // Normalize choices and preserve per-option isAvailable
  const normalizedChoices: NormalizedChoice[] = useMemo(() => {
    const arr = (details.choices || []) as ChoiceOptionFromAPI[];
    return arr.map((c, idx) => ({
      id: `${menu.id}-choice-${idx}`,
      label: c.label,
      price: Number(c.price ?? 0) || 0,
      isDefault: !!c.isDefault,
      isAvailable: "isAvailable" in c ? Boolean(c.isAvailable) : undefined,

    }));
  }, [details.choices, menu.id]);

  const rawChoiceType = (details.choiceType || "radio") as string;
  const isMultiple = rawChoiceType === "multiple" || rawChoiceType === "checkbox";
  const required = !!details.choiceRequired;

  // initial selection: only include defaults that are available (per-option) and global availability must be true to allow defaults
  const initialSelection = useMemo<ChoiceState>(() => {
    if (isMultiple) {
      const s = new Set<string>();
      normalizedChoices.forEach((opt) => {
        const optAvailable = opt.isAvailable !== false; // treat undefined as available
        if (opt.isDefault && optAvailable) s.add(opt.label);
      });
      return { multiple: s };
    } else {
      const def = normalizedChoices.find((o) => o.isDefault && (o.isAvailable !== false));
      return { single: def ? def.label : null };
    }
  }, [normalizedChoices, isMultiple]);

  const [qty, setQty] = useState<number>(1);
  const [choiceState, setChoiceState] = useState<ChoiceState>(initialSelection);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQty(1);
    setChoiceState(initialSelection);
    setError(null);
  }, [show, menu.id, initialSelection]);

  // Only treat an option as selectable/part of selectedOptions when both global and per-option availability allow it
  const optionIsSelectable = (opt: NormalizedChoice) => {
    if (!isAvailable) return false; // global menu item unavailable
    if (opt.isAvailable === false) return false; // per-option explicitly unavailable
    return true;
  };

  const selectedOptions = useMemo(() => {
    if (isMultiple) {
      const labels = choiceState.multiple ? Array.from(choiceState.multiple) : [];
      return normalizedChoices.filter((c) => labels.includes(c.label) && optionIsSelectable(c));
    } else {
      return normalizedChoices.filter((c) => c.label === choiceState.single && optionIsSelectable(c));
    }
  }, [choiceState, normalizedChoices, isMultiple, isAvailable]);

  const choicesTotal = selectedOptions.reduce((s, c) => s + (Number(c.price) || 0), 0);
  const totalPrice = (basePrice + choicesTotal) * qty;

  // Handlers ignore interaction for unavailable options
  const toggleMultiple = (label: string) => {
    setChoiceState((prev) => {
      // find option to check availability
      const opt = normalizedChoices.find((o) => o.label === label);
      if (!opt || !optionIsSelectable(opt)) return prev; // ignore if not selectable

      const next = new Set(prev.multiple ?? []);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return { multiple: next };
    });
  };

  const setSingle = (label: string) => {
    const opt = normalizedChoices.find((o) => o.label === label);
    if (!opt || !optionIsSelectable(opt)) return; // ignore
    setChoiceState({ single: label });
  };

  const handleAdd = () => {
    // Don't allow add if the whole item is unavailable
    if (!isAvailable) {
      setError("This item is currently unavailable.");
      return;
    }

    // Validate required choices — count only selectable ones
    if (required) {
      if (!isMultiple) {
        // single choice required
        if (!choiceState.single) {
          setError("Please choose an option.");
          return;
        }
        const opt = normalizedChoices.find((o) => o.label === choiceState.single);
        if (!opt || !optionIsSelectable(opt)) {
          setError("Please choose an available option.");
          return;
        }
      } else {
        // multiple required
        if (!choiceState.multiple || choiceState.multiple.size === 0) {
          setError("Please choose at least one option.");
          return;
        }
        // ensure at least one selected is actually selectable
        const anySelectable = Array.from(choiceState.multiple).some((label) => {
          const o = normalizedChoices.find((n) => n.label === label);
          return !!o && optionIsSelectable(o);
        });
        if (!anySelectable) {
          setError("Please choose at least one available option.");
          return;
        }
      }
    }

    const choicePayload: ChoiceSelected[] = selectedOptions.map((o) => ({
      id: o.id,
      label: o.label,
      price: o.price,
    }));

    addToCart({
      id: menu.id,
      name: menu.title,
      price: basePrice,
      quantity: qty,
      image: imageUrl,
      choices: choicePayload,
      available: isAvailable, // store availability on the cart row
    });

    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered scrollable backdrop="static">
      <Modal.Body className="bg-brand-light text-brand-green p-0">
        <div style={{ position: "relative", height: 280 }}>
          <Image src={imageUrl} alt={menu.title} fill style={{ objectFit: "cover" }} />
          <button
            className="btn btn-cart btn-light position-absolute"
            style={{ top: 10, right: 10 }}
            onClick={onClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <div className="form-container p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h4 className="mb-0 font-family-body fw-bold">{menu.title}</h4>
            {!isAvailable && <span className="badge bg-danger">Unavailable</span>}
          </div>

          {details.menuDescription && <p className="">{details.menuDescription}</p>}

          <hr className="border-secondary" />

          {normalizedChoices.length > 0 && (
            <>
              <div className="mb-3">
                <strong className="d-block mb-2">CHOICES</strong>
                {normalizedChoices.map((opt) => {
                  const checked = isMultiple ? choiceState.multiple?.has(opt.label) ?? false : choiceState.single === opt.label;
                  // disabled when global menu item is unavailable OR this specific option is explicitly unavailable
                  const disabled = !optionIsSelectable(opt);
                  if (isMultiple) {
                    return (
                      <Form.Check
                        key={opt.id}
                        type="checkbox"
                        id={opt.id}
                        label={`${opt.label} ${opt.price ? `(+ ${formatPrice(opt.price)})` : ""}`}
                        checked={checked}
                        onChange={() => toggleMultiple(opt.label)}
                        disabled={disabled}
                      />
                    );
                  } else {
                    return (
                      <Form.Check
                        key={opt.id}
                        type="radio"
                        id={opt.id}
                        name={`menu-choice-${menu.id}`}
                        label={`${opt.label} ${opt.price ? `(+ ${formatPrice(opt.price)})` : ""}`}
                        checked={checked}
                        onChange={() => setSingle(opt.label)}
                        disabled={disabled}
                      />
                    );
                  }
                })}
                {required && <div className="small text-muted mt-1">Selection required</div>}
              </div>

              <hr className="border-secondary" />
            </>
          )}

          <div className="flex flex-col gap-4">
            <h5 className="font-family-body fw-semibold">Special Requests</h5>
            <p className="small">We&apos;ll try our best to accommodate requests, but can&apos;t make changes that affect pricing.</p>
          </div>

          <Form.Group>
            <Form.Control as="textarea" rows={3} placeholder="Leave at door, call on arrival, etc. (optional)" disabled={!isAvailable} />
          </Form.Group>

          {error && <div className="text-danger mt-2 small">{error}</div>}
        </div>
      </Modal.Body>

      <Modal.Footer className="d-block bg-brand-green-light">
        <div className="d-flex justify-content-between align-items-center d-grid gap-md-5">
          <div className="btn-group gap-0 border-brand-green ">
            <Button
              className="btn p-3 btn-cart btn-light border border-brand-yellow text-brand-yellow bg-transparent"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={!isAvailable || qty <= 1}
            >
              <FontAwesomeIcon icon={faMinus} />
            </Button>
            <div className="text-brnad-green btn fw-semibold px-3 shadow-none text-white">{qty}</div>
            <Button
              className="btn p-3 btn-cart btn-light border border-brand-yellow bg-transparent text-brand-yellow"
              onClick={() => setQty(qty + 1)}
              disabled={!isAvailable}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>

          <Button
            className="btn btn-wide btn-brand-orange d-flex w-100 justify-content-between"
            onClick={handleAdd}
            disabled={!isAvailable}
          >
            {isAvailable ? (
              <>
                Add Item <span className="fw-semibold">{formatPrice(totalPrice)}</span>
              </>
            ) : (
              <>Unavailable</>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
