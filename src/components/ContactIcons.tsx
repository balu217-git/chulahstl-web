// components/ContactIcons.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";

export default function ContactIcons() {
  return (
    <ul className="list-unstyled list-icons">
        <li>
            <FontAwesomeIcon icon={faPhone} className="text-white list-icon" />
            <a href="tel:+16367511337" className="text-white">+1 (636) 751-1337</a>
        </li>
        <li>
            <FontAwesomeIcon icon={faLocationDot} className="text-white list-icon" />
            16721 MAIN ST, WILDWOOD, MO 63040
        </li>
    </ul>
  );
}
