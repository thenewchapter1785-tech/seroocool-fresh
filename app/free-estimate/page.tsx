import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LiveEstimator from "../live-estimator";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Service Estimate | ZeroCool Development",
  description:
    "Get a free estimate for computer repair, tech support, websites, apps, automation, and business tech services.",
  path: "/free-estimate",
});

export default function FreeEstimatePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Free Estimate Tool</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Get a Service Estimate Fast
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Share your issue and get a realistic price range before you book.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book-service" className="cta-primary inline-flex">
              Book a Service Visit
            </Link>
            <Link href="/#contact" className="cta-secondary inline-flex">
              Send a Message
            </Link>
          </div>
        </header>

        <Suspense
          fallback={<section className="glass-panel rounded-3xl p-6 md:p-8">Loading estimate tool...</section>}
        >
          <LiveEstimator />
        </Suspense>
      </main>
    </div>
  );
}
