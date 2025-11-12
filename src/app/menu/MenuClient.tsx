"use client";

import { useState, useEffect } from "react";
import MenuCard from "@/components/MenuCard";
import MenuCategoriesAside from "@/components/MenuCategoriesAside";
import OrderModeSelector from "@/components/OrderModeSelector";
import OrderTypeModal from "@/components/OrderTypeModal";
import PlaceHeader from "@/components/PlaceHeader";
import { useCart } from "@/context/CartContext";
import { MenuItem, CategoryNode } from "@/types/menu";

interface MenuClientProps {
  allCategories: CategoryNode[];
  groupedMenus: Record<
    string,
    { name: string; slug: string; children: Record<string, { name: string; items: MenuItem[] }> }
  >;
}

export default function MenuClient({ allCategories, groupedMenus }: MenuClientProps) {
  const { orderConfirmed, setOrderConfirmed, orderMode } = useCart();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [prevMode, setPrevMode] = useState(orderMode);

  // ✅ Detect orderMode change and trigger modal automatically
  useEffect(() => {
    if (orderMode !== prevMode) {
      setOrderConfirmed(false); // reset confirmation
      setShowOrderModal(true);  // open modal for new mode
      setPrevMode(orderMode);
    }
  }, [orderMode, prevMode, setOrderConfirmed]);

  const handleDeliverySelect = () => {
    setShowOrderModal(true);
  };

  return (
    <>
      <OrderTypeModal
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setOrderConfirmed(true); // mark confirmed when modal closes
        }}
      />

      <section className="info bg-brand-light">
        <div className="container">
          <div className="info-container mt-4">
            <div className="row g-4">
              <MenuCategoriesAside categories={allCategories} />

              <div className="col-lg-9 col-md-8">
                <div className="mb-2">
                  <PlaceHeader />
                  <OrderModeSelector onDeliverySelect={handleDeliverySelect} />
                </div>

                {Object.entries(groupedMenus).map(([parentSlug, parentGroup]) => (
                  <div key={parentSlug} id={parentSlug} className="mb-5">
                    <h4 className="fw-bold text-brand-green mb-4">{parentGroup.name}</h4>
                    {Object.entries(parentGroup.children).map(([childSlug, childGroup]) => (
                      <div key={childSlug} id={childSlug} className="mb-4">
                        <h6 className="fw-semibold font-family-body text-brand-brown mb-3">
                          {childGroup.name}
                        </h6>
                        <div className="row g-4">
                          {childGroup.items.map((menu) => (
                            <div key={menu.id} className="col-xl-6 col-md-12">
                              <MenuCard onDeliverySelect={handleDeliverySelect} menu={menu} />
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
