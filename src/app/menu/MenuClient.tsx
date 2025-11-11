"use client";

import { useState } from "react";
import MenuCard from "@/components/MenuCard";
import MenuCategoriesAside from "@/components/MenuCategoriesAside";
import { MenuItem, CategoryNode } from "@/types/menu";
import OrderTypeModal from "@/components/OrderTypeModal";
import { useCart } from "@/context/CartContext";

interface MenuClientProps {
  menus: MenuItem[];
  allCategories: CategoryNode[];
  groupedMenus: Record<
    string,
    { name: string; slug: string; children: Record<string, { name: string; items: MenuItem[] }> }
  >;
}

export default function MenuClient({ allCategories, groupedMenus }: MenuClientProps) {
  const { orderMode, setOrderMode } = useCart();
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleOrderModeClick = (mode: "pickup" | "delivery") => {
    setOrderMode(mode);
    if (mode === "delivery") {
      // delay to avoid overlap animation conflicts
      setTimeout(() => setShowOrderModal(true), 150);
    }
  };

  return (
    <>
      <OrderTypeModal show={showOrderModal} onClose={() => setShowOrderModal(false)} />

      <section className="info bg-brand-light">
        <div className="container">
          <div className="info-container mt-4">
            <div className="row g-4">
              {/* --- Sidebar Categories --- */}
              <MenuCategoriesAside categories={allCategories} />

              {/* --- Menu Items --- */}
              <div className="col-lg-9 col-md-8">
                <div className="mb-5">
                  <div className="btn-group mb-4">
                    {["pickup", "delivery"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`btn btn-wide ${
                          orderMode === type
                            ? "btn-dark"
                            : "btn-outline-dark bg-transparent text-dark"
                        }`}
                        onClick={() => handleOrderModeClick(type as "pickup" | "delivery")}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* --- Grouped Menus --- */}
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
                              <MenuCard menu={menu} />
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
