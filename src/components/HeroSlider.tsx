"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define slide type
type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
};

type HeroSliderProps = {
  slides: Slide[];
  settings?: Record<string, any>;
};

const HeroSlider: React.FC<HeroSliderProps> = ({ slides = [], settings = {} }) => {
  // Default slider settings (can be overridden via props)
  const defaultSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    ...settings,
  };

  return (
    <Slider {...defaultSettings}>
      {slides.map((slide, index) => (
        <div key={index} className="hero-slide relative">
          <img
            src={slide.image}
            alt={slide.title || `Slide ${index + 1}`}
            className="w-full"
          />
          {slide.title && (
            <div className="hero-caption absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
              <h2 className="text-3xl font-bold">{slide.title}</h2>
              {slide.subtitle && <p className="text-lg mt-2">{slide.subtitle}</p>}
            </div>
          )}
        </div>
      ))}
    </Slider>
  );
};

export default HeroSlider;
