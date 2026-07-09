import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AiAssistantPanel from "./ai-assistant-panel";
import LeadForm from "./lead-form";
import QuickLeadForm from "./quick-lead-form";
import { getContactEmail, getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";
import { businessServices, primaryServices } from "@/lib/services";

export const metadata: Metadata = buildPageMetadata({
  title: "Technology Solutions for Home, Business, and Everything In Between",
  description:
    "ZeroCool Development delivers computer repair, phone troubleshooting, custom PCs, website development, business software, AI automation, and friendly tech support for Rhode Island and remote clients.",
  path: "/",
});

export default function Home() {
  const siteUrl = getSiteUrl();
  const contactEmail = getContactEmail();

  const trustPoints = [
    "Building computers since age 12",
    "Honest pricing",
    "Fast turnaround",
    "Local Rhode Island support",
    "Remote support available nationwide",
    "Friendly service",
    "No confusing technical language",
    "Personalized solutions",
    "Free estimates",
    "Professional communication",
  ];

  const serviceCards = [
    { title: "Computer Repair", href: "/services/computer-repair" },
    { title: "Phone Help", href: "/services/phone-troubleshooting" },
    { title: "Virus Removal", href: "/services/virus-malware-removal" },
    { title: "Gaming PCs", href: "/services/gaming-pc-builds" },
    { title: "Website Development", href: "/services/website-development" },
    { title: "Mobile Apps", href: "/services/mobile-app-development" },
    { title: "Business Software", href: "/services/custom-business-software" },
    { title: "AI Automation", href: "/services/ai-automation" },
    { title: "Tech Support", href: "/services/remote-tech-support" },
    { title: "Networking", href: "/services/network-troubleshooting" },
    { title: "Business IT", href: "/services/business-technology-consulting" },
    { title: "Cloud Services", href: "/services/cloud-infrastructure" },
  ];

  const faqItems = [
    {
      question: "I am not tech savvy. Can I still get help?",
      answer:
        "Absolutely. We explain everything in plain language, recommend practical options, and keep the process stress-free.",
    },
    {
      question: "Do you only work with businesses?",
      answer:
        "No. We support home users, students, elderly clients, families, gamers, and businesses of all sizes.",
    },
    {
      question: "Are you local to Rhode Island?",
      answer:
        "Yes. ZeroCool Development serves Rhode Island directly and also provides remote support for clients nationwide.",
    },
    {
      question: "Can you help with both everyday tech issues and advanced software?",
      answer:
        "Yes. We handle everything from slow computers and Wi-Fi issues to websites, apps, CRM integrations, and AI automation.",
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
        slogan: "Technology made simple. Fast. Honest. Affordable.",
      },
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        url: siteUrl,
        description:
          "Full-service technology company for home users and small businesses including computer repair, custom PCs, websites, software, and AI automation.",
        serviceType: [
          ...primaryServices.map((service) => service.name),
          ...businessServices.map((service) => service.name),
        ],
      },
      {
        "@type": "LocalBusiness",
        name: "ZeroCool Development",
        areaServed: ["Rhode Island", "United States"],
        url: siteUrl,
        email: contactEmail,
      },
      {
        "@type": "WebSite",
        name: "ZeroCool Development",
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/services`,
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
            <p className="label-chip inline-flex">Serving Rhode Island + Remote Clients</p>
          </div>

          <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            Technology Solutions for Home, Business, and Everything In Between
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-200/90 md:text-lg">
            From fixing slow computers and troubleshooting phones to building custom websites,
            AI automation, and business software, ZeroCool Development is your one-stop
            technology partner.
          </p>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-200/85">
            I&apos;ve been building computers since I was 12 years old. Technology isn&apos;t just my
            career, it&apos;s my passion. My goal is to provide honest, affordable, professional
            technology solutions without the confusing jargon or overpriced services offered by
            big box stores.
          </p>

          <p className="mt-4 text-sm font-semibold tracking-[0.25em] text-blue-200 uppercase">
            FAST. HONEST. AFFORDABLE.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="#estimate" className="cta-primary inline-flex">
              Request a Free Estimate
            </Link>
            <Link href="#ai-assistant" className="cta-secondary inline-flex">
              Talk With Our AI Assistant
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Why Choose ZeroCool Development</h2>
          <p className="section-copy mt-3">
            Skip the big box stores. Get reliable tech solutions at prices that won&apos;t break the
            bank, with personalized service from someone who genuinely enjoys helping people.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map((item) => (
              <div key={item} className="proof-chip">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Tech Help Without the Headache</h2>
          <p className="section-copy mt-3">
            You do not need to know technical terms to get help. Whether your computer won&apos;t
            start, your Wi-Fi keeps disconnecting, your phone is acting up, or your business
            needs a professional website, we&apos;re here to help.
          </p>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Services We Offer</h2>
          <p className="section-copy mt-3">
            Full-service support for home users, families, gamers, students, startups,
            contractors, restaurants, retail stores, and professional offices.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => (
              <Link key={service.title} href={service.href} className="project-card">
                <p className="project-tag">Service</p>
                <h3 className="project-title">{service.title}</h3>
                <p className="project-copy">Technology made simple and approachable.</p>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/services" className="cta-secondary inline-flex">
              View All Services
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2" id="estimate">
          <QuickLeadForm
            title="Free Computer Diagnostic"
            description="Not sure what is wrong with your device? Start with a free diagnostic request."
            projectType="computer_diagnostic"
            formType="free_computer_diagnostic"
            ctaLabel="Request Free Computer Diagnostic"
          />
          <QuickLeadForm
            title="Free Website Consultation"
            description="Need a better website or online presence? Request a free website consultation."
            projectType="website_consultation"
            formType="free_website_consultation"
            ctaLabel="Request Free Website Consultation"
          />
          <QuickLeadForm
            title="Free Business Technology Review"
            description="Get practical recommendations for software, automation, and operations."
            projectType="business_technology_review"
            formType="free_business_technology_review"
            ctaLabel="Request Technology Review"
          />
          <QuickLeadForm
            title="Free AI Automation Consultation"
            description="Explore how AI can save time and improve consistency in your business."
            projectType="ai_automation_consultation"
            formType="free_ai_automation_consultation"
            ctaLabel="Request AI Consultation"
          />
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8" id="contact">
          <h2 className="section-title">Request a Free Estimate</h2>
          <p className="section-copy mt-3">
            Tell us what you need. We&apos;ll respond quickly with clear next steps and honest pricing.
          </p>
          <div className="mt-4">
            <LeadForm />
          </div>
        </section>

        <div id="ai-assistant">
          <AiAssistantPanel />
        </div>

        <section className="glass-panel rounded-3xl p-7 text-center md:p-10">
          <h2 className="section-title">Final Contact CTA</h2>
          <p className="section-copy mt-3">
            Reliable tech solutions at prices that won&apos;t break the bank. Free estimates.
            Serving Rhode Island and remote clients.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="#estimate" className="cta-primary inline-flex">
              Request a Free Estimate
            </Link>
            <Link href="/free-consultation" className="cta-secondary inline-flex">
              Book Free Consultation
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
