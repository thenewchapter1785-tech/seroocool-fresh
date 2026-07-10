import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import GoogleBusinessManager from "@/app/admin/google-business-manager";
import MetaFacebookManager from "@/app/admin/meta-facebook-manager";
import { getIntegrationStatuses, getMissingEnvironmentVariables } from "@/lib/platform-health";

type AdminPageProps = {
  searchParams: Promise<{ code?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Dashboard | ZeroCool Development",
  description:
    "Password-protected operations dashboard for integration health, missing environment variables, and manual setup actions.",
  path: "/admin",
});

const manualActions = [
  "Submit a live test lead and verify HubSpot contact + deal creation.",
  "Run Google Business Profile admin checks with valid business.manage scope.",
  "Validate Meta diagnostics with production tokens (read-only mode by default).",
  "Confirm GA and Clarity events in their dashboards.",
  "Verify Cloudflare DNS/WAF and DigitalOcean deployment health.",
];

export default async function AdminPage(props: AdminPageProps) {
  const searchParams = await props.searchParams;
  const providedCode = (searchParams.code ?? "").trim();
  const requiredCode = (process.env.ADMIN_ACCESS_CODE ?? "").trim();
  const integrations = getIntegrationStatuses();
  const missingEnv = getMissingEnvironmentVariables();

  const accessAllowed = Boolean(requiredCode) && providedCode === requiredCode;

  if (!accessAllowed) {
    return (
      <div className="site-shell">
        <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10 md:px-10 md:py-14">
          <section className="glass-panel rounded-3xl p-7 md:p-10">
            <p className="label-chip inline-flex">Admin Access Required</p>
            <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-tight text-blue-100 md:text-4xl">
              Enter Admin Access Code
            </h1>
            <p className="section-copy mt-4">
              Set ADMIN_ACCESS_CODE in your environment, then provide it below.
            </p>

            <form className="lead-form mt-5" method="GET">
              <label htmlFor="admin-code">Access Code</label>
              <input id="admin-code" name="code" type="password" required />
              <button type="submit" className="cta-primary">
                Unlock Admin
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Operations Dashboard</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Platform Health and Integration Status
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            This dashboard shows real configuration status only. Live lead and revenue totals are
            intentionally not guessed when data sources are unavailable.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Integration Health</h2>
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
          <h2 className="section-title">Missing Environment Variables</h2>
          {missingEnv.length ? (
            <ul className="mt-4 grid gap-2 text-sm text-slate-100/90">
              {missingEnv.map((name) => (
                <li key={name} className="tech-pill">
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-copy mt-3">No required core variables are missing.</p>
          )}
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Manual Actions Still Required</h2>
          <div className="mt-4 grid gap-3">
            {manualActions.map((action) => (
              <article key={action} className="audience-point">
                <p className="section-copy">{action}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Lead and Revenue Data</h2>
          <p className="section-copy mt-3">
            No unified data store is currently connected for totals (lead count, appointments,
            estimate requests, AI chat history, and revenue opportunities). Connect a persisted
            analytics source before displaying production totals.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "Lead count",
              "Appointments",
              "Estimate requests",
              "Recent AI chats",
              "Recent contact forms",
              "Recent errors",
              "Revenue opportunities",
            ].map((label) => (
              <article key={label} className="stat-card">
                <p className="stat-value">No live data</p>
                <p className="stat-label">{label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">External Manager Tools</h2>
          <p className="section-copy mt-3">
            Use the managers below for Google Business Profile and Meta diagnostics and operations.
            Meta write actions remain locked to explicit confirmation flows.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["API Health", "SEO Health", "Website Health"].map((label) => (
            <article key={label} className="stat-card">
              <p className="stat-value">Needs manual verification</p>
              <p className="stat-label">{label}</p>
            </article>
          ))}
        </section>

        <GoogleBusinessManager adminCode={providedCode} />
        <MetaFacebookManager adminCode={providedCode} />
      </main>
    </div>
  );
}
