import PrivateDining_BookingForm from "../../components/PrivateDining_BookingForm";
import Footer from "../../components/Footer";
import Image from "next/image";
export default function Ourstory() {
    return (
        <>
        <section className="info bg-brand footer-logo-space">
            <div className="container">
                <div className="row gx-5 justify-content-evenly">
                    <div className="col-md-5">
                        <div className="info-content mb-md-0 mb-4">
                            <Image className="img-fluid"
                                src="https://dummyimage.com/600x600/000/#000.jpg"
                                alt=""
                                width={600}
                                height={600}
                                priority
                            />
                        </div>
                    </div>
                    <div className="col-md-5 order-lg-first">
                        <div className="info-content">
                            <div className="info-heading text-white">
                                <h2 className="fw-semibold mb-3">Private Dining with Chulah — <span className="text-brand-orange">Comfort & Flavor.</span></h2>
                                <p className="small">Please complete the form below to send us a catering request.</p>
                            </div>
                            <div className="form-container mt-md-5 mt-3">
                                <PrivateDining_BookingForm/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <Footer/>
        </>
    )
}