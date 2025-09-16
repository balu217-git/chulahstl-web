"use client";

import React from "react";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define slide type
type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
  // If you have IDs in your slides, add here for better keys
  id?: string | number;
};

type HeroSliderProps = {
  slides: Slide[];
  settings?: Settings;
};

const HeroSlider: React.FC<HeroSliderProps> = ({
  slides = [],
  settings = {},
}) => {
  // Default slider settings (can be overridden via props)
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
          <div
            // ✅ Key on the top-level element
            className="hero-slide position-relative d-flex align-items-center justify-content-start text-white"
            style={{
              minHeight: "70vh",
              background: slide.image
                ? `url(${slide.image}) center/cover no-repeat`
                : "var(--brand-green)",
            }}
          >
            <div className="container">
              {slide.title && (
                <div className="row">
                  <div className="col-md-8">
                    <h2 className="display-3 fw-semibold">{slide.title}</h2>
                    {slide.subtitle && (
                      <p className="text-lg mt-3 md:mt-5">{slide.subtitle}</p>
                    )}
                    {/* Optional CTA button */}
                    {/* {slide.ctaText && slide.ctaLink && (
                    <a
                      href={slide.ctaLink}
                      className="btn btn-brand-yellow mt-4 inline-block"
                    >
                      {slide.ctaText}
                    </a>
                  )} */}
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
