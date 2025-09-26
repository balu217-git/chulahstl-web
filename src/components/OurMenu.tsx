"use client";
import { useState } from "react";
import { menuData, Menu, MenuItem } from "../data/menuData";

interface OurMenuProps {
  bgImage?: string; // optional background image
}

export default function OurMenu({ bgImage }: OurMenuProps) {

  const categories = Object.keys(menuData.menu) as Array<keyof Menu>;
  const [activeTab, setActiveTab] = useState<keyof Menu>(categories[0]);

  const renderMenuItems = (items: MenuItem[] | Record<string, MenuItem[]>) => {
    // If nested object (like Alcohol), render subcategories
    if (!Array.isArray(items)) {
      return Object.keys(items).map((subCat) => (
        <div key={subCat} className="col-lg-6">
          <h4 className="text-white mb-md-4 mb-3 fw-semibold">{subCat}</h4>
          <table className="table table-sm table-borderless text-white">
            <tbody>
              {(items[subCat] as MenuItem[]).map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td className="text-end fw-semibold text-brand-yellow">
                    {item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ));
    }

    // Otherwise, render simple array
    return (
      <div className="col-12">
        <table className="table table-sm table-borderless text-white">
          <tbody>
            {(items as MenuItem[]).map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td className="text-end fw-semibold text-brand-yellow">
                  {item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
              className="nav nav-brand-pills border-bottom nav-pills pb-4 justify-content-evenly"
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
              {categories.map((category) => (
                <div
                  key={category}
                  className={`tab-pane fade ${
                    activeTab === category ? "show active" : ""
                  }`}
                  role="tabpanel"
                >
                  <div className="row gy-md-4 gx-md-5  g-3">
                    {renderMenuItems(menuData.menu[category])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
