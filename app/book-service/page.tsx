import type { Metadata } from "next";
import BookingForm from "../booking-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Book Service | ZeroCool Development",
  description:
    "Book phone, video, remote, drop-off, website, AI automation, business tech review, or emergency support sessions.",
  path: "/book-service",
});

export default function BookServicePage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Book Service</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Schedule the Right Appointment Fast
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Choose the support format that fits your issue. Free estimate language and next steps
            are included in every booking flow.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Appointment Request</h2>
          <p className="section-copy mt-3">
            Share preferred day/time and urgency. We will follow up quickly to confirm.
          </p>
          <div className="mt-4">
            <BookingForm />
          </div>
        </section>
      </main>
    </div>
  );
}
