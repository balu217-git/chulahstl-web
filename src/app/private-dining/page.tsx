import CateringForm from "@/components/forms/CateringForm";
import Image from "next/image";
export default function Ourstory() {
    return (
        <>
        <section className="info bg-brand-orange footer-logo-space">
            <div className="container">
                <div className="row gx-5 justify-content-evenly">
                    <div className="col-md-5">
                        <div className="info-content mb-md-0 mb-4">
                            <Image className="img-fluid"
                                src="/images/img-private-dining.webp"
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
                                <h2 className="fw-semibold mb-3">Reserve our exclusive Private Dining space (25 guests) or tailor-made tables today <span className="text-brand-green">Comfort & Flavor.</span></h2>
                                {/* <p className="small">Please complete the form below to send us a catering request.</p> */}
                            </div>
                            <div className="form-container mt-md-5 mt-3">
                                <CateringForm/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}