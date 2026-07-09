import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Monthly Plans | ZeroCool Development",
  description:
    "Recurring support plans for home users and businesses including Website Care and AI Automation Care.",
  path: "/plans",
});

const plans = [
  {
    name: "Home Tech Care",
    price: "$79/mo",
    items: [
      "Monthly computer checkup",
      "Virus scan",
      "Updates",
      "Backup check",
      "Remote support discount",
    ],
  },
  {
    name: "Business Tech Care",
    price: "$199/mo",
    items: [
      "Priority support",
      "Website monitoring",
      "Basic SEO checks",
      "Email support",
      "CRM support",
    ],
  },
  {
    name: "Website Care",
    price: "$249/mo",
    items: [
      "Updates",
      "Backups",
      "Security checks",
      "SEO monitoring",
      "Monthly improvements",
    ],
  },
  {
    name: "AI Automation Care",
    price: "$399/mo",
    items: [
      "AI workflow monitoring",
      "Prompt updates",
      "CRM automation support",
      "Monthly optimization",
    ],
  },
];

export default function PlansPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Recurring Revenue Plans</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Monthly Plans That Keep Technology Reliable
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Placeholder pricing is intentionally easy to edit while plan structure stays conversion-ready.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.name} className="project-card">
              <p className="project-tag">Monthly Plan</p>
              <h2 className="project-title">{plan.name}</h2>
              <p className="stat-value mt-2">{plan.price}</p>
              <ul className="mt-4 grid gap-2 text-sm text-slate-200/90">
                {plan.items.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
              <div className="mt-5">
                <Link href="/book-service" className="cta-secondary inline-flex">
                  Request Free Estimate
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
