import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LiveEstimator from "../live-estimator";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Service Price Estimator | ZeroCool Development",
  description:
    "Quick estimate tool for computer repair, tech support, websites, apps, automation, and business tech services.",
  path: "/estimate",
});

export default function EstimatePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Quick Estimate Tool</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Estimate Your Service Cost in Minutes
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Use this tool to get a realistic price range before you book.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book-service" className="cta-primary inline-flex">
              Book a Service Visit
            </Link>
            <Link href="/services" className="cta-secondary inline-flex">
              See All Services
            </Link>
          </div>
        </header>

        <Suspense fallback={<section className="glass-panel rounded-3xl p-6 md:p-8">Loading estimate tool...</section>}>
          <LiveEstimator />
        </Suspense>
      </main>
    </div>
  );
}
