import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Emergency Tech Support | ZeroCool Development",
  description:
    "Request emergency help for computers that will not boot, malware attacks, website outages, email failures, and business system downtime.",
  path: "/emergency-tech-support",
});

const emergencies = [
  "Computer will not boot",
  "Virus or malware infection",
  "Website down",
  "Email not working",
  "Wi-Fi/network issues",
  "Business system outage",
];

export default function EmergencyTechSupportPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Emergency Support</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Immediate Help for Critical Technology Problems
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            If your business is offline or your system is compromised, do not wait. Request urgent
            support and get an immediate action plan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">
              Request Emergency Help
            </Link>
            <Link href="/book-service" className="cta-secondary inline-flex">
              Book Emergency Session
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Common Emergency Scenarios</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {emergencies.map((item) => (
              <div key={item} className="proof-chip">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
