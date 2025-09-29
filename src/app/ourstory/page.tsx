import HeroContainer from "../../components/HeroContainer";
import Footer from "../../components/Footer";
import Image from "next/image";

export default function Ourstory() {
    return (
        <>
            <HeroContainer
                title="Our Story"
                subtitle="At CHULAH INDIAN HEARTH & BAR, we bring the vibrant flavors of authentic Indian cuisine to Wildwood with a fine-dining twist, crafting every dish with passion and fresh ingredients to create unforgettable experiences. We invite you to savor our unique Indian-inspired creations in a warm, welcoming atmosphere where bold flavors and attentive service come together to delight every guest."
                ctaText="Book a Table"
                ctaLink="/contact"
                heroImage="https://dummyimage.com/1200x500/fff/#000.jpg" // optional background image
                heroImageAlt="dddd" />

            <section className="info bg-brand-light bg-brand-element">
                <div className="container">
                    <div className="row justify-content-between align-items-center">
                        <div className="col-lg-5">
                            <div className="info-content mb-md-0 mb-4">
                                <Image className="img-fluid"
                                    src="https://dummyimage.com/600x800/000/#000.jpg"
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
                                <h2 className="fw-bold mt-5">The Hearth of Tradition</h2>
                                <p>Chulah, named after the traditional Indian clay stove, is a symbol of warmth, community, and authentic cooking. It inspires everything we do — from the spices we choose to the care we put into every dish.</p>
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
                                <a href="#" className="btn btn-wide btn-brand-green mt-3">Visit Us Today</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}