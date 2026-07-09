import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type AdminPageProps = {
  searchParams: Promise<{ code?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Dashboard | ZeroCool Development",
  description:
    "Password-protected admin placeholder for leads, quotes, appointments, AI conversations, and analytics metrics.",
  path: "/admin",
});

const cards = [
  { label: "Total Leads", value: "142" },
  { label: "Quote Requests", value: "51" },
  { label: "Appointments", value: "37" },
  { label: "AI Conversations", value: "289" },
  { label: "Estimated Revenue", value: "$214k" },
  { label: "Popular Services", value: "Website + Repair" },
  { label: "Website Traffic", value: "12,430" },
  { label: "HubSpot Leads", value: "118" },
  { label: "Google Analytics", value: "Placeholder" },
  { label: "Search Console", value: "Placeholder" },
];

export default async function AdminPage(props: AdminPageProps) {
  const searchParams = await props.searchParams;
  const providedCode = (searchParams.code ?? "").trim();
  const requiredCode = (process.env.ADMIN_ACCESS_CODE ?? "").trim();

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
          <p className="label-chip inline-flex">Admin Placeholder</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Lead and Revenue Overview
          </h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.label} className="stat-card">
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
