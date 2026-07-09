import type { Metadata } from "next";
import QuickLeadForm from "../quick-lead-form";
import { buildPageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Consultation | ZeroCool Development",
  description:
    "Request a free consultation for website projects, app development, AI automation, CRM integration, and secure deployment planning.",
  path: "/free-consultation",
});

export default function FreeConsultationPage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Free Consultation",
            item: `${siteUrl}/free-consultation`,
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Free Consultation</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Book a Free Strategy Consultation
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Share your project direction and receive practical recommendations on scope,
            timeline, and budget priorities.
          </p>
        </header>

        <QuickLeadForm
          title="Consultation Request"
          description="We will follow up quickly to schedule your free consultation session."
          projectType="free_consultation"
          formType="free_consultation"
          ctaLabel="Request Free Consultation"
        />
      </main>
    </div>
  );
}
