"use client"; // optional if you use hooks inside

// import Image from "next/image";

type HeroProps = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  bgImage?: string; // optional background image
};

export default function Hero({
  title,
  subtitle,
  ctaText,
  ctaLink,
  bgImage,
}: HeroProps) {
  return (
    <section
      className="hero bg-brand-green text-center text-white d-flex align-items-center justify-content-center"
      style={{
        minHeight: "70vh",
        background: bgImage
          ? `url(${bgImage}) center/cover no-repeat`
          : "var(--brand-green)",
      }}
    >
      <div className="container">
        <h1 className="display-3 fw-bold">{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
        {ctaText && ctaLink && (
          <a href={ctaLink} className="btn btn-brand-orange mt-3">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
