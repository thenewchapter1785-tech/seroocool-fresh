import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AiAssistantPanel from "./ai-assistant-panel";
import LeadForm from "./lead-form";
import QuickLeadForm from "./quick-lead-form";
import TrackedLink from "./tracked-link";
import { getContactEmail, getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ZeroCool Development | Website, Apps, AI Automation, CRM Integration",
  description:
    "ZeroCool Development helps small businesses grow with website and app development, AI automation, HubSpot CRM integration, Cloudflare security, and DigitalOcean hosting.",
  path: "/",
});

export default function Home() {
  const siteUrl = getSiteUrl();
  const contactEmail = getContactEmail();

  const trustItems = [
    "Free Consultation",
    "Website & App Development",
    "AI Automation",
    "CRM Integration",
    "Fast Response",
    "Secure Deployment",
    "Built for Small Businesses",
    "Serving Rhode Island and remote clients",
  ];

  const servicePages = [
    { href: "/web-development", title: "Web Development" },
    { href: "/mobile-app-development", title: "Mobile App Development" },
    { href: "/ai-automation", title: "AI Automation" },
    { href: "/business-automation", title: "Business Automation" },
    { href: "/hubspot-integration", title: "HubSpot Integration" },
    { href: "/cloudflare-security", title: "Cloudflare Security" },
    { href: "/digitalocean-hosting", title: "DigitalOcean Hosting" },
    { href: "/free-consultation", title: "Free Consultation" },
  ];

  const portfolioPreview = [
    {
      title: "Lead-focused website rebuild",
      copy:
        "Modernized a small business site with conversion-focused UX and improved inquiry flow.",
    },
    {
      title: "Automation workflow rollout",
      copy:
        "Reduced repetitive operations by integrating automated lead and onboarding triggers.",
    },
    {
      title: "AI-assisted qualification",
      copy:
        "Implemented secure backend AI routing for practical pre-consultation lead triage.",
    },
  ];

  const faqItems = [
    {
      question: "What can ZeroCool Development help us with first?",
      answer:
        "Most clients start with either website conversion upgrades or workflow automation opportunities with immediate impact.",
    },
    {
      question: "Do you work with Rhode Island businesses and remote clients?",
      answer:
        "Yes. We serve Rhode Island businesses directly and support remote clients across broader regions.",
    },
    {
      question: "Can we start with a free consultation?",
      answer:
        "Yes. We provide a free consultation to review goals, constraints, and the fastest path to implementation.",
    },
  ];

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
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        url: siteUrl,
        description:
          "Website and app development, AI automation, CRM integration, and secure cloud deployment support for small businesses.",
        serviceType: [
          "Website Development",
          "Mobile App Development",
          "AI Automation",
          "Business Automation",
          "HubSpot Integration",
          "Cloudflare Security",
          "DigitalOcean Hosting",
        ],
      },
      {
        "@type": "LocalBusiness",
        name: "ZeroCool Development",
        areaServed: ["Rhode Island", "Remote"],
        url: siteUrl,
        email: contactEmail,
      },
      {
        "@type": "WebSite",
        name: "ZeroCool Development",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/insights`,
          "query-input": "required name=search_term_string",
        },
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
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="glass-panel animate-rise rounded-3xl p-7 md:p-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Image
              src="/logo.png"
              alt="ZeroCool Development logo"
              width={168}
              height={112}
              className="brand-logo"
              priority
            />
            <p className="label-chip inline-flex">Free Consultation Available</p>
          </div>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            Grow faster with secure websites, apps, automation, and AI workflows.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200/85 md:text-lg">
            ZeroCool Development helps small businesses generate more leads, automate operations,
            and deploy with confidence on Cloudflare and DigitalOcean.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="#contact"
              className="cta-primary"
              eventName="hero_free_consultation_click"
            >
              Free Consultation
            </TrackedLink>
            <TrackedLink href="/free-consultation" className="cta-secondary" eventName="hero_form_click">
              Request Strategy Session
            </TrackedLink>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item} className="proof-chip">
                {item}
              </div>
            ))}
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Services Overview</h2>
          <p className="section-copy mt-3">
            Explore dedicated landing pages for each service line and conversion path.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {servicePages.map((item) => (
              <Link key={item.href} href={item.href} className="tech-pill">
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-heading">Why choose ZeroCool Development</h2>
            <p className="section-copy mt-3">
              We blend technical implementation with lead-generation outcomes so your investment
              improves both operations and revenue.
            </p>
          </article>
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-heading">AI and business automation</h2>
            <p className="section-copy mt-3">
              Identify repetitive manual steps, then automate them with secure integrations and
              practical governance.
            </p>
          </article>
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-heading">Secure deployment</h2>
            <p className="section-copy mt-3">
              Production-ready architecture with security headers, CSP, rate limiting, CORS,
              and validated input handling.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <QuickLeadForm
            title="Free Consultation Form"
            description="Start with a no-cost strategy consultation to define next steps."
            projectType="free_consultation"
            formType="free_consultation"
            ctaLabel="Request Consultation"
          />
          <QuickLeadForm
            title="Website Audit Request"
            description="Request a website audit for SEO, speed, and conversion opportunities."
            projectType="website_audit"
            formType="website_audit_request"
            ctaLabel="Request Audit"
          />
          <article className="glass-panel rounded-3xl p-6 md:p-8" id="contact">
            <h2 className="section-title">Contact Form</h2>
            <p className="section-copy mt-3">
              Share your project goals and get a fast response from ZeroCool Development.
            </p>
            <div className="mt-4">
              <LeadForm />
            </div>
          </article>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Portfolio and Case Study Preview</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {portfolioPreview.map((item) => (
              <article key={item.title} className="project-card">
                <p className="project-tag">Case Study Preview</p>
                <h3 className="project-title">{item.title}</h3>
                <p className="project-copy">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {faqItems.map((item) => (
            <article key={item.question} className="faq-card">
              <h2 className="faq-question">{item.question}</h2>
              <p className="faq-answer">{item.answer}</p>
            </article>
          ))}
        </section>

        <AiAssistantPanel />

        <section className="glass-panel rounded-3xl p-7 text-center md:p-10">
          <h2 className="section-title">Final Contact CTA</h2>
          <p className="section-copy mt-3">
            Ready to improve lead generation and operational efficiency? Let&apos;s plan your next
            release with a free consultation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/free-consultation" className="cta-primary inline-flex">
              Book Free Consultation
            </Link>
            <Link href="#contact" className="cta-secondary inline-flex">
              Submit Project Details
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
