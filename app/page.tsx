import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CustomerProblemFinder from "./customer-problem-finder";
import ReviewsSection from "./components/ReviewsSection";
import WhyChooseZeroCool from "./components/WhyChooseZeroCool";
import RequestHelpFab from "./request-help-fab";
import { getContactEmail, getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ZeroCool Development | Computer Repair and Tech Support",
  description:
    "Computer repair and everyday tech support in plain English. We also help business owners with websites, apps, automation, SEO, and business tech.",
  path: "/",
});

const trustPoints = [
  {
    title: "Honest Service",
    copy: "No upsells. Just what you need.",
    icon: (
      <svg viewBox="0 0 24 24" className="hero-trust-icon" aria-hidden="true">
        <path d="M12 3l7 3v5c0 5-3.4 8.8-7 10-3.6-1.2-7-5-7-10V6l7-3z" />
        <path d="M9.3 12.2l1.9 1.9 3.7-3.7" />
      </svg>
    ),
  },
  {
    title: "Fair Pricing",
    copy: "Transparent quotes with no surprises.",
    icon: (
      <svg viewBox="0 0 24 24" className="hero-trust-icon" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9.2c0-1 1-1.8 2.2-1.8 1.1 0 2 .6 2 1.6 0 .8-.5 1.3-1.5 1.7l-1 .4c-1 .4-1.5 1-1.5 1.8" />
        <path d="M12 16.8v.2" />
      </svg>
    ),
  },
  {
    title: "Fast Service",
    copy: "Quick turnaround when you need it.",
    icon: (
      <svg viewBox="0 0 24 24" className="hero-trust-icon" aria-hidden="true">
        <path d="M13 3L6 14h5l-1 7 8-12h-5l0-6z" />
      </svg>
    ),
  },
  {
    title: "Local & Reliable",
    copy: "Proudly serving Rhode Island.",
    icon: (
      <svg viewBox="0 0 24 24" className="hero-trust-icon" aria-hidden="true">
        <path d="M4 19v-1.5a3 3 0 013-3h10a3 3 0 013 3V19" />
        <circle cx="12" cy="8" r="3" />
        <path d="M5 10.5a2.5 2.5 0 010-5M19 10.5a2.5 2.5 0 000-5" />
      </svg>
    ),
  },
];

export default function Home() {
  const siteUrl = getSiteUrl();
  const contactEmail = getContactEmail();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "ZeroCool Development",
        url: siteUrl,
        email: contactEmail,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "LocalBusiness",
        name: "ZeroCool Development",
        areaServed: ["Rhode Island", "Remote"],
        url: siteUrl,
      },
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        serviceType: [
          "Computer Repair",
          "Tech Support",
          "Website Help",
          "AI Automation",
          "Business Workflow Automation",
          "Website Security",
        ],
      },
    ],
  };

  return (
    <div className="site-shell homepage-shell">
      <RequestHelpFab />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10 lg:px-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <section className="hero-split rounded-3xl">
          <div className="hero-split-content">
            <h1 className="hero-title">
              Technology Problems?
              <br />
              <span className="hero-accent">We Can Help.</span>
            </h1>
            <p className="hero-copy mt-4">
              From slow computers and laptop problems to Wi-Fi issues, phone troubleshooting,
              websites, and business technology, ZeroCool Development makes technology simple.
              Honest service, fair pricing, and no confusing tech talk.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="cta-primary inline-flex">
                Get Help Now
              </Link>
              <Link href="/free-estimate" className="cta-secondary inline-flex">
                Free Estimate
              </Link>
            </div>

            <div className="hero-trust-grid mt-7">
              {trustPoints.map((point) => (
                <article key={point.title} className="hero-trust-item">
                  <span className="hero-trust-icon-wrap">{point.icon}</span>
                  <div>
                    <p className="hero-trust-title">{point.title}</p>
                    <p className="hero-trust-copy">{point.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-split-media" aria-hidden="true">
            <Image
              src="/reference/zerocool-homepage-reference.png"
              alt="Computer repair workstation"
              width={1152}
              height={768}
              className="hero-tech-image"
              priority
            />
            <div className="hero-image-overlay" />
          </div>
        </section>

        <CustomerProblemFinder />

        <WhyChooseZeroCool />

        <ReviewsSection />

        <section className="bottom-cta-band rounded-2xl">
          <div>
            <h2 className="bottom-cta-title">Need Help?</h2>
            <p className="bottom-cta-copy">
              Whether it&apos;s a computer problem, Wi-Fi issue, or business technology need, we&apos;re
              here for you.
            </p>
          </div>
          <div className="bottom-cta-actions">
            <Link href="/free-estimate" className="cta-primary inline-flex">
              Get a Free Estimate
            </Link>
            <Link href="/book-service" className="cta-secondary inline-flex">
              Call Now
            </Link>
            <Link href="/contact" className="cta-secondary inline-flex">
              Send a Message
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
