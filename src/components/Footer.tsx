// components/ContactIcons.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube, faInstagram } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-brand-brown py-5">
        <div className="container">
            <div className="row justify-content-between align-items-center">
                 <div className="col-md">
                    <div className="footer-content text-center">
                        <Image className="img-fluid footer-logo" src="/chulah-logo-green.png" alt="chulauh" width={150} height={300} priority/>
                    </div>
                </div>
                <div className="col-md-4 order-md-first">
                    <div className="footer-content text-white text-md-start text-center">
                        <p className="small">Rooted in Tradition | Re-Imagined for Today</p>
                        <p className="mb-1"><strong className="d-block">Timings:</strong></p>
                        <ul className="list-unstyled small">
                            <li>Tue - Thu 11 am - 9 pm</li>
                            <li>Fri - Sat 11 am - 10 pm</li>
                            <li>Sun 11 am - 9 pm</li>
                            <li><i>( We are closed on Monday )</i></li>
                        </ul>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="footer-content text-center text-white">
                        <p>Connect With us now</p>
                            <div className="d-flex justify-content-center gap-4 mt-3 text-small text-white">
                                <a href="https://www.facebook.com/profile.php?id=61580549355810" target="_blank" className="text-decoration-none text-white fs-3">
                                    <FontAwesomeIcon icon={faFacebook} className="text-white" />
                                </a>
                                <a href="https://www.youtube.com/@ChulahSTL" target="_blank" className="text-decoration-none text-white fs-3">
                                    <FontAwesomeIcon icon={faYoutube} className="text-white" />
                                </a>
                                <a href="https://www.instagram.com/chulahstl/" target="_blank" className="text-decoration-none text-white fs-3">
                                    <FontAwesomeIcon icon={faInstagram} className="text-white" />
                                </a>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
}
