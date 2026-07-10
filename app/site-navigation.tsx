"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/services/computer-repair", label: "Computer Repair" },
  { href: "/services/remote-tech-support", label: "Tech Support" },
  { href: "/services", label: "Business Services" },
  { href: "/plans", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary">
        <Link href="/" className="site-nav-logo-link" aria-label="ZeroCool Development Home">
          <Image
            src="/logo.png"
            alt="ZeroCool Development logo"
            width={215}
            height={44}
            className="site-nav-logo"
            priority
          />
        </Link>

        <div className="site-nav-links-desktop">
          {links.map((link) => (
            <Link key={link.href + link.label} href={link.href} className="site-nav-link-clean">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-nav-actions">
          <Link href="/free-estimate" className="site-nav-estimate-cta">
            Free Estimate
          </Link>
          <button
            type="button"
            className="site-nav-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="site-nav-mobile-menu" id="mobile-nav-menu">
          {links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="site-nav-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
