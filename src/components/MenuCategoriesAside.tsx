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
import "../../public/css/menuAsideStyles.css"; // keep your CSS for shadows / underline / scrollbar hiding

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

/** small interface for the parts of the slider we call */
interface SlickRef {
  slickGoTo?: (index: number) => void;
}

/**
 * Dynamic import for react-slick. We cast to a component type that
 * accepts a ref callback of unknown (no `any`).
 */
const RawSlider = dynamic(() => import("react-slick"), { ssr: false });
const Slider = (RawSlider as unknown) as React.ComponentType<
  Settings & { ref?: (node: unknown) => void }
>;

export default function MenuCategoriesAside({
  categories,
}: MenuCategoriesAsideProps) {
  // selected slug
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // when true we render slider (mobile/tablet). `true` when width <= 991px
  const [isSliderMode, setIsSliderMode] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 991 : false
  );

  // computed top offset (header height)
  const [topOffset, setTopOffset] = useState<number>(0);

  // refs
  const sliderRef = useRef<SlickRef | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  /* -------------------------------------------------------------------
     Group categories by parent (deduplicate)
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
     Default active category
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (groupedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(groupedCategories[0][1].slug);
    }
  }, [groupedCategories, selectedCategory]);

  /* -------------------------------------------------------------------
     Resize listener -> toggle slider mode and recalc top offset
  ------------------------------------------------------------------- */
  useEffect(() => {
    const recomputeTop = () => {
      // prefer header element, fallback to element with .navbar
      const header = document.querySelector<HTMLElement>("header, .navbar");
      const headerHeight = header?.offsetHeight ?? 0;
      setTopOffset(headerHeight);
    };

    const onResize = () => {
      setIsSliderMode(window.innerWidth <= 991);
      recomputeTop();
    };

    // initial
    onResize();

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    // if header height can change on scroll (rare), recompute on scroll too
    window.addEventListener("scroll", recomputeTop, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("scroll", recomputeTop);
    };
  }, []);

  /* -------------------------------------------------------------------
     Scroll shadow logic (desktop vertical aside only)
     NOTE: we rely on your CSS to hide native scrollbar if you don't want visible scrollbar.
  ------------------------------------------------------------------- */
  useEffect(() => {
    if (isSliderMode) return;

    const el = asideRef.current;
    if (!el) return;

    const updateShadows = () => {
      const topShadow = el.querySelector(".scroll-shadow-top") as HTMLElement | null;
      const bottomShadow = el.querySelector(".scroll-shadow-bottom") as HTMLElement | null;
      if (!topShadow || !bottomShadow) return;
      topShadow.style.opacity = el.scrollTop > 5 ? "1" : "0";
      bottomShadow.style.opacity = el.scrollHeight - el.scrollTop > el.clientHeight + 5 ? "1" : "0";
    };

    updateShadows();
    el.addEventListener("scroll", updateShadows, { passive: true });
    return () => el.removeEventListener("scroll", updateShadows);
  }, [isSliderMode]);

  /* -------------------------------------------------------------------
     ScrollSpy (activate when section crosses ~25% of viewport)
     We use IntersectionObserver rootMargin so the active section is picked
     when it crosses roughly 25% from top (rootMargin -50% / -50% works).
  ------------------------------------------------------------------- */
  useEffect(() => {
    // cleanup existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-menu-section]"));
    if (!sections.length) return;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
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

      // Desktop: ensure the active pill becomes visible inside the aside (scrollIntoView within aside)
      if (!isSliderMode) {
        const activeEl = asideRef.current?.querySelector<HTMLElement>(`.nav-link[data-slug="${id}"]`) ?? null;
        if (activeEl) {
          // scroll active item into view within the aside container:
          activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }

      // Slider mode: sync the slider position
      if (isSliderMode && sliderRef.current && typeof sliderRef.current.slickGoTo === "function") {
        const slideEls = Array.from(document.querySelectorAll<HTMLElement>(".menu-cats-slider .nav-link"));
        const index = slideEls.findIndex((s) => s.getAttribute("data-slug") === id);
        if (index >= 0) sliderRef.current.slickGoTo(index);
      }
    }, options);

    sections.forEach((s) => observerRef.current?.observe(s));

    return () => observerRef.current?.disconnect();
  }, [isSliderMode, groupedCategories]);

  /* -------------------------------------------------------------------
     Slick settings
  ------------------------------------------------------------------- */
  const sliderSettings: Settings = {
    arrows: true,
    dots: false,
    infinite: false,
    slidesToShow: Math.min(groupedCategories.length || 1, 1),
    slidesToScroll: 1,
    variableWidth: true,
    swipeToSlide: true,
  };

  /* -------------------------------------------------------------------
     Scroll-to handler (compensates for header height)
  ------------------------------------------------------------------- */
  const handleClick = (e: MouseEvent, slug: string) => {
    e.preventDefault();
    setSelectedCategory(slug);

    const el = document.getElementById(slug);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const desired = rect.top + scrollTop - topOffset - 25; // 12px gap
    window.scrollTo({ top: desired, behavior: "smooth" });
  };

  /* -------------------------------------------------------------------
     Render
  ------------------------------------------------------------------- */
  return (
    <aside
      ref={asideRef}
      className="aside-sticky-top scrollbars-hidden"
      style={{
        position: "sticky",
        top: topOffset + 25,
        maxHeight: `calc(100vh - ${topOffset}px - 50px )`,
        overflowY: isSliderMode ? "visible" : "auto", // keep auto so we can scroll active pill into view; hide scrollbar via CSS
      }}
    >
      {/* optional scroll shadows for desktop vertical aside (CSS classes should style them) */}
      {!isSliderMode && <div className="scroll-shadow-top" aria-hidden="true" />}
      {!isSliderMode && <div className="scroll-shadow-bottom" aria-hidden="true" />}

      {/* header/title - for small screens the title is shown above content in MenuClient */}
      {/* <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h2 className="fs-6 fw-bold mb-0">Categories</h2>
      </div> */}

      {isSliderMode ? (
        <div className="menu-cats-slider nav-pills">
          <Slider
            // safe ref callback (no `any`)
            ref={(node: unknown) => {
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
        <nav className="nav flex-column nav-pills">
          {groupedCategories.map(([id, group]) => (
            <div key={id} className="mb-2">
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
