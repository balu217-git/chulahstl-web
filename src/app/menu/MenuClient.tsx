// src/app/menu/MenuClient.tsx
"use client";

import { useState, useEffect } from "react";
import MenuCard from "@/components/MenuCard";
import MenuCategoriesAside from "@/components/MenuCategoriesAside";
import OrderModeSelector from "@/components/OrderModeSelector";
import OrderTypeModal from "@/components/OrderTypeModal";
import OrderModeAddress from "@/components/OrderModeAddress";
import Address from "@/components/Address";
import type { SelectedPlace } from "@/components/AddressPicker";
import TimePickerModal from "@/components/TimePickerModal";
import { useCart } from "@/context/CartContext";
import { MenuItem, CategoryNode } from "@/types/menu";

interface MenuClientProps {
  allCategories: CategoryNode[];
  groupedMenus: Record<
    string,
    {
      name: string;
      slug: string;
      children: Record<string, { name: string; items: MenuItem[] }>;
    }
  >;
}

export default function MenuClient({
  allCategories,
  groupedMenus,
}: MenuClientProps) {
  const { setOrderConfirmed, orderMode, addressPlace, setDeliveryTime } =
    useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [prevMode, setPrevMode] = useState(orderMode);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [weekdayText, setWeekdayText] = useState<string[] | null>(null);

  /* ---------------------------------------------------------
     OPEN ORDER MODE MODAL WHEN MODE CHANGES
  --------------------------------------------------------- */
  useEffect(() => {
    if (orderMode !== prevMode) {
      setOrderConfirmed(false);
      setShowOrderModal(true);
      setPrevMode(orderMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderMode, prevMode]);

  const handleDeliverySelect = () => setShowOrderModal(true);

  /* ---------------------------------------------------------
     LOAD GOOGLE BUSINESS HOURS FOR TIME PICKER
  --------------------------------------------------------- */
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
          if (mounted) setWeekdayText(null);
          return;
        }
        const j = await res.json();
        if (mounted)
          setWeekdayText(j?.opening_hours?.weekday_text || null);
      } catch (err) {
        console.error("Failed to fetch opening hours:", err);
        if (mounted) setWeekdayText(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showTimePicker]);

  /* ---------------------------------------------------------
     SAVE PICKED TIME
  --------------------------------------------------------- */
  const handleTimeConfirm = (iso: string) => {
    setDeliveryTime(iso);
    setShowTimePicker(false);
  };

  /* ---------------------------------------------------------
     TIMEZONE (PICKUP/DELIVERY)
  --------------------------------------------------------- */
  const ap = addressPlace as SelectedPlace | null | undefined;
  const timeZone =
    ap?.timeZoneId ??
    process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ??
    "America/Chicago";

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <>
      {/* ORDER MODE MODAL */}
      <OrderTypeModal
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setOrderConfirmed(true);
        }}
      />

      {/* TIME PICKER MODAL */}
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

      {/* MAIN MENU LAYOUT */}
      <section className="info bg-brand-light">
        <div className="container">
          <div className="info-container mt-4">
            <div className="row g-4">
              
              {/* LEFT ASIDE CATEGORY NAV */}
              <MenuCategoriesAside categories={allCategories} />

              {/* RIGHT CONTENT AREA */}
              <div className="col-lg-9 col-md-8">
                <div className="mb-2">
                  <Address />
                  <div className="row gx-2">
                    <div className="col-md-auto">
                      <OrderModeSelector
                        onAddressSelect={handleDeliverySelect}
                      />
                    </div>
                    <div className="col-md-auto">
                      <OrderModeAddress
                        onAddressSelect={handleDeliverySelect}
                        onTimeSelect={() => setShowTimePicker(true)}
                      />
                    </div>
                  </div>
                </div>

                {/* PARENT + CHILD CATEGORY SECTIONS */}
                {Object.entries(groupedMenus).map(
                  ([parentSlug, parentGroup]) => (
                    <div
                      key={parentSlug}
                      id={parentGroup.slug}
                      data-menu-section={parentGroup.slug}
                      className="my-5"
                    >
                      <h4 className="fw-bold text-brand-green mb-4">
                        {parentGroup.name}
                      </h4>

                      {Object.entries(parentGroup.children).map(
                        ([childSlug, childGroup]) => (
                          <div
                            key={childSlug}
                            id={childSlug}
                            data-menu-section={childSlug}
                            className="mb-4"
                          >
                            <h6 className="fw-semibold font-family-body text-brand-brown mb-3">
                              {childGroup.name}
                            </h6>

                            <div className="row g-4">
                              {childGroup.items.map((menu) => (
                                <div
                                  key={menu.id}
                                  className="col-xl-6 col-md-12"
                                >
                                  <MenuCard
                                    onAddressSelect={handleDeliverySelect}
                                    menu={menu}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
