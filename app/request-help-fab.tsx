"use client";

import Link from "next/link";

export default function RequestHelpFab() {
  return (
    <div className="sticky-mobile-cta" role="region" aria-label="Quick action">
      <Link href="/free-estimate" className="cta-primary">
        Get a Free Estimate
      </Link>
    </div>
  );
}
