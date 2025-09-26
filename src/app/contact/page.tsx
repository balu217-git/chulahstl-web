import HeroContainer from "../../components/HeroContainer";
import ContactForm from "../../components/ContactForm";
import ContactIcons from "../../components/ContactIcons";
import Footer from "../../components/Footer";
import Image from "next/image";

export default function Contact() {
  return (
    <>
      <HeroContainer
      title="Meet Us Often"
      subtitle="At Chulah, we celebrate the warmth of traditional Indian cooking while blending it with a modern bar experience. Every dish is crafted with authentic recipes, fresh ingredients, and timeless techniques that honor our culinary roots. Our goal is to create a dining experience that feels both familiar and extraordinary, where heritage meets hospitality."
      ctaText="Book a Table"
      ctaLink="/contact"
      heroImage="https://dummyimage.com/1000x300/000/#000.jpg" // optional background image
      heroImageAlt="dddd" />

      <section className="info bg-brand footer-logo-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="row justify-content-between g-md-0 gy-3">
                <div className="col-md-4">
                  <div className="info-content text-white small">
                    <div className="info-heading mb-5">
                      <h2 className="fw-semibold mb-3 h1">Contact Us</h2>
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
                    <ContactForm />
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
