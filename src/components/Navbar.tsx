"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CartIcon from "@/components/CartIcon";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";


export default function Navbar() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const pathname = usePathname();

  const { cart } = useCart();
  const [showDrawer, setShowDrawer] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // helper function for active link
  const isActive = (path: string) => pathname === path;

  return (
    <>
    <header id="main-header" className="sticky-top">
      <nav className="navbar bg-white navbar-expand-lg border-bottom border-1">
        <div className="container">
          {/* Mobile Logo */}
          <Link className="navbar-brand d-lg-none" href="/">
            <Image
              className="navbar-brand-logo"
              src="/chulah-logo-green.png"
              alt="Chulah Logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Mobile Toggle */}
          <button className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Navigation */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="d-md-flex w-100 align-items-center">
              {/* Left Navigation Section */}
              <div className="nav-section-left">
                <ul className="navbar-nav d-flex align-items-center">
                  {/* Dropdown Menu */}
                  <li className="nav-item dropdown">
                    <Link className={`nav-link dropdown-toggle ${
                        pathname.startsWith("/quick-service-lunches") ||
                        pathname.startsWith("/alcohols")
                          ? "active"
                          : ""
                      }`}
                      href="#"
                      id="menuDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Menu
                    </Link>

                    <ul className="dropdown-menu"
                      aria-labelledby="menuDropdown"
                    >
                      <li>
                        {/* <Link className={`dropdown-item ${
                            pathname === "/quick-service-lunches" ? "active" : ""
                          }`}
                          href="/quick-service-lunches"
                        >
                          Quick Service Lunches
                        </Link> */}
                        <Link className="dropdown-item"
                          target="_blank"
                          href="/chulah-lunch-tv-poster.pdf"
                        >
                          Quick Service Lunches
                        </Link>
                      </li>
                      <li>
                        <Link className={`dropdown-item ${
                            pathname === "/alcohol" ? "active" : ""
                          }`}
                          href="/alcohols"
                        >
                          Alcohols
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item"
                          target="_blank"
                          href="/chulah-dinner-menu.pdf"
                        >
                          Dining
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item">
                    <Link className={`nav-link ${
                        isActive("/ourstory") ? "active" : ""
                      }`}
                      href="/ourstory"
                    >
                      Our Story
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${
                        isActive("/catering") ? "active" : ""
                      }`}
                      href="/catering"
                    >
                      Catering
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Center Logo (Desktop Only) */}
              <div className="navbar-brand-center d-none d-lg-block">
                <Link className="navbar-brand m-0" href="/">
                  <Image
                    src="/chulah-logo-green.png"
                    alt="Chulah Logo"
                    className="navbar-brand-logo"
                    width={180}
                    height={90}
                    priority
                  />
                </Link>
              </div>

              {/* Right Navigation Section */}
              <div className="nav-section-right">
                <ul className="navbar-nav d-flex align-items-center">
                  <li className="nav-item">
                    <Link className={`nav-link ${
                        isActive("/private-dining") ? "active" : ""
                      }`}
                      href="/private-dining"
                    >
                      Reservation
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${
                        isActive("/contact") ? "active" : ""
                      }`}
                      href="/contact"
                    >
                      Contact
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`btn btn-brand-green ms-md-2 ${
                        isActive("/quick-service-lunches") ? "active" : ""
                      }`}
                      href="/quick-service-lunches"
                    >
                      Order Online
                    </Link>
                  </li>
                   {/* {cart.length > 0 && (
                    <li className="nav-item">
                      <CartIcon mode="page" />
                    </li>
                    )} */}
                    <li className="nav-item">
                      <CartIcon mode="drawer" onOpenDrawer={() => setShowDrawer(true)} />
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
     <CartDrawer show={showDrawer} onClose={() => setShowDrawer(false)} />
     </>
  );
}
