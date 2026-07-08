import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Website Development",
  description:
    "Business website development by $erocool-Development. Fast-loading, search-ready websites designed to convert visitors into leads.",
};

const outcomes = [
  "Clear offer messaging and conversion-first page structure",
  "Fast page loads and technical SEO foundations",
  "Lead form and contact flow connected to your pipeline",
  "Mobile-first design for real client behavior",
];

export default function BusinessWebsitesPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Business Websites</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-cyan-100 md:text-5xl">
            Turn your website into a lead-generating asset.
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            For businesses that need credibility, clear positioning, and a smooth path from visitor to inquiry.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">What You Get</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90 md:grid-cols-2">
            {outcomes.map((item) => (
              <li key={item} className="tech-pill">{item}</li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Best For</h2>
          <p className="section-copy mt-3">
            Service businesses, consultants, agencies, and founders who need a site that communicates value quickly and captures qualified leads.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">Request Website Scope</Link>
            <Link href="/services" className="cta-secondary inline-flex">View All Services</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
