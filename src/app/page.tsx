// import Hero from "../components/Hero";
import HeroSlider from "../components/HeroSlider";
import DishesGrid from "../components/DishesGrid";
import OurMenu from "../components/OurMenu";
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


const menuData = {
  menu: {
    Starters: [
      { name: "Veg Spring Rolls", price: "000/-" },
      { name: "Chicken Tikka", price: "000/-" },
      { name: "Paneer Chilli", price: "000/-" }
    ],
    "Main Course": [
      { name: "Paneer Butter Masala", price: "000/-" },
      { name: "Chicken Biryani", price: "000/-" },
      { name: "Dal Tadka", price: "000/-" }
    ],
    Alcohol: {
      Beers: [
        { name: "Kingfisher Premium / Ultra", price: "000/-" },
        { name: "Bira 91 Blonde / White", price: "000/-" },
        { name: "Heineken", price: "000/-" }
      ],
      Wines: [
        { name: "Sula Rasa Shiraz (India)", price: "000/-" },
        { name: "Grover Zampa La Réserve (India)", price: "000/-" }
      ],
      "Whiskey / Bourbon": [
        { name: "Royal Challenge", price: "000/-" },
        { name: "Chivas Regal 12YO", price: "000/-" }
      ],
      "Sparkling & Champagne": [
        { name: "Sula Brut (India)", price: "000/-" },
        { name: "Moët & Chandon Brut (France)", price: "000/-" }
      ]
    },
    Cocktails: [
      { name: "Mojito", price: "000/-" },
      { name: "Long Island Iced Tea", price: "000/-" },
      { name: "Cosmopolitan", price: "000/-" }
    ],
    Dessert: [
      { name: "Chocolate Brownie", price: "000/-" },
      { name: "Gulab Jamun", price: "000/-" },
      { name: "Ice Cream", price: "000/-" }
    ]
  }
};



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

      {/* <section className="info bg-brand">
        <div className="container">
          <div className="info-heading row justify-content-center text-center">
            <div className="col-md-6">
              <p className="info-badge info-badge-light">Our Menu</p>
              <h2 className="fw-bold text-white">Choose Your Special Menu</h2>
            </div>
          </div>
          <div className="row justify-content-center mt-5">
            <div className="col-md-10">
              <ul
                className="nav nav-brand-pills nav-pills mb-3 justify-content-evenly"
                id="pills-tab"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="pills-Starters-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-Starters"
                    type="button"
                    role="tab"
                    aria-controls="pills-Starters"
                    aria-selected="true"
                  >
                    Starters
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="pills-MainCourse-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-MainCourse"
                    type="button"
                    role="tab"
                    aria-controls="pills-MainCourse"
                    aria-selected="false"
                  >
                    Main Course
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="pills-Alcohol-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-Alcohol"
                    type="button"
                    role="tab"
                    aria-controls="pills-Alcohol"
                    aria-selected="false"
                  >
                    Alcohol
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="pills-Cocktails-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-Cocktails"
                    type="button"
                    role="tab"
                    aria-controls="pills-Cocktails"
                    aria-selected="false"
                  >
                    Cocktails
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="pills-Dessert-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-Dessert"
                    type="button"
                    role="tab"
                    aria-controls="pills-Dessert"
                    aria-selected="false"
                  >
                    Dessert
                  </button>
                </li>
              </ul>
              <div className="tab-content border-top" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-Starters"
                  role="tabpanel"
                  aria-labelledby="pills-Starters-tab"
                >
                  Starters
                </div>
                <div
                  className="tab-pane fade"
                  id="pills-MainCourse"
                  role="tabpanel"
                  aria-labelledby="pills-MainCourse-tab"
                >
                  MainCourse
                </div>
                <div
                  className="tab-pane fade"
                  id="pills-Alcohol"
                  role="tabpanel"
                  aria-labelledby="pills-Alcohol-tab"
                >
                  Alcohol
                </div>
                <div
                  className="tab-pane fade"
                  id="pills-Cocktails"
                  role="tabpanel"
                  aria-labelledby="pills-Cocktails-tab"
                >
                  Cocktails
                </div>
                <div
                  className="tab-pane fade"
                  id="pills-Dessert"
                  role="tabpanel"
                  aria-labelledby="pills-Dessert-tab"
                >
                  Dessert
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <OurMenu bgImage="/images/img-ourmenu-bg.webp"/>

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
                  At Chulah, every meal is more than just dining—it’s a journey
                  through authentic flavors and warm hospitality. Whether it’s
                  an intimate dinner, a lively evening with friends, or a
                  special celebration, our table is set to welcome you. Reserve
                  your spot today and let us create memories as delightful as
                  our dishes.
                </p>
                <button className="btn btn-brand-yellow mt-2">
                  Reserve table
                </button>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
