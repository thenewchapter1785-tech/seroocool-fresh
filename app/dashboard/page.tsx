import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { getIntegrationStatuses, getMissingEnvironmentVariables } from "@/lib/platform-health";

export const metadata: Metadata = buildPageMetadata({
  title: "Operations Snapshot | ZeroCool Development",
  description:
    "Public operations snapshot with integration configuration status and manual setup checklist.",
  path: "/dashboard",
});

export default function DashboardPage() {
  const integrations = getIntegrationStatuses();
  const missingEnv = getMissingEnvironmentVariables();

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Operations Snapshot</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Platform Status for ZeroCool Development
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            This public page shows real configuration status only. Protected admin tools are
            available in the admin dashboard.
          </p>
          <div className="mt-6">
            <Link href="/admin" className="cta-primary inline-flex">
              Open Admin Dashboard
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Integration Status</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {integrations.map((item) => (
              <article key={item.name} className="faq-card">
                <h3 className="faq-question">{item.name}</h3>
                <p className="project-tag mt-2">{item.status}</p>
                <p className="faq-answer">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Missing Core Environment Variables</h2>
          {missingEnv.length ? (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {missingEnv.map((item) => (
                <article key={item} className="tech-pill">
                  {item}
                </article>
              ))}
            </div>
          ) : (
            <p className="section-copy mt-3">No missing variables in the core required set.</p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            "Lead count",
            "Estimate requests",
            "Revenue opportunities",
            "Recent AI chats",
            "Recent contact forms",
            "Recent errors",
          ].map((label) => (
            <article key={label} className="stat-card">
              <p className="stat-value">No live data</p>
              <p className="stat-label">{label}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
