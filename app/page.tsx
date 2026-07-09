import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AiAssistantPanel from "./ai-assistant-panel";
import BeforeAfterProjects from "./components/BeforeAfterProjects";
import PlatformsSupported from "./components/PlatformsSupported";
import ReviewsSection from "./components/ReviewsSection";
import TrustBadges from "./components/TrustBadges";
import WhyChooseZeroCool from "./components/WhyChooseZeroCool";
import LeadForm from "./lead-form";
import LiveEstimator from "./live-estimator";
import RequestHelpFab from "./request-help-fab";
import { blogPosts } from "@/lib/blog";
import { getContactEmail, getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ZeroCool Development | Free Estimate Technology Services",
  description:
    "Lead-focused technology support and growth services: repair, websites, AI automation, CRM setup, business automation, and cloud security.",
  path: "/",
});

const coreCtas = [
  { label: "Request Free Estimate", href: "#contact", style: "primary" },
  { label: "Book Service", href: "/book-service", style: "secondary" },
  { label: "Try Instant Quote", href: "/estimate", style: "secondary" },
];

const faqItems = [
  {
    question: "Do I need technical experience to work with ZeroCool?",
    answer:
      "No. We keep everything beginner-friendly, plain language, and action oriented.",
  },
  {
    question: "Can you help with both emergency support and long-term growth?",
    answer:
      "Yes. We handle urgent incidents and ongoing website, automation, and support plans.",
  },
  {
    question: "Do you offer free estimates?",
    answer:
      "Yes. We use free-estimate language throughout intake, booking, and consultation flows.",
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
          "Website Development",
          "AI Automation",
          "Business Automation",
          "Cloud Security",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="site-shell">
      <RequestHelpFab />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="glass-panel hero-panel animate-rise rounded-3xl p-7 md:p-10">
          <div className="hero-tech-visual" aria-hidden="true">
            <span className="orb orb-a" />
            <span className="orb orb-b" />
            <span className="orb orb-c" />
            <span className="node node-a" />
            <span className="node node-b" />
            <span className="node node-c" />
            <span className="node node-d" />
          </div>

          <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
            <Image
              src="/logo.png"
              alt="ZeroCool Development logo"
              width={168}
              height={112}
              className="brand-logo"
              priority
            />
            <p className="label-chip inline-flex">Dark Cyber Aesthetic • Premium Execution</p>
          </div>

          <h1 className="relative z-10 text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            Free Estimate Technology Services Built to Increase Revenue and Leads
          </h1>
          <p className="relative z-10 mt-4 max-w-4xl text-base leading-7 text-slate-200/90 md:text-lg">
            ZeroCool Development combines computer support, websites, automation, and AI systems to
            increase calls, consultation requests, and qualified lead flow.
          </p>

          <div className="relative z-10 mt-6 flex flex-wrap gap-3">
            {coreCtas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={cta.style === "primary" ? "cta-primary inline-flex" : "cta-secondary inline-flex"}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </header>

        <WhyChooseZeroCool />
        <ReviewsSection />
        <BeforeAfterProjects />

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Instant Quote Tool</h2>
          <p className="section-copy mt-3">
            Start with service-specific questions and get a real estimate range with upsell recommendations.
          </p>
          <LiveEstimator />
          <div className="mt-4">
            <Link href="/book-service" className="cta-secondary inline-flex">
              Continue to Book Service
            </Link>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8" id="contact">
          <h2 className="section-title">Request Your Free Estimate</h2>
          <p className="section-copy mt-3">
            Share your issue and we will respond with clear recommendations and next steps.
          </p>
          <TrustBadges />
          <div className="mt-4">
            <LeadForm />
          </div>
        </section>

        <AiAssistantPanel />

        <PlatformsSupported />

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Latest from the Blog</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {blogPosts.slice(0, 6).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="project-card">
                <p className="project-tag">{post.readTime}</p>
                <h3 className="project-title">{post.title}</h3>
                <p className="project-copy">{post.excerpt}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/blog" className="cta-secondary inline-flex">
              Explore Blog
            </Link>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {faqItems.map((faq) => (
              <article key={faq.question} className="faq-card">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/emergency-tech-support" className="cta-primary inline-flex">
              Request Emergency Help
            </Link>
            <Link href="/plans" className="cta-secondary inline-flex">
              View Monthly Plans
            </Link>
            <Link href="/free-guides" className="cta-secondary inline-flex">
              Download Free Guides
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
