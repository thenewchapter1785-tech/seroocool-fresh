import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Client Portal | ZeroCool Development",
    description:
      "Client portal access for project files, estimates, and service updates. Contact ZeroCool for secure access.",
    path: "/client-portal",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const modules = [
  "Secure login",
  "View estimates",
  "Approve proposals",
  "Pay invoices",
  "Upload files",
  "Track project progress",
];

export default function ClientPortalPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Client Portal</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Secure Client Workspace
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Portal access is currently issued manually. Contact ZeroCool if you need project file
            sharing or status access.
          </p>
          <div className="mt-6">
            <Link href="/#contact" className="cta-primary inline-flex">
              Request Portal Access
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Planned Features</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200/90">
            {modules.map((module) => (
              <li key={module}>- {module}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
