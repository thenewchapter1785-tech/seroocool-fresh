import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy | ZeroCool Development",
  description: "Privacy policy for ZeroCool Development website visitors and customers.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h1 className="section-title">Privacy Policy</h1>
          <p className="section-copy mt-3">
            We only collect information needed to respond to service requests and provide support.
            We do not sell personal data.
          </p>
        </section>
      </main>
    </div>
  );
}
