// mark as client to allow DOM APIs
// "use client";

// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import BootstrapClient from "../components/BootstrapClient";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Next App",
  description: "Next.js app with Bootstrap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfair.variable}`}>
        <Navbar />
        <main>
          {children}
          
        </main>
        <Footer />
        <BootstrapClient />
      </body>
    </html>
  );
}
