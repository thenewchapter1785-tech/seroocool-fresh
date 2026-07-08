import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation and API Integrations",
  description:
    "Automation and API integration services by $erocool-Development. Connect tools, remove repetitive work, and streamline operations.",
};

const automationWins = [
  "Sync lead data across CRM, email, and internal tools",
  "Automate repetitive admin actions and status updates",
  "Integrate third-party APIs into one clean workflow",
  "Create reliable alerts and handoff triggers",
];

export default function AutomationIntegrationsPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Automation + Integrations</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-cyan-100 md:text-5xl">
            Remove bottlenecks with smarter system connections.
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Stop wasting hours on manual process steps. Build automation paths that keep data moving and teams aligned.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Automation Outcomes</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90 md:grid-cols-2">
            {automationWins.map((item) => (
              <li key={item} className="tech-pill">{item}</li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Where This Helps Most</h2>
          <p className="section-copy mt-3">
            Growing teams with lead intake, onboarding, fulfillment, or support workflows spread across multiple platforms.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">Request Automation Scope</Link>
            <Link href="/services" className="cta-secondary inline-flex">View All Services</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
