import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore $erocool-Development services: business websites, custom web apps, and automation + API integrations.",
};

const serviceCards = [
  {
    href: "/services/business-websites",
    title: "Business Websites",
    copy: "Conversion-focused websites for local businesses, founders, and service providers.",
  },
  {
    href: "/services/custom-web-apps",
    title: "Custom Web Apps",
    copy: "Portals, dashboards, and internal tools designed around your real workflow.",
  },
  {
    href: "/services/automation-integrations",
    title: "Automation + Integrations",
    copy: "API connections and automations that reduce manual tasks and speed up operations.",
  },
];

export default function ServicesPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">$erocool-Development Services</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-cyan-100 md:text-5xl">
            Build the right solution for your next growth step.
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Choose the service path that matches your current business need, then request a project estimate.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {serviceCards.map((service) => (
            <Link key={service.href} href={service.href} className="project-card">
              <p className="project-tag">Service</p>
              <h2 className="project-title">{service.title}</h2>
              <p className="project-copy">{service.copy}</p>
            </Link>
          ))}
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Ready to Talk Scope?</h2>
          <p className="section-copy mt-3">
            Go back to the homepage intake form and share your project details for a practical next-step plan.
          </p>
          <Link href="/#contact" className="cta-primary mt-6 inline-flex">
            Get a Project Estimate
          </Link>
        </section>
      </main>
    </div>
  );
}
