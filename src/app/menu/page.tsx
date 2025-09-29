"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

// import DeliveryLocation from "../../components/DeliveryLocation";
import { menuItems, MenuItem } from "../../data/menuCartData";
import { categories } from "../../data/categoriesData";
import Image from "next/image";


// -------------------- Component --------------------
export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("Popular");
    const [cart, setCart] = useState<MenuItem[]>([]);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const normalizeId = (str: string): string => str.replace(/\s+/g, "_");

    // Add to cart
    const addToCart = (item: MenuItem) => {
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
                <div className="container-fluid min-vh-100">
                    {/* <DeliveryLocation/> */}
                    <div className="row">
                        {/* Sidebar Categories */}
                        <aside className={`col-lg-3 col-md-4 p-4 sticky-top h-100`}>
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
                        <main className="col-lg-6 col-md-8 p-4">
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
                                                                    <Image
                                                                        className="img-fluid rounded-start img-cart"
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

                                                                    {/* Price + Add button */}
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
                        <aside className="col-lg-3 col-md-12 w-64 p-4 border-l border-gray-700">
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
                                <button className="btn btn-wide btn-brand-green">
                                    Checkout
                                </button>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}

