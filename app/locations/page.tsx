import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { locationPages } from "@/lib/locations";

export const metadata: Metadata = buildPageMetadata({
  title: "Service Areas | ZeroCool Development",
  description:
    "Technology services across Rhode Island including Narragansett, South Kingstown, Wakefield, North Kingstown, Warwick, Newport, Providence, and East Greenwich.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Local SEO Service Areas</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Technology Services Across Rhode Island
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Dedicated pages for each major local market to improve search visibility and provide
            location-specific service clarity.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locationPages.map((location) => (
            <Link key={location.slug} href={`/locations/${location.slug}`} className="project-card">
              <p className="project-tag">{location.regionLabel}</p>
              <h2 className="project-title">{location.locationName}</h2>
              <p className="project-copy">{location.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
