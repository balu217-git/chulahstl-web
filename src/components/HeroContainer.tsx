"use client"; // optional if you use hooks inside

import Image from "next/image";

type HeroContainerProps = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  heroImage?: string; // camelCase is standard
  heroImageAlt?: string;
};

export default function HeroContainer({
  title,
  subtitle,
  ctaText,
  ctaLink,
  heroImage,
  heroImageAlt = "Hero image",
}: HeroContainerProps) {
  return (
    <section className="info bg-brand-green text-center text-white d-flex align-items-center justify-content-center"
      style={{ minHeight: "70vh", background: "var(--brand-green)" }}
    >
      <div className="container">
        <h1 className="display-6 fw-semibold mb-4">{title}</h1>
        {heroImage && (
          <Image
            className="img-fluid rounded rounded-5 mb-4"
            src={heroImage}
            alt={heroImageAlt}
            width={1000}
            height={600}
            priority
          />
        )}

        {subtitle && <div className="row justify-content-center">
          <div className="col-md-9">
            <p>{subtitle}</p>
          </div>
        </div>}
        {/* {ctaText && ctaLink && (
          <a href={ctaLink} className="btn btn-brand-orange mt-3">
            {ctaText}
          </a>
        )} */}
      </div>
    </section>
  );
}
