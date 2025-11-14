// components/MenuClient.tsx
"use client";

import { useState, useEffect } from "react";
import MenuCard from "@/components/MenuCard";
import MenuCategoriesAside from "@/components/MenuCategoriesAside";
import OrderModeSelector from "@/components/OrderModeSelector";
import OrderTypeModal from "@/components/OrderTypeModal";
import OrderModeAddress from "@/components/OrderModeAddress";
import Address from "@/components/Address";
import TimePickerModal from "@/components/TimePickerModal";
import { useCart } from "@/context/CartContext";
import { MenuItem, CategoryNode } from "@/types/menu";
import type { SelectedPlace } from "@/components/AddressPicker";

interface MenuClientProps {
  allCategories: CategoryNode[];
  groupedMenus: Record<
    string,
    { name: string; slug: string; children: Record<string, { name: string; items: MenuItem[] }> }
  >;
}

export default function MenuClient({ allCategories, groupedMenus }: MenuClientProps) {
  const {
    setOrderConfirmed,
    orderMode,
    addressPlace,
    setDeliveryTime,
  } = useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [prevMode, setPrevMode] = useState(orderMode);

  // TimePicker state lifted to parent
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  // Open the order-type modal when orderMode changes
  useEffect(() => {
    if (orderMode !== prevMode) {
      setOrderConfirmed(false); // reset confirmation
      setShowOrderModal(true); // open modal for new mode
      setPrevMode(orderMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderMode, prevMode]);

  const handleDeliverySelect = () => {
    setShowOrderModal(true);
  };

  // Fetch weekday_text (or other opening hours) when timepicker opens.
  useEffect(() => {
    if (!showTimePicker) {
      setWeekdayText(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/google-reviews");
        if (!res.ok) {
          if (!mounted) return;
          setWeekdayText(null);
          return;
        }
        const j = await res.json();
        if (!mounted) return;
        setWeekdayText(j?.opening_hours?.weekday_text || null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch opening hours:", err);
        if (!mounted) return;
        setWeekdayText(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showTimePicker]);

  // Handler when time is chosen in TimePickerModal
  const handleTimeConfirm = (iso: string) => {
    // Write into cart
    setDeliveryTime(iso);
    // Close picker
    setShowTimePicker(false);
  };

  // timeZone for TimePicker: prefer selected place timezone, fallback to env default
  const ap = addressPlace as SelectedPlace | null | undefined;
  const timeZone = ap?.timeZoneId ?? process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "America/Chicago";

  return (
    <>
      {/* Address selector and change control */}
      <OrderTypeModal
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setOrderConfirmed(true); // mark confirmed when modal closes
        }}
      />

      {/* TimePickerModal is parent-controlled now */}
      <TimePickerModal
        show={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        mode={orderMode === "pickup" ? "pickup" : "delivery"}
        weekdayText={weekdayText}
        timeZone={timeZone}
        slotMinutes={15}
        daysAhead={9}
        onConfirm={handleTimeConfirm}
      />

      <section className="info bg-brand-light">
        <div className="container">
          <div className="info-container mt-4">
            <div className="row g-4">
              <MenuCategoriesAside categories={allCategories} />

              <div className="col-lg-9 col-md-8">
                <div className="mb-2">
                  <Address />
                  <div className="row gx-2">
                    <div className="col-md-auto">
                      <OrderModeSelector onAddressSelect={handleDeliverySelect} />
                    </div>
                    <div className="col-md-auto">
                      <OrderModeAddress
                        onAddressSelect={handleDeliverySelect}
                        onTimeSelect={() => setShowTimePicker(true)}
                      />
                    </div>
                  </div>
                </div>

                {Object.entries(groupedMenus).map(([parentSlug, parentGroup]) => (
                  <div key={parentSlug} id={parentSlug} className="my-5">
                    <h4 className="fw-bold text-brand-green mb-4">{parentGroup.name}</h4>
                    {Object.entries(parentGroup.children).map(([childSlug, childGroup]) => (
                      <div key={childSlug} id={childSlug} className="mb-4">
                        <h6 className="fw-semibold font-family-body text-brand-brown mb-3">
                          {childGroup.name}
                        </h6>
                        <div className="row g-4">
                          {childGroup.items.map((menu) => (
                            <div key={menu.id} className="col-xl-6 col-md-12">
                              <MenuCard onAddressSelect={handleDeliverySelect} menu={menu} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
