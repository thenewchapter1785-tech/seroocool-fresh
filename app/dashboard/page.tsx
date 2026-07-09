import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Growth Dashboard | ZeroCool Development",
  description:
    "Operational dashboard placeholder for leads, conversion rate, appointments, AI conversations, traffic, rankings, and HubSpot stats.",
  path: "/dashboard",
});

const metrics = [
  { label: "Total Leads", value: "128" },
  { label: "Conversion Rate", value: "11.4%" },
  { label: "AI Conversations", value: "342" },
  { label: "Appointments", value: "57" },
  { label: "Revenue Estimates", value: "$186k" },
  { label: "Popular Services", value: "Website + Repair" },
  { label: "SEO Ranking Gains", value: "+18 keywords" },
  { label: "Monthly Traffic", value: "9,420" },
];

export default function DashboardPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Admin Dashboard</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Revenue and Growth Command Center
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Placeholder metrics for lead generation, conversion performance, service demand, and
            marketing visibility.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="stat-card">
              <p className="stat-value">{metric.value}</p>
              <p className="stat-label">{metric.label}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Google Search Console</h2>
            <p className="section-copy mt-3">Placeholder for impressions, clicks, and query trends.</p>
          </article>
          <article className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Google Analytics</h2>
            <p className="section-copy mt-3">Placeholder for sessions, channels, and conversion paths.</p>
          </article>
          <article className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">HubSpot Statistics</h2>
            <p className="section-copy mt-3">Placeholder for contacts, lifecycle, and pipeline movement.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
