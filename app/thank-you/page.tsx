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
  return (
    <div className="site-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="glass-panel w-full rounded-3xl p-8 md:p-10">
          <p className="label-chip inline-flex">Project Request Received</p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-cyan-100 md:text-4xl">
            Thank you. Your message has been sent.
          </h1>
          <p className="section-copy mt-4 max-w-2xl">
            Corey will review your request and follow up with next steps. If your
            project is urgent, call 401-786-2811.
          </p>
          <Link href="/" className="cta-primary mt-7 inline-flex">
            Back to Homepage
          </Link>
        </section>
      </main>
    </div>
  );
}
