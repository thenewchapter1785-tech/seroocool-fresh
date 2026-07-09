import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Web App Development",
  description:
    "Custom web app development by ZeroCool Development. Build dashboards, portals, and product workflows around your business model.",
};

const useCases = [
  "Client portals and member experiences",
  "Internal dashboards for operations and reporting",
  "Workflow tools replacing spreadsheets and manual handoffs",
  "MVP product builds ready for real users",
];

export default function CustomWebAppsPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Custom Web Apps</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Build software around how your team actually works.
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Custom web applications designed for speed, maintainability, and practical business outcomes.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Typical Builds</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90 md:grid-cols-2">
            {useCases.map((item) => (
              <li key={item} className="tech-pill">{item}</li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Delivery Approach</h2>
          <p className="section-copy mt-3">
            We align on core workflows first, then ship in practical increments so your team can use value early instead of waiting on a giant release.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">Request Web App Scope</Link>
            <Link href="/services" className="cta-secondary inline-flex">View All Services</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
