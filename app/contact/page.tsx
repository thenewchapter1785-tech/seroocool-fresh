import type { Metadata } from "next";
import LeadForm from "../lead-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact ZeroCool Development",
  description:
    "Send ZeroCool Development a message for computer repair, tech support, website help, and business technology services.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h1 className="section-title">Send a Message</h1>
          <p className="section-copy mt-3">
            Tell us what is going on and we will respond with clear next steps.
          </p>
          <div className="mt-5">
            <LeadForm />
          </div>
        </section>
      </main>
    </div>
  );
}
