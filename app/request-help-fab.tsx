"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RequestHelpFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 220);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Link
        href="/#contact"
        className={`request-help-fab ${visible ? "is-visible" : ""}`}
        aria-label="Request help"
      >
        Request Help
      </Link>

      <div className="sticky-mobile-cta" role="region" aria-label="Quick action">
        <Link href="/#contact" className="cta-primary">
          Free Estimate
        </Link>
      </div>
    </>
  );
}
