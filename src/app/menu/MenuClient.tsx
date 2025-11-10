"use client";

import { useEffect, useState } from "react";
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

export default function MenuClient({ menus, allCategories, groupedMenus }: MenuClientProps) {
  const { orderMode, setOrderMode } = useCart();

  // const [showModal, setShowModal] = useState(false);
  // const [pendingMode, setPendingMode] = useState<"pickup" | "delivery">("pickup");

  // // ✅ Show the modal when user visits menu first time or if mode not selected
  // useEffect(() => {
  //   const savedMode = sessionStorage.getItem("orderMode") as "pickup" | "delivery" | null;
  //   if (!savedMode) {
  //     setShowModal(true);
  //   } else {
  //     setOrderMode(savedMode);
  //     setPendingMode(savedMode);
  //   }
  // }, [setOrderMode]);


   // Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleOrderModeClick = (mode: "pickup" | "delivery") => {
    // Update global order mode first
    setOrderMode(mode);

    // Open modal only if delivery is selected
    if (mode === "delivery") {
      setShowOrderModal(true);
    } else {
      setShowOrderModal(false);
    }
  };
  
  return (
    <>
       {/* ✅ Shared Order Type Modal */}
        <OrderTypeModal show={showOrderModal} onClose={() => setShowOrderModal(false)} />

      {/* Menu Section */}
      <section className="info bg-brand-light">
        <div className="container">
         

          <div className="info-container mt-4">
            <div className="row g-4">
              {/* Sidebar with category links */}
              <MenuCategoriesAside categories={allCategories} />

              {/* Menu Grid */}
              <div className="col-lg-9 col-md-8">
                <div className="mb-5">
                  {/* ✅ Order mode toggle (shared button group style) */}
                  <div className="btn-group mb-4 w-100" role="group" aria-label="Order Type">
                    {["pickup", "delivery"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`btn ${
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
                {Object.entries(groupedMenus).map(([parentSlug, parentGroup]) => (
                  <div key={parentSlug} id={parentSlug} className="mb-5">
                    <h4 className="fw-bold text-brand-green mb-4">{parentGroup.name}</h4>

                    {Object.entries(parentGroup.children).map(([childSlug, childGroup]) => (
                      <div key={childSlug} id={childSlug} className="mb-4">
                        <h6 className="fw-semibold text-brand-brown font-family-body mb-3">
                          {childGroup.name}
                        </h6>

                        <div className="row g-4">
                          {childGroup.items.map((menu) => (
                            <div key={menu.id} className="col-xl-6 col-md-12 col-12">
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
