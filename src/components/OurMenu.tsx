"use client";

import { useState } from "react";
import { menuData, Menu, MenuSection, MenuItem } from "../data/menuData";

interface OurMenuProps {
  bgImage?: string;
}

export default function OurMenu({ bgImage }: OurMenuProps) {
  const categories = Object.keys(menuData.menu) as Array<keyof Menu>;
  const [activeTab, setActiveTab] = useState<keyof Menu>(categories[0]);

  // 🧩 Helper to render menu items
  const renderMenuItems = (items: MenuItem[]) => (
    <table className="table table-sm table-borderless text-white">
      <tbody>
        {items.map((item) => (
          <tr key={item.name}>
            <td>{item.name}</td>
            <td className="text-end fw-semibold text-brand-yellow">
              {item.price}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // 🧠 Main renderer for a section (handles both array and grouped content)
  const renderSectionContent = (section: MenuSection) => {
    if (typeof section.content === "string") {
      return (
        <div className="col-12 text-center text-white fw-semibold">
          {section.content}
        </div>
      );
    }

    // If the content is a flat list of MenuItems
    if (Array.isArray(section.content) && section.content.length > 0 && "name" in section.content[0]) {
      return (
        <div className="col-12">
          {renderMenuItems(section.content as MenuItem[])}
        </div>
      );
    }

    // Otherwise, it's an array of subcategories
    const subcategories = section.content as {
      subcategory: string;
      items: MenuItem[];
    }[];

    return subcategories.map((sub) => (
      <div key={sub.subcategory} className="col-lg-6 col-md-6 col-sm-12">
        <h4 className="text-white mb-md-4 mb-3 fw-semibold">{sub.subcategory}</h4>
        {renderMenuItems(sub.items)}
      </div>
    ));
  };

  return (
    <section
      className="info bg-brand bg-brand-overlay"
      style={{
        minHeight: "70vh",
        background: bgImage
          ? `url(${bgImage}) center/cover no-repeat`
          : "var(--brand-green)",
      }}
    >
      <div className="container position-relative">
        <div className="info-heading row justify-content-center text-center">
          <div className="col-md-6">
            <p className="info-badge small info-badge-light">Our Menu</p>
            <h2 className="fw-bold text-white h1">Choose Your Special Menu</h2>
          </div>
        </div>

        <div className="row justify-content-center mt-5">
          <div className="col-md-10">
            {/* Tabs */}
            <ul
              className="nav nav-brand-pills border-bottom nav-pills pb-4 justify-content-evenly flex-wrap"
              role="tablist"
            >
              {categories.map((category) => (
                <li className="nav-item" role="presentation" key={category}>
                  <button
                    className={`nav-link ${
                      activeTab === category ? "active" : ""
                    }`}
                    type="button"
                    role="tab"
                    onClick={() => setActiveTab(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>

            {/* Tab Content */}
            <div className="tab-content p-lg-5 p-md-4 px-3 py-4 bg-brand mt-4 rounded-5">
              {categories.map((category) => {
                const section = menuData.menu[category];
                return (
                  <div
                    key={category}
                    className={`tab-pane fade ${
                      activeTab === category ? "show active" : ""
                    }`}
                    role="tabpanel"
                  >
                    {section.description && (
                      <p className="text-white mb-4 text-center">
                        {section.description}
                      </p>
                    )}
                    <div className="row gy-md-4 gx-md-5 g-3">
                      {renderSectionContent(section)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
