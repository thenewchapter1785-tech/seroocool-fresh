import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation for Small Business Operations",
  description:
    "Identify and automate repetitive business operations to save time and reduce errors with API-first workflows.",
};

const automationTargets = [
  "Lead intake and CRM updates",
  "Client onboarding handoffs",
  "Proposal and follow-up triggers",
  "Task status notifications",
  "Reporting and recurring admin tasks",
  "Cross-platform data synchronization",
];

export default function AutomationGuidePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <article className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="project-tag">Operations Guide</p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-cyan-100 md:text-5xl">
            Automation for Small Business Operations
          </h1>
          <p className="section-copy mt-4">
            Start with the repetitive tasks your team touches weekly. Small automations in these paths usually produce the fastest ROI.
          </p>

          <h2 className="section-title mt-8">High-Impact Automation Targets</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90">
            {automationTargets.map((item) => (
              <li key={item} className="tech-pill">{item}</li>
            ))}
          </ul>

          <h2 className="section-title mt-8">Next Step</h2>
          <p className="section-copy mt-3">
            Submit your workflow bottleneck and current tools to get an automation-first implementation path.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">Request Automation Plan</Link>
            <Link href="/insights" className="cta-secondary inline-flex">Back to Insights</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
