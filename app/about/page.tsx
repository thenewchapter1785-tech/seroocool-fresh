import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About ZeroCool Development",
  description:
    "Meet ZeroCool Development, a trusted Rhode Island technology company helping homes and small businesses with repair, support, and business technology services.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">About ZeroCool Development</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Trusted Tech Help for Rhode Island Homes and Businesses
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            ZeroCool Development helps people solve everyday technology problems without confusing
            language. We provide computer repair, tech support, and practical business technology
            services.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">How We Work</h2>
          <div className="mt-4 grid gap-3">
            {[
              "Building computers since age 12",
              "Honest recommendations and fair pricing",
              "Fast response with clear communication",
              "Local Rhode Island support with remote options",
              "Free estimates and plain-English guidance",
            ].map((item) => (
              <article key={item} className="audience-point">
                <p className="section-copy">{item}</p>
              </article>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/estimate" className="cta-primary inline-flex">
              Get a Free Estimate
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
