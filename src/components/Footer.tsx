// components/ContactIcons.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube, faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-brand-green-light py-5">
        <div className="container">
            <div className="row justify-content-between align-items-center">
                <div className="col-md-3">
                    <div className="footer-content text-white">
                        <p className="small">At Chulah, every meal is more than
just dining—it’s a journey through </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="footer-content text-center text-white">
                        <p>Connect With us now</p>
            <div className="d-flex justify-content-center gap-4 mt-3 text-small text-white">
                    <a href="https://facebook.com" target="_blank" className="text-decoration-none text-white fs-3">
                        <FontAwesomeIcon icon={faFacebook} className="text-white" />
                    </a>
                    <a href="https://youtube.com" target="_blank" className="text-decoration-none text-white fs-3">
                        <FontAwesomeIcon icon={faYoutube} className="text-white" />
                    </a>
                    <a href="https://www.instagram.com/chulahrestaurant/" target="_blank" className="text-decoration-none text-white fs-3">
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
