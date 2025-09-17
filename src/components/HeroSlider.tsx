"use client";

import React, { useEffect, useState } from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define slide type
type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  id?: string | number;
};

type HeroSliderProps = {
  slides: Slide[];
  settings?: Settings;
  headerId?: string; // 👈 pass your header id here (default "site-header")
};

const HeroSlider = ({ slides = [], settings = {}, headerId = "site-header" }: HeroSliderProps) => {
  const [minHeight, setMinHeight] = useState<string>("95vh");

  useEffect(() => {
    const updateHeight = () => {
      const header = document.getElementById(headerId);
      const headerHeight = header ? header.offsetHeight : 0;
      setMinHeight(`${window.innerHeight - headerHeight}px`);
    };

    updateHeight(); // run on mount
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [headerId]);

  // Default slider settings
  const defaultSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    ...settings,
  };

  return (
    <Slider {...defaultSettings}>
      {slides.map((slide, index) => (
        <div key={slide.id ?? index}>
          <div className="hero-slide position-relative d-flex align-items-center justify-content-start text-white"
            style={{
              minHeight, // 👈 now dynamic
              background: slide.image
                ? `url(${slide.image}) center/cover no-repeat`
                : "var(--brand-green)",
            }}
          >
            <div className="container position-relative">
              {slide.title && (
                <div className="row">
                  <div className="col-md-8">
                    <h1 className="display-2 fw-semibold">{slide.title}</h1>
                    {slide.subtitle && (
                      <p className="text-lg mt-3 md:mt-5">{slide.subtitle}</p>
                    )}
                    {/* Optional CTA button */}
                    {slide.ctaText && slide.ctaLink && (
                    <a
                      href={slide.ctaLink}
                      className="btn btn-lg btn-brand-orange mt-4 inline-block"
                    >
                      {slide.ctaText}
                    </a>
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default HeroSlider;
