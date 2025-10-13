"use client";
// import Image from "next/image";

export default function ComingSoon() {

  return (

    <section
      className="hero bg-brand-light text-center text-white d-flex align-items-center justify-content-center"
      style={{
        minHeight: "80vh"
      }}
    >
        <div className="container">
            <div className="hero-content">
                <h1 className="fw-bold text-dark mb-3 fs-2">Exquisite Cocktails, mocktails, bourbons, wines, whiskies, beers and more - Coming Soon.</h1>
              {/* <p className="text-muted mb-4">
                Our website is getting a delicious makeover. Stay uned!
              </p> */}
            </div>
        </div>
    </section>

  );
}
