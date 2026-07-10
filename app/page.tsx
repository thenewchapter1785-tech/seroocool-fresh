import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AiAssistantPanel from "./ai-assistant-panel";
import BeforeAfterProjects from "./components/BeforeAfterProjects";
import CustomerProblemFinder from "./customer-problem-finder";
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
  title: "ZeroCool Development | Computer Repair and Tech Support",
  description:
    "Computer repair and everyday tech support in plain English. We also help business owners with websites, apps, automation, SEO, and business tech.",
  path: "/",
});

const coreCtas = [
  { label: "Get Help Now", href: "#contact", style: "primary" },
  { label: "Free Estimate", href: "/estimate", style: "secondary" },
];

const faqItems = [
  {
    question: "Do I need to know technical terms before I contact you?",
    answer:
      "No. Just describe what you see. We explain everything in plain English.",
  },
  {
    question: "Can you help with both home tech issues and business tech needs?",
    answer:
      "Yes. We fix everyday problems for families and also help business owners with websites, apps, automation, and SEO.",
  },
  {
    question: "What if I am not sure what is wrong yet?",
    answer:
      "That is normal. Tell us what your device is doing, and we will guide you through next steps.",
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
            <p className="label-chip inline-flex">Local Computer Repair • Friendly Tech Help</p>
          </div>

          <h1 className="relative z-10 text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            Technology Problems? We Can Help.
          </h1>
          <p className="relative z-10 mt-4 max-w-4xl text-base leading-7 text-slate-200/90 md:text-lg">
            From slow computers and laptop problems to Wi-Fi issues, phone troubleshooting,
            websites, and business technology, ZeroCool Development makes technology simple. Honest
            service, fair pricing, and no confusing tech talk.
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

        <CustomerProblemFinder />

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Not tech savvy? No problem.</h2>
          <p className="section-copy mt-3">
            You do not need to know what is wrong. Tell us what your computer, phone, Wi-Fi,
            website, or business technology is doing and we will explain the options in plain
            English.
          </p>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Choose Your Service Path</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="faq-card">
              <h3 className="faq-question">Home and Personal Tech Help</h3>
              <p className="faq-answer">
                Computer repair, laptop repair, PC diagnostics, virus and malware removal, slow
                computer help, phone troubleshooting, device setup, Wi-Fi setup, printer setup,
                email setup, remote support, custom computers, and gaming PC builds.
              </p>
            </article>
            <article className="faq-card">
              <h3 className="faq-question">Business Technology Services</h3>
              <p className="faq-answer">
                Website design and development, e-commerce, mobile apps, custom business software,
                SEO, Google Business Profile support, HubSpot CRM, AI automation, business
                automation, small business IT support, Cloudflare security, and DigitalOcean
                deployment.
              </p>
            </article>
          </div>
          <div className="mt-5">
            <Link href="/services" className="cta-secondary inline-flex">
              Explore All Services
            </Link>
          </div>
        </section>

        <WhyChooseZeroCool />
        <ReviewsSection />
        <BeforeAfterProjects />

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Free Estimate</h2>
          <p className="section-copy mt-3">
            No pressure. No obligation. Tell us what is happening and we will help you understand
            the next step.
          </p>
          <Suspense fallback={<p className="section-copy mt-4">Loading estimate tool...</p>}>
            <LiveEstimator />
          </Suspense>
          <div className="mt-4">
            <Link href="/book-service" className="cta-secondary inline-flex">
              Book a Service Visit
            </Link>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8" id="contact">
          <h2 className="section-title">Tell Us What Is Going On</h2>
          <p className="section-copy mt-3">
            No pressure and no confusing jargon. Share the problem and we will send clear next
            steps.
          </p>
          <TrustBadges />
          <div className="mt-4">
            <LeadForm />
          </div>
        </section>

        <AiAssistantPanel />

        <PlatformsSupported />

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Helpful Tips From ZeroCool</h2>
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
              Read More Tips
            </Link>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Quick Questions</h2>
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
              Need Emergency Help
            </Link>
            <Link href="/plans" className="cta-secondary inline-flex">
              See Monthly Support Plans
            </Link>
            <Link href="/free-guides" className="cta-secondary inline-flex">
              Get Free How-To Guides
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
