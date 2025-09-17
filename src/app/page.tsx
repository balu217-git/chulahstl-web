// import Hero from "../components/Hero";

import HeroSlider from "../components/HeroSlider";
import DishesGrid from "../components/DishesGrid";
import OurMenu from "../components/OurMenu";
import ContactIcons from "../components/ContactIcons";
import Footer from "../components/Footer";
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

                <button className="btn btn-brand-orange mt-3">Know more</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info bg-brand-light bg-brand-element">
        <div className="container">
          <div className="info-heading row justify-content-center text-center">
            <div className="col-md-6">
              <h2 className="fw-bold">Try our Special dishes</h2>
              <p>
                Discover our chef’s signature creations, designed to delight
                your senses with every bite.
              </p>
              <button className="btn btn-brand-orange mt-2">View more</button>
            </div>
          </div>
          <DishesGrid dishes={dishesData} />
        </div>
      </section>

      <OurMenu bgImage="/images/img-ourmenu-bg.webp" />

      <section className="info bg-brand-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="row justify-content-between gx-5">
                <div className="col-md-5">
                  <div className="info-content">
                    <h2 className="fw-bold">
                      Indulge in an unforgettable Culinary Experience
                    </h2>
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="info-content">
                    <p>
                      At Chulah, every meal is more than just dining—it’s a
                      journey through authentic flavors and warm hospitality.
                      Whether it’s an intimate dinner, a lively evening with
                      friends, or a special celebration, our table is set to
                      welcome you. Reserve your spot today and let us create
                      memories as delightful as our dishes.
                    </p>
                    <button className="btn btn-brand-orange mt-2">
                      Reserve table
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info bg-brand">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="row justify-content-between">
                <div className="col-md-4">
                  <div className="info-content text-white small">
                    <div className="info-heading mb-5">
                      <h2 className="fw-semibold mb-3">Contact Us</h2>
                      <p>
                        At Chulah, every meal is more than just dining—it’s a
                        journey through authentic flavors and warm hospitality
                      </p>
                    </div>
                     <ContactIcons />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-content">
                    <div className="form-container">
                      <form action="" method="post">
                        <div className="from-group mb-3">
                            <input type="text" name="name" className="form-control" id="" placeholder="Your Name" />
                        </div>
                        <div className="from-group mb-3">
                            <input type="email" name="email" className="form-control" id="" placeholder="Your Email"/>
                        </div>
                        <div className="from-group mb-3">
                            <div className="mb-3">
                              <textarea className="form-control" name="" id="" rows={4} placeholder="Message"></textarea>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-sm btn-brand-orange px-4">Submit</button>

                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
}
