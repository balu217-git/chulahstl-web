// import Hero from "../components/Hero";
import HeroSlider from "../components/HeroSlider";
import DishesGrid from "../components/DishesGrid";
import Image from "next/image";
const slidesData = [
  {
    image: "/images/dummy.webp",
    title: "Where the tradition meets Spirits",
    subtitle: "",
    ctaText: "Explore Menu",
    ctaLink: "/contact",
  },
  {
    image: "/images/dummy.webp",
    title: "Explore Features",
    subtitle: "",
    ctaText: "Explore Menu",
    ctaLink: "/contact",
  },
  {
    image: "/images/dummy.webp",
    title: "Join Us Today",
    subtitle: "",
    ctaText: "Explore Menu",
    ctaLink: "/contact",
  },
];

const dishesData = [
  {
    image: "/images/img-dish-01.webp",
    title: "Where the tradition meets Spirits",
    description: "Description",
  },
  {
    image: "/images/img-dish-02.webp",
    title: "Explore Features",
    description: "Description",
  },
  {
    image: "/images/img-dish-03.webp",
    title: "Join Us Today",
    description: "Description",
  },
  {
    image: "/images/img-dish-01.webp",
    title: "Join Us Today",
    description: "Description",
  },
];

export default function Home() {
  return (
    <>
      <HeroSlider slides={slidesData} headerId="main-header" />

      {/* <Hero
        title="Welcome to Chulauh"
        subtitle="Experience the taste of excellence"
        ctaText="Book a Table"
        ctaLink="/contact"
        bgImage="/images/dummy.jpg" // optional background image
      /> */}

      <section className="info bg-brand-green">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-md-4">
              <div className="info-content position-relative">
                <Image
                  src={"/images/img-about.webp"}
                  alt={"Our Commitement to Authenticity & Excellence"}
                  width={600}
                  height={400}
                  className="img-fluid"
                />
                <div className="h4 img-badge bg-brand-orange fw-normal text-white">
                  <span>
                    Indian way of making{" "}
                    <span className="fw-bold">20+ Years</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="info-content text-white">
                <div className="info-heading mb-4">
                  <p className="info-badge info-badge-light">About us</p>
                  <h2 className="text-white fw-normal h1">
                    Our Commitement to Authenticity &{" "}
                    <span className="text-brand-orange">Excellence</span>
                  </h2>
                </div>
                <p>
                  At Chulah, we celebrate the warmth of traditional Indian
                  cooking while blending it with a modern bar experience. Every
                  dish is crafted with authentic recipes, fresh ingredients, and
                  timeless techniques that honor our culinary roots. Our goal is
                  to create a dining experience that feels both familiar and
                  extraordinary, where heritage meets hospitality.
                </p>

                <ul className="info-list info-list-icon lead fw-normal">
                  <li>Authenticity in Every Flavor</li>
                  <li>Excellence in Craftsmanship</li>
                  <li>Hospitality with Heart</li>
                </ul>

                <button className="btn btn-brand-yellow mt-3">Know more</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info bg-brand-light">
        <div className="container">
          <div className="info-heading row justify-content-center text-center">
            <div className="col-md-6">
              <h2 className="fw-bold">Try our Special dishes</h2>
              <p>
                Discover our chef’s signature creations, designed to delight
                your senses with every bite.
              </p>
              <button className="btn btn-brand-yellow mt-2">View more</button>
            </div>
          </div>
          <DishesGrid dishes={dishesData} />
        </div>
      </section>

      <section className="info bg-brand">
        <div className="container">
          <div className="info-heading row justify-content-center text-center">
            <div className="col-md-6">
              <p className="info-badge info-badge-light">Our Menu</p>
              <h2 className="fw-bold text-white">Choose Your Special Menu</h2>
            </div>
          </div>
          <div className="row justify-content-center mt-5">
            <div className="col-md-10">
              <ul className="nav nav-brand-pills nav-pills mb-3 justify-content-evenly" id="pills-tab" role="tablist">
  <li className="nav-item" role="presentation">
    <button className="nav-link active" id="pills-Starters-tab" data-bs-toggle="pill" data-bs-target="#pills-Starters" type="button" role="tab" aria-controls="pills-Starters" aria-selected="true">Starters</button>
  </li>
  <li className="nav-item" role="presentation">
    <button className="nav-link" id="pills-MainCourse-tab" data-bs-toggle="pill" data-bs-target="#pills-MainCourse" type="button" role="tab" aria-controls="pills-MainCourse" aria-selected="false">Main Course</button>
  </li>
  <li className="nav-item" role="presentation">
    <button className="nav-link" id="pills-Alcohol-tab" data-bs-toggle="pill" data-bs-target="#pills-Alcohol" type="button" role="tab" aria-controls="pills-Alcohol" aria-selected="false">Alcohol</button>
  </li>
  <li className="nav-item" role="presentation">
    <button className="nav-link" id="pills-Cocktails-tab" data-bs-toggle="pill" data-bs-target="#pills-Cocktails" type="button" role="tab" aria-controls="pills-Cocktails" aria-selected="false">Cocktails</button>
  </li>
  <li className="nav-item" role="presentation">
    <button className="nav-link" id="pills-Dessert-tab" data-bs-toggle="pill" data-bs-target="#pills-Dessert" type="button" role="tab" aria-controls="pills-Dessert" aria-selected="false">Dessert</button>
  </li>
</ul>
<div className="tab-content border-top" id="pills-tabContent">
  <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" >...</div>
  <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" >...</div>
  <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab" >...</div>
  <div className="tab-pane fade" id="pills-disabled" role="tabpanel" aria-labelledby="pills-disabled-tab">...</div>
</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
