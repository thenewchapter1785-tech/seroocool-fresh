import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "mailto:zerocool.development.project@gmail.com?subject=Project%20Consultation%20-%20ZeroCool%20Development";
  const contactEmail =
    process.env.CONTACT_EMAIL ?? "zerocool.development.project@gmail.com";

  return (
    <div className="site-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="glass-panel w-full rounded-3xl p-8 md:p-10">
          <p className="label-chip inline-flex">Project Request Received</p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-blue-100 md:text-4xl">
            Thank you. Your message has been sent.
          </h1>
          <p className="section-copy mt-4 max-w-2xl">
            ZeroCool Development will review your request and follow up with practical next
            steps. For urgent follow-up, send a direct email.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={bookingUrl} className="cta-primary inline-flex">
              Book a Strategy Call
            </a>
            <a href={`mailto:${contactEmail}`} className="cta-secondary inline-flex">
              Email Directly
            </a>
            <Link href="/" className="cta-secondary inline-flex">
              Back to Homepage
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Link href="/services/business-websites" className="faq-card">
              <h3 className="faq-question">Business Websites</h3>
              <p className="faq-answer">Fast, polished marketing sites built to convert.</p>
            </Link>
            <Link href="/services/custom-web-apps" className="faq-card">
              <h3 className="faq-question">Custom Web Apps</h3>
              <p className="faq-answer">Dashboards, portals, and product workflows.</p>
            </Link>
            <Link href="/services/automation-integrations" className="faq-card">
              <h3 className="faq-question">Automation + APIs</h3>
              <p className="faq-answer">Cut repetitive work and connect your stack.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
