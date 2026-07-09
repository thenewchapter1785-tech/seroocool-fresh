import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Lead generation and technology growth insights from ZeroCool Development for founders, individuals, and business teams.",
};

const guides = [
  {
    href: "/insights/how-to-get-more-leads-from-your-website",
    title: "How to Get More Leads From Your Website",
    copy: "A practical lead-conversion checklist you can implement this week.",
  },
  {
    href: "/insights/business-website-cost-breakdown",
    title: "Business Website Cost Breakdown",
    copy: "How to scope your budget around real conversion outcomes.",
  },
  {
    href: "/insights/automation-for-small-business-operations",
    title: "Automation for Small Business Operations",
    copy: "Where automation delivers the fastest operational ROI.",
  },
];

export default function InsightsPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">ZeroCool Development Insights</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Practical guides to grow leads and improve conversion.
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Use these guides to improve visibility, tighten your funnel, and increase qualified project inquiries.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <Link key={guide.href} href={guide.href} className="project-card">
              <p className="project-tag">Guide</p>
              <h2 className="project-title">{guide.title}</h2>
              <p className="project-copy">{guide.copy}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
