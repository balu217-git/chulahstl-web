"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Footer from "../../components/Footer";
import Image from "next/image";

// Mock categories and menu items (replace later with DB/API)
const categories = [
    "Popular",
    "Starters",
    "Oven Grill",
    "Amrut Specials",
    "Entrees",
    "Main Course",
    "Naan/Bread",
    "Pasta",
    "Dosa",
    "Lunch Combo",
    "Chaat",
    "Salads",
    "Desserts",
    "Fried Rice",
    "Noodles",
    "Wings",
    "Amrut Xpress",
];

const menuItems = [
    {
        id: 1,
        category: "Popular",
        name: "Curdled Wings",
        price: 13.97,
        likes: 2,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Curdled+Wings",
    },
    {
        id: 2,
        category: "Popular",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 3,
        category: "Starters",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 4,
        category: "Entrees",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 5,
        category: "Oven Grill",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 6,
        category: "Oven Grill",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 7,
        category: "Entrees",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 8,
        category: "Starters",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 95,
        category: "Amrut Specials",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 10,
        category: "Amrut Specials",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 11,
        category: "Main Course",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 12,
        category: "Main Course",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 13,
        category: "Naan/Bread",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 14,
        category: "Naan/Bread",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 15,
        category: "Pasta",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 16,
        category: "Pasta",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 17,
        category: "Dosa",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 18,
        category: "Dosa",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 19,
        category: "Lunch Combo",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 204,
        category: "Lunch Combo",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 21,
        category: "Chaat",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 22,
        category: "Chaat",
        name: "Peri Peri Chicken Wings",
        price: 13.97,
        likes: 1,
        image: "https://dummyimage.com/600x600/00282a/fff&text=Peri+Peri+Wings",
    },
    {
        id: 23,
        category: "Salads",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
    {
        id: 24,
        category: "Salads",
        name: "Amrut Wrap With Fries",
        price: 9.97,
        description:
            "Soft Tortilla Wrap cooked with choice of dish, lettuce, ranch & homemade sauce.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Amrut+Wrap",
    },
];


export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [cart, setCart] = useState<any[]>([]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const normalizeId = (str: string): string => str.replace(/\s+/g, "_");

  // Add to cart
  const addToCart = (item: any) => {
    setCart((prev) => [...prev, item]);
  };

  // Scroll spy effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedCategory(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" } // triggers earlier
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
    <section className="info bg-brand-light">
      <div className="container min-vh-100">
        <div className="row">
          {/* Sidebar Categories */}
          <aside className="col-lg-3 col-md-4 p-4 position-sticky top-0 h-100">
            <h5 className="fw-bold mb-3 text-brand-green">Menu</h5>
            <nav className="nav-pills">
              {categories.map((cat) => {
                const id = normalizeId(cat);
                return (
                  <a
                    key={cat}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory(id);
                      document
                        .getElementById(id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`nav-link ${selectedCategory === id ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                    href={`#${id}`}
                  >
                    {cat}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Menu Items */}
          <main className="col-lg-9 col-md-8 p-4">
            {categories.map((cat) => {
              const id = normalizeId(cat);
              const items = menuItems.filter((item) => item.category === cat);
              if (items.length === 0) return null;

              return (
                <div
                  key={cat}
                  id={id}
                  ref={(el) => {
                    sectionRefs.current[id] = el;
                  }}
                  className="mb-5"
                >
                  <h4 className="fw-bold mb-4 text-dark">{cat}</h4>
                  <div className="row g-4">
                    {items.map((item) => (
                      <div key={item.id} className="col-xl-6 col-md-12 col-12">
                        <div className="card h-100 bg-white text-white border-0 d-grid">
                          <div className="row g-0">
                            <div className="col-lg-4 col-4">
                                <div className="position-relative h-100 w-100">
                                    <Image className="img-fluid rounded-start img-cart"
                                        src={item.image}
                                        alt={item.name}
                                        width={600}
                                        height={600}
                                        priority
                                    />
                                </div>
                            </div>
                            <div className="col-xl-8 col-8">
                              <div
                                className="card-body d-flex flex-column text-dark"
                                style={{ minHeight: "150px" }}
                              >
                                <p className="card-title fw-bold">{item.name}</p>

                                {item.description && (
                                  <p className="card-text small">{item.description}</p>
                                )}

                                {/* ✅ Price + button at bottom */}
                                <div className="mt-auto d-flex justify-content-between align-items-center">
                                  <span className="fw-semibold">
                                    ${item.price.toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="btn btn-cart btn-sm btn-brand-orange"
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </main>
           {/* Cart Sidebar */}
      <aside className="w-64 p-4 border-l border-gray-700">
        <h2 className="font-bold mb-4">Cart ({cart.length})</h2>
        <ul className="space-y-2">
          {cart.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        {cart.length > 0 && (
          <button className="mt-4 w-full bg-green-600 py-2 rounded hover:bg-green-700">
            Checkout
          </button>
        )}
      </aside>
        </div>
      </div>
    </section>
     <Footer/>
     </>
  );
}

