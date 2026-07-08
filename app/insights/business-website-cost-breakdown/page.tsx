import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Website Cost Breakdown",
  description:
    "Understand website pricing by scope: strategy, design, build, content, SEO setup, and lead pipeline integration.",
};

const costDrivers = [
  "Strategy and offer positioning",
  "Page count and conversion flow complexity",
  "Custom design depth and brand work",
  "CMS and content workflow requirements",
  "SEO/analytics setup and tracking depth",
  "Integrations for lead routing and follow-up",
];

export default function WebsiteCostGuidePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <article className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="project-tag">Planning Guide</p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-cyan-100 md:text-5xl">
            Business Website Cost Breakdown
          </h1>
          <p className="section-copy mt-4">
            Website budgets vary based on conversion complexity, not just page count. Scope around outcomes first, then features.
          </p>

          <h2 className="section-title mt-8">What Affects Cost Most</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90">
            {costDrivers.map((item) => (
              <li key={item} className="tech-pill">{item}</li>
            ))}
          </ul>

          <h2 className="section-title mt-8">Next Step</h2>
          <p className="section-copy mt-3">
            Share your budget range and timeline in the intake form to get a realistic scope recommendation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">Get Budget-Aligned Scope</Link>
            <Link href="/insights" className="cta-secondary inline-flex">Back to Insights</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
