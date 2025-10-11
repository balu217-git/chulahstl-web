import HeroContainer from "@/components/HeroContainer";
import Image from "next/image";

export default function Ourstory() {
    return (
        <>
            <HeroContainer
                title="Our Story"
                subtitle="At Chulah, we celebrate the warmth of traditional Indian cooking while blending it with a modern bar experience. Every dish is crafted with authentic recipes, fresh ingredients, and timeless techniques that honor our culinary roots. Our goal is to create a dining experience that feels both familiar and extraordinary, where heritage meets hospitality."
                ctaText="Book a Table"
                ctaLink="/contact"
                // heroImage="https://dummyimage.com/1200x500/fff/#000.jpg" // optional background image
                heroImageAlt="dddd" />

            <section className="info bg-brand-light bg-brand-element">
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-lg-5">
                            <div className="info-content mb-md-0 mb-4">
                                <Image className="img-fluid"
                                    src="/images/img-our-story.webp"
                                    alt=""
                                    width={600}
                                    height={800}
                                    priority
                                />
                            </div>

                        </div>
                        <div className="col-lg-6">
                           <div className="info-content">
                                <h2 className="fw-bold">The Hearth of Tradition</h2>
                                <p>Chulah, named after the traditional Indian clay stove, is a symbol of warmth, community, and authentic cooking. It inspires everything we do — from the spices we choose to the care we put into every dish.</p>
                                <h2 className="fw-bold mt-5">A Culinary Experience</h2>
                                <p>Our menu blends timeless Indian recipes with a modern twist, crafted using the freshest ingredients and classic techniques. Each plate is designed to deliver flavors that are both familiar and exciting.</p>
                           </div>
                        </div>
                    </div>
                </div>
            </section>
             <section className="info bg-brand-light footer-logo-space">
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-lg-8">
                            <div className="info-content text-center text-dark">
                                 <h2 className="fw-bold mb-3">Where Heritage Meets Hospitality</h2>
                                <p>More than just a restaurant and bar, Chulah is a place to gather, celebrate, and create memories. With soulful food, signature cocktails, and heartfelt service, we bring people together in an unforgettable way.</p>
                                <a href="/private-dining" className="btn btn-lg btn-wide btn-brand-orange mt-3">Visit Us Today</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}