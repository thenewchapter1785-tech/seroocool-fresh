import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { businessServices, primaryServices } from "@/lib/services";

export const metadata: Metadata = buildPageMetadata({
  title: "Computer Repair and Business Tech Services | ZeroCool Development",
  description:
    "Explore computer repair and everyday tech support first, plus website, app, automation, SEO, and business tech services for owners.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">ZeroCool Development Services</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Repair and Tech Support for People and Business Owners
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Start with computer repair and everyday tech support. If you run a business, we also
            build websites, apps, automation, and practical systems that save time.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Home and Personal Technology Services</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {primaryServices.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`} className="project-card">
                <p className="project-tag">Home Service</p>
                <h3 className="project-title">{service.name}</h3>
                <p className="project-copy">{service.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Business Owner Services</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {businessServices.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`} className="project-card">
                <p className="project-tag">Business Service</p>
                <h3 className="project-title">{service.name}</h3>
                <p className="project-copy">{service.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
