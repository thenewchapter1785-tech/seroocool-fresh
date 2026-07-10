import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service | ZeroCool Development",
  description: "Terms of service for ZeroCool Development website and service requests.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h1 className="section-title">Terms of Service</h1>
          <p className="section-copy mt-3">
            By using this website, you agree to submit accurate request details and communicate in
            good faith regarding service appointments and support requests.
          </p>
        </section>
      </main>
    </div>
  );
}
