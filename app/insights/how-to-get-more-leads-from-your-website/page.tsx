import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Get More Leads From Your Website",
  description:
    "A practical framework to increase website leads through clearer offers, tighter CTAs, and conversion-focused page flow.",
};

const checklist = [
  "Lead with one clear promise in the hero section.",
  "Use a primary CTA above the fold and repeat it across sections.",
  "Reduce form friction and ask only what helps qualification.",
  "Add trust proof with concrete outcomes and project examples.",
  "Create service-specific landing pages for buyer intent terms.",
  "Route all traffic into one measurable inquiry pipeline.",
];

export default function LeadsGuidePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <article className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="project-tag">Lead Generation Guide</p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            How to Get More Leads From Your Website
          </h1>
          <p className="section-copy mt-4">
            Most sites do not have a traffic problem. They have a clarity and conversion-path problem. Start by improving the page flow before you buy more traffic.
          </p>

          <h2 className="section-title mt-8">Lead Conversion Checklist</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90">
            {checklist.map((item) => (
              <li key={item} className="tech-pill">{item}</li>
            ))}
          </ul>

          <h2 className="section-title mt-8">Next Step</h2>
          <p className="section-copy mt-3">
            If you want this implemented on your site, request a project estimate and include your current URL and goal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">Request Conversion Audit</Link>
            <Link href="/insights" className="cta-secondary inline-flex">Back to Insights</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
