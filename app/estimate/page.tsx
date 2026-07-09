import type { Metadata } from "next";
import Link from "next/link";
import LiveEstimator from "../live-estimator";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Live Project Estimator | ZeroCool Development",
  description:
    "Interactive estimator for repair, website, software, AI, and CRM projects. Get a quick pricing range and consultation follow-up.",
  path: "/estimate",
});

export default function EstimatePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Revenue Estimator</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Estimate Your Project Investment in Minutes
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Use our live estimator to set expectations and get a realistic budget range before you
            book.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book-service" className="cta-primary inline-flex">
              Book Consultation
            </Link>
            <Link href="/services" className="cta-secondary inline-flex">
              Explore Services
            </Link>
          </div>
        </header>

        <LiveEstimator />
      </main>
    </div>
  );
}
