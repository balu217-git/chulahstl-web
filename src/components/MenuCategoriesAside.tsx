// src/components/MenuCategoriesAside.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  MouseEvent,
} from "react";
import dynamic from "next/dynamic";
import type { Settings } from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../public/css/menuAsideStyles.css"; // your CSS for shadows + underline

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

/**
 * Minimal interface describing the slider methods we call.
 * Keeps typing explicit and avoids using `any` all over the file.
 */
interface SlickRef {
  slickGoTo?: (index: number) => void;
}

/**
 * dynamic import of react-slick for client-only render.
 * We'll cast the imported component to a ComponentType that accepts a `ref` callback
 * so we can safely attach our sliderRef without TypeScript complaining.
 */
const RawSlider = dynamic(() => import("react-slick"), { ssr: false });
const Slider = (RawSlider as unknown) as React.ComponentType<Settings & { ref?: (node: unknown) => void }>;

export default function MenuCategoriesAside({
  categories,
}: MenuCategoriesAsideProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // slider mode when width <= 1024 (matches your prior logic)
  const [isWide, setIsWide] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 1024 : false
  );

  const sliderRef = useRef<SlickRef | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------------------
     GROUP CATEGORIES BY PARENT
  ------------------------------------------------------------------- */
  const groupedCategories = useMemo(() => {
    const parents: Record<string, { name: string; slug: string; children: Category[] }> = {};

    categories.forEach((cat) => {
      const parent = cat.parent?.node;
      const key = `${cat.id}-${cat.slug}`;

      if (parent) {
        if (!parents[parent.id]) {
          parents[parent.id] = { name: parent.name, slug: parent.slug, children: [] };
        }
        if (!parents[parent.id].children.find((c) => `${c.id}-${c.slug}` === key)) {
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

  /* -------------------------------------------------------------------
     DEFAULT SELECT FIRST CATEGORY
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (groupedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(groupedCategories[0][1].slug);
    }
  }, [groupedCategories, selectedCategory]);

  /* -------------------------------------------------------------------
     WINDOW RESIZE
  ------------------------------------------------------------------- */
  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------------------------------------------------------
     SCROLL SHADOW LOGIC (desktop vertical aside only)
  ------------------------------------------------------------------- */
  useEffect(() => {
    // only apply shadows when not in slider mode (i.e., desktop vertical nav)
    if (isWide) return;

    const el = asideRef.current;
    if (!el) return;

    const updateShadows = () => {
      const topShadow = el.querySelector(".scroll-shadow-top") as HTMLElement | null;
      const bottomShadow = el.querySelector(".scroll-shadow-bottom") as HTMLElement | null;

      if (!topShadow || !bottomShadow) return;

      topShadow.style.opacity = el.scrollTop > 5 ? "1" : "0";
      bottomShadow.style.opacity =
        el.scrollHeight - el.scrollTop > el.clientHeight + 5 ? "1" : "0";
    };

    updateShadows();
    el.addEventListener("scroll", updateShadows);
    return () => el.removeEventListener("scroll", updateShadows);
  }, [isWide]);

  /* -------------------------------------------------------------------
     SCROLL SPY (25% from top activation)
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-menu-section]"));
    if (!sections.length) return;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "-50% 0px -50% 0px", // triggers when section crosses ~25% vertical point
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length === 0) return;

      const id = visible[0].target.getAttribute("data-menu-section");
      if (!id) return;

      setSelectedCategory(id);

      // For desktop vertical nav, scroll the active pill into view in the aside container
      if (!isWide) {
        const activeEl = document.querySelector(`.nav-link[data-slug="${id}"]`) as HTMLElement | null;
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }

      // For slider mode (mobile/tablet), sync the slide index
      if (isWide && sliderRef.current && typeof sliderRef.current.slickGoTo === "function") {
        const slideEls = Array.from(document.querySelectorAll<HTMLElement>(".menu-cats-slider .nav-link"));
        const index = slideEls.findIndex((s) => s.getAttribute("data-slug") === id);
        if (index >= 0) sliderRef.current.slickGoTo(index);
      }
    }, options);

    sections.forEach((s) => observerRef.current?.observe(s));

    return () => observerRef.current?.disconnect();
  }, [isWide, groupedCategories]);

  /* -------------------------------------------------------------------
     SLICK SETTINGS
  ------------------------------------------------------------------- */
  const sliderSettings: Settings = {
    arrows: true,
    dots: false,
    infinite: false,
    slidesToShow: Math.min(groupedCategories.length, 4),
    slidesToScroll: 1,
    variableWidth: true,
    swipeToSlide: true,
  };

  /* -------------------------------------------------------------------
     HANDLE CLICK => scroll to section
  ------------------------------------------------------------------- */
  const handleClick = (e: MouseEvent, slug: string) => {
    e.preventDefault();
    setSelectedCategory(slug);

    const el = document.getElementById(slug);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* -------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */
  return (
    <aside
      ref={asideRef}
      className="col-lg-3 col-md-4 p-4 bg-brand-light aside-sticky-top"
      style={{
        position: "sticky",
        top: 0,
        maxHeight: "100vh",
        overflowY: isWide ? "visible" : "auto",
      }}
    >
      {/* scroll shadows for desktop vertical aside */}
      {!isWide && <div className="scroll-shadow-top" />}
      {!isWide && <div className="scroll-shadow-bottom" />}

      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fs-4 fw-bold mb-0">Our Menu</h1>
      </div>

      {isWide ? (
        // Slider (mobile/tablet) - pass a ref-callback that stores the instance in sliderRef
        <div className="menu-cats-slider nav-pills">
          <Slider
            ref={(node: unknown) => {
              // node is the react-slick instance; we only need slickGoTo
              // store with a narrow type (SlickRef)
              sliderRef.current = (node as unknown) as SlickRef | null;
            }}
            {...sliderSettings}
          >
            {groupedCategories.map(([id, group]) => (
              <div key={id} style={{ width: "auto", paddingRight: 8 }}>
                <a
                  href={`#${group.slug}`}
                  data-slug={group.slug}
                  className={`nav-link nav-pill ${selectedCategory === group.slug ? "active-pill" : ""}`}
                  onClick={(e) => handleClick(e, group.slug)}
                >
                  {group.name}
                </a>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        // Desktop vertical nav
        <nav className="nav flex-column nav-pills">
          {groupedCategories.map(([id, group]) => (
            <div key={id} className="mb-3">
              <a
                href={`#${group.slug}`}
                data-slug={group.slug}
                className={`nav-link nav-pill ${selectedCategory === group.slug ? "active-pill" : ""}`}
                onClick={(e) => handleClick(e, group.slug)}
              >
                {group.name}
              </a>
            </div>
          ))}
        </nav>
      )}
    </aside>
  );
}
