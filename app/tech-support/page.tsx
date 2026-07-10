import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "../lead-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Tech Support | ZeroCool Development",
  description:
    "Request dedicated tech support for home devices, Wi-Fi issues, and business technology systems.",
  path: "/tech-support",
});

export default function TechSupportPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h1 className="section-title">Tech Support</h1>
          <p className="section-copy mt-3">
            Need help fast? Share your issue and we will recommend the best service path.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/free-estimate" className="cta-primary inline-flex">
              Get a Free Estimate
            </Link>
            <Link href="/diagnostic" className="cta-secondary inline-flex">
              Start a Quick Diagnostic
            </Link>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Send a Support Request</h2>
          <div className="mt-4">
            <LeadForm />
          </div>
        </section>
      </main>
    </div>
  );
}
