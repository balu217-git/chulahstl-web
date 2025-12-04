"use client";
import Image from "next/image";
import { Modal, Button, Form } from "react-bootstrap";
import React, { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/currency";
import { useCart, ChoiceSelected } from "@/context/CartContext";
import { MenuItem, ChoiceOptionFromAPI, AddOnFromAPI } from "@/types/menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faClose } from "@fortawesome/free-solid-svg-icons";
import { MenuTypePill } from "@/components/MenuTypePill";

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

type NormalizedAddOn = {
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
  const isAvailable = details.isAvailable ?? false; // <-- global menu-item availability

   const menuType = details?.menuType;
   const categories = details?.menuCategory?.nodes ?? [];

  const isDrinkCategory = categories.some((cat) => {
    const name = cat?.name?.toLowerCase().trim() ?? "";
    const slug = cat?.slug?.toLowerCase().trim() ?? "";

    return (
      name === "beverages" ||
      name === "soda" ||
      name === "fountains" ||
      slug === "beverages" ||
      slug === "soda" ||
      slug === "fountains"
    );
  });

  const effectiveMenuType = isDrinkCategory ? undefined : menuType;

  // Normalize choices and preserve per-option isAvailable (default true)
  const normalizedChoices: NormalizedChoice[] = useMemo(() => {
    const arr = (details.choices || []) as ChoiceOptionFromAPI[];
    return arr.map((c, idx) => ({
      id: `${menu.id}-choice-${idx}`,
      label: c.label,
      price: Number(c.price ?? 0) || 0,
      isDefault: !!c.isDefault,
      isAvailable: "isAvailable" in c ? Boolean((c as unknown as Record<string, unknown>).isAvailable) : true,
    }));
  }, [details.choices, menu.id]);

  // Normalize add-ons (try common fields: addOns, add_ons, addons)
  const normalizedAddOns: NormalizedAddOn[] = useMemo(() => {
    const raw = (details.addOns || []) as AddOnFromAPI[];
    return (raw || []).map((a, idx) => {
      const isAvailable = isRecord(a) && "isAvailable" in a ? Boolean((a as unknown as Record<string, unknown>).isAvailable) : true;
      const label = isRecord(a) ? (a.label ?? `Addon ${idx + 1}`) as string : `Addon ${idx + 1}`;
      const price = isRecord(a) ? Number((a as unknown as Record<string, unknown>).price ?? 0) : 0;
      return {
        id: `${menu.id}-addon-${idx}`,
        label,
        price: Number(price) || 0,
        isDefault: isRecord(a) ? !!(a as Record<string, unknown>).isDefault : false,
        isAvailable,
      };
    });
  }, [details.addOns, menu.id]);

  const rawChoiceType = (details.choiceType || "radio") as string;
  const isMultiple = rawChoiceType === "multiple" || rawChoiceType === "checkbox";
  const required = !!details.choiceRequired;

  // initial selection for choices (respect per-option availability)
  const initialSelection = useMemo<ChoiceState>(() => {
    if (isMultiple) {
      const s = new Set<string>();
      normalizedChoices.forEach((opt) => {
        if (opt.isDefault && opt.isAvailable !== false) s.add(opt.label);
      });
      return { multiple: s };
    } else {
      const def = normalizedChoices.find((o) => o.isDefault && o.isAvailable !== false);
      return { single: def ? def.label : null };
    }
  }, [normalizedChoices, isMultiple]);

  // initial selection for addons (always multi-select)
  const initialAddOnSelection = useMemo<Set<string>>(() => {
    const s = new Set<string>();
    normalizedAddOns.forEach((a) => {
      if (a.isDefault && a.isAvailable !== false) s.add(a.label);
    });
    return s;
  }, [normalizedAddOns]);

  const [qty, setQty] = useState<number>(1);
  const [choiceState, setChoiceState] = useState<ChoiceState>(initialSelection);
  const [addonState, setAddonState] = useState<Set<string>>(initialAddOnSelection);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQty(1);
    setChoiceState(initialSelection);
    setAddonState(initialAddOnSelection);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, menu.id]);

  // helper: safe record check
  function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }

  // returns true only when both global menu and per-option allow selection
  const isOptionAvailable = (opt: NormalizedChoice | NormalizedAddOn) => {
    if (!isAvailable) return false;
    if (opt.isAvailable === false) return false;
    return true;
  };

  // Selected choices (only count available ones)
  const selectedOptions = useMemo(() => {
    if (isMultiple) {
      const labels = choiceState.multiple ? Array.from(choiceState.multiple) : [];
      return normalizedChoices.filter((c) => labels.includes(c.label) && isOptionAvailable(c));
    } else {
      return normalizedChoices.filter((c) => c.label === choiceState.single && isOptionAvailable(c));
    }
  }, [choiceState, normalizedChoices, isMultiple, isAvailable]);

  // Selected add-ons (only count available ones)
  const selectedAddOns = useMemo(() => {
    const labels = Array.from(addonState ?? []);
    return normalizedAddOns.filter((a) => labels.includes(a.label) && isOptionAvailable(a));
  }, [addonState, normalizedAddOns, isAvailable]);

  const choicesTotal = selectedOptions.reduce((s, c) => s + (Number(c.price) || 0), 0);
  const addonsTotal = selectedAddOns.reduce((s, a) => s + (Number(a.price) || 0), 0);
  const totalPrice = (basePrice + choicesTotal + addonsTotal) * qty;

  // toggle handlers ignore unavailable options
  const toggleMultiple = (label: string) => {
    setChoiceState((prev) => {
      const opt = normalizedChoices.find((o) => o.label === label);
      if (!opt || !isOptionAvailable(opt)) return prev;
      const next = new Set(prev.multiple ?? []);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return { multiple: next };
    });
  };

  const setSingle = (label: string) => {
    const opt = normalizedChoices.find((o) => o.label === label);
    if (!opt || !isOptionAvailable(opt)) return;
    setChoiceState({ single: label });
  };

  // addons toggle (multi)
  const toggleAddOn = (label: string) => {
    setAddonState((prev) => {
      const opt = normalizedAddOns.find((o) => o.label === label);
      if (!opt || !isOptionAvailable(opt)) return prev;
      const next = new Set(prev ?? []);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleAdd = () => {
    setError(null);

    if (!isAvailable) {
      setError("This item is currently unavailable.");
      return;
    }

    // Validate required choices — count only selectable ones
    if (required) {
      if (!isMultiple) {
        if (!choiceState.single) {
          setError("Please choose an option.");
          return;
        }
        const opt = normalizedChoices.find((o) => o.label === choiceState.single);
        if (!opt || !isOptionAvailable(opt)) {
          setError("Please choose an available option.");
          return;
        }
      } else {
        if (!choiceState.multiple || choiceState.multiple.size === 0) {
          setError("Please choose at least one option.");
          return;
        }
        const anySelectable = Array.from(choiceState.multiple).some((label) => {
          const o = normalizedChoices.find((n) => n.label === label);
          return !!o && isOptionAvailable(o);
        });
        if (!anySelectable) {
          setError("Please choose at least one available option.");
          return;
        }
      }
    }

    // Build separate payloads with kind
    const choicePayload: ChoiceSelected[] = selectedOptions.map((o) => ({
      id: o.id,
      label: o.label,
      price: o.price,
      kind: "choice",
    }));

    const addonPayload: ChoiceSelected[] = selectedAddOns.map((a) => ({
      id: a.id,
      label: a.label,
      price: a.price,
      kind: "addon",
    }));

    addToCart({
      id: menu.id,
      name: menu.title,
      price: basePrice,
      quantity: qty,
      image: imageUrl,
      choices: choicePayload.length > 0 ? choicePayload : undefined,
      addons: addonPayload.length > 0 ? addonPayload : undefined,
      available: isAvailable,
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
          <MenuTypePill menuType={effectiveMenuType} />
        </div>

        <div className="form-container p-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h4 className="mb-0 font-family-body fw-bold">{menu.title}</h4>
            {!isAvailable && <span className="badge bg-danger">Unavailable</span>}
          </div>

          {details.menuDescription && <p className="">{details.menuDescription}</p>}

          <hr className="border-secondary" />

          {/* CHOICES */}
          {normalizedChoices.length > 0 && (
            <>
              <div className="mb-3">
                <strong className="d-block mb-2">CHOICES</strong>
                {normalizedChoices.map((opt) => {
                  const checked = isMultiple ? choiceState.multiple?.has(opt.label) ?? false : choiceState.single === opt.label;
                  const disabled = !isOptionAvailable(opt);
                  const labelText = `${opt.label}${opt.price ? ` (+ ${formatPrice(opt.price)})` : ""}${disabled ? " (Unavailable)" : ""}`;

                  if (isMultiple) {
                    return (
                      <Form.Check
                        key={opt.id}
                        type="checkbox"
                        id={opt.id}
                        label={labelText}
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
                        label={labelText}
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

          {/* ADD ONS */}
          {normalizedAddOns.length > 0 && (
            <>
              <div className="mb-3">
                <strong className="d-block mb-2">ADD ONS</strong>
                {normalizedAddOns.map((a) => {
                  const checked = addonState ? addonState.has(a.label) : false;
                  const disabled = !isOptionAvailable(a);
                  const labelText = `${a.label}${a.price ? ` (+ ${formatPrice(a.price)})` : ""}${disabled ? " (Unavailable)" : ""}`;

                  return (
                    <Form.Check
                      key={a.id}
                      type="checkbox"
                      id={a.id}
                      label={labelText}
                      checked={checked}
                      onChange={() => toggleAddOn(a.label)}
                      disabled={disabled}
                    />
                  );
                })}
                <div className="small text-muted mt-1">You can select multiple add ons.</div>
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
