"use client";

import React, { useState, useMemo, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: {
    node?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  count?: number;
}

interface MenuCategoriesAsideProps {
  categories: Category[];
}

const MenuCategoriesAside: React.FC<MenuCategoriesAsideProps> = ({
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // ✅ Group categories by parent with deduplication
  const groupedCategories = useMemo(() => {
    const parents: Record<
      string,
      { name: string; slug: string; children: Category[] }
    > = {};

    categories.forEach((cat) => {
      const parent = cat.parent?.node;
      const uniqueKey = `${cat.id}-${cat.slug}`;

      if (parent) {
        if (!parents[parent.id]) {
          parents[parent.id] = { name: parent.name, slug: parent.slug, children: [] };
        }
        if (
          !parents[parent.id].children.find(
            (c) => `${c.id}-${c.slug}` === uniqueKey
          )
        ) {
          parents[parent.id].children.push(cat);
        }
      } else {
        if (!parents[cat.id]) {
          parents[cat.id] = { name: cat.name, slug: cat.slug, children: [] };
        }
      }
    });

    return Object.entries(parents);
  }, [categories]);

  // ✅ Set first parent category active by default
  useEffect(() => {
    if (groupedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(groupedCategories[0][1].slug);
    }
  }, [groupedCategories, selectedCategory]);

  return (
    <aside className="col-lg-3 col-md-4 p-4 aside-sticky-top sticky-top h-100 bg-brand-light">
      <nav className="nav flex-column nav-pills">
        {groupedCategories.map(([parentId, group]) => (
          <div key={parentId} className="mb-3">
            {/* Parent category */}
            <a
              className={`nav-link fw-semibold mb-2 ${
                selectedCategory === group.slug ? "active text-brand-green" : ""
              }`}
              href={`#${group.slug}`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory(group.slug);
                document
                  .getElementById(group.slug)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {group.name}
            </a>

            {/* Subcategories */}
            {/* {group.children.map((child) => (
              <a
                key={`${child.id}-${child.slug}`}
                href={`#${child.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory(child.slug);
                  document
                    .getElementById(child.slug)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`nav-link ps-3 ${
                  selectedCategory === child.slug
                    ? "active text-brand-green fw-bold"
                    : ""
                }`}
                style={{ cursor: "pointer" }}
              >
                {child.name}
              </a>
            ))} */}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default MenuCategoriesAside;
