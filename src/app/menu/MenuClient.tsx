"use client";

import { useState } from "react";
import MenuCard from "@/components/MenuCard";
import MenuCategoriesAside from "@/components/MenuCategoriesAside";
import { MenuItem, CategoryNode } from "@/types/menu";
import OrderTypeModal from "@/components/OrderTypeModal";

interface MenuClientProps {
  menus: MenuItem[];
  allCategories: CategoryNode[];
  groupedMenus: Record<
    string,
    { name: string; slug: string; children: Record<string, { name: string; items: MenuItem[] }> }
  >;
}

export default function MenuClient({
  menus,
  allCategories,
  groupedMenus,
}: MenuClientProps) {
  const [showModal, setShowModal] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const handleConfirm = (details: any) => {
    setOrderDetails(details);
    console.log("Order details selected:", details);
  };

  return (
    <>
      <OrderTypeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />

      <section className="info bg-brand-light">
        <div className="container">
          <h1 className="fs-2 fw-bold mb-6">Our Menu</h1>

          <div className="info-container mt-4">
            <div className="row g-4">
              <MenuCategoriesAside categories={allCategories} />
              <div className="col-lg-9 col-md-8">
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
