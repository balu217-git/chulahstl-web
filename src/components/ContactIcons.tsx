// components/ContactIcons.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";

export default function ContactIcons() {
  return (
    <ul className="list-unstyled list-icons">
        <li>
            <FontAwesomeIcon icon={faPhone} className="text-brand list-icon" />
            <a href="tel:+16364221168">+1 (636) 422-1168</a>
        </li>
        <li>
            <FontAwesomeIcon icon={faLocationDot} className="text-brand list-icon" />
            16721 MAIN ST, WILDWOOD, MO 63040
        </li>
    </ul>
  );
}
