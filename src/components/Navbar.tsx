"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <header id="main-header" className="sticky-top">
      <nav className="navbar bg-white navbar-expand-lg border-bottom border-1">
        <div className="container">
          {/* Mobile Logo */}
          <Link className="navbar-brand d-lg-none" href="/">
            <Image
              className="navbar-brand-logo"
              src="/chulah-logo-green.png"
              alt="Next.js logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
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
                    <Link
                      className="nav-link dropdown-toggle"
                      href="#"
                      id="menuDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Menu
                    </Link>
                    <ul className="dropdown-menu" aria-labelledby="menuDropdown">
                      <li>
                        <Link className="dropdown-item" href="/menu/quick-service">
                          Quick Service
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="/menu/alcohol">
                          Alcohol
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" target="_blank" href="/chulah-dinner-menu.pdf">
                          Dining
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link" href="/ourstory">
                      Our Story
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" href="/catering">
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
                    alt="Logo"
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
                    <Link className="nav-link" href="/private-dining">
                      Reservation
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" href="/contact">
                      Contact
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="btn btn-brand-green ms-md-2"
                      href="/book-table"
                    >
                      Order Online
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
