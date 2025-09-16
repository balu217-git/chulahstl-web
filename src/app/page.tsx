// import Hero from "../components/Hero";
import HeroSlider from "../components/HeroSlider";

const slidesData = [
  { image: "/images/dummy.jpg", title: "Where the tradition meets Spirits", subtitle: "Slide 1 Subtitle" },
  { image: "/images/dummy.jpg", title: "Explore Features", subtitle: "Slide 2 Subtitle" },
  { image: "/images/dummy.jpg", title: "Join Us Today", subtitle: "Slide 3 Subtitle" },
];


export default function Home() {
  return (
    <>

     <HeroSlider slides={slidesData} />

    {/* <Hero
        title="Welcome to Chulauh"
        subtitle="Experience the taste of excellence"
        ctaText="Book a Table"
        ctaLink="/contact"
        bgImage="/images/dummy.jpg" // optional background image
      /> */}
      <section className="info bg-brand-green">
        <div className="container">
          <div className="row gx-5">
            <div className="col-md-6">
              <div className="info-content">

              </div>
            </div>
            <div className="col-md-5">
              <div className="info-content text-white">
                <div className="info-heading mb-4">
                  <p className="info-badge info-badge-light">About us</p>
                  <h2 className="text-white fw-normal h1">Our Commitement to Authenticity & <span className="text-brand-orange">Excellence</span></h2>
                </div>
                <p>At Chulah, we celebrate the warmth of traditional Indian cooking while blending it with a modern bar experience. Every dish is crafted with authentic recipes, fresh ingredients, and timeless techniques that honor our culinary roots. Our goal is to create a dining experience that feels both familiar and extraordinary, where heritage meets hospitality.</p>

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
              <p>Discover our chef’s signature creations, designed to delight your senses with every bite.</p>
            <button className="btn btn-brand-yellow mt-2">View more</button>
            </div>
          </div>

          <div className="row">
              <div className="col-md-3">

              </div>
          </div>
        </div>
      </section>
    </>
  );
}
