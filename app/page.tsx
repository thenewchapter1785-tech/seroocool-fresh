import Image from "next/image";
import Link from "next/link";
import LeadForm from "./lead-form";
import TrackedLink from "./tracked-link";

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://zerocool-development.com";
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "mailto:zerocool.development.project@gmail.com?subject=Project%20Consultation%20-%20ZeroCool%20Development";
  const contactEmail =
    process.env.CONTACT_EMAIL ?? "zerocool.development.project@gmail.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        description:
          "Web development, app development, automation, AI integration, and technology consulting for growing businesses.",
        url: siteUrl,
        areaServed: "US",
        serviceType: [
          "Web Development",
          "Application Development",
          "Business Process Automation",
          "AI Integration",
          "Technology Consulting",
        ],
      },
      {
        "@type": "LocalBusiness",
        name: "ZeroCool Development",
        url: siteUrl,
        image: `${siteUrl}/logo.png`,
        email: contactEmail,
        areaServed: "US",
        knowsAbout: [
          "Web development",
          "Mobile app development",
          "Business automation",
          "AI integration",
          "Technical consulting",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Do you work with both individuals and businesses?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. ZeroCool Development provides one-on-one support for individuals and scalable technology solutions for businesses.",
            },
          },
          {
            "@type": "Question",
            name: "What services does ZeroCool Development provide?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Services include web development, app development, business automation, AI integration, and technical consulting for operations and growth.",
            },
          },
          {
            "@type": "Question",
            name: "How quickly can we start?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Most requests receive a response within one business day with practical next steps and realistic timing.",
            },
          },
        ],
      },
    ],
  };

  const capabilities = [
    "Conversion-focused web development",
    "Custom app development",
    "Automation architecture and implementation",
    "AI integration for customer and internal workflows",
    "API integrations across business systems",
    "Technical discovery and consulting",
  ];

  const techStack = [
    "TypeScript",
    "React",
    "Next.js",
    "Python",
    "Node.js",
    "PostgreSQL",
    "OpenAI API",
    "HubSpot CRM",
    "Cloudflare",
    "DigitalOcean",
    "Automation APIs",
  ];

  const trustStats = [
    { label: "Response Window", value: "< 1 Business Day" },
    { label: "Delivery Model", value: "Consult + Build" },
    { label: "Focus", value: "Growth Through Tech" },
  ];

  const deliveryStandards = [
    {
      title: "Architecture with outcomes",
      copy:
        "Every engagement starts with business goals, then maps to measurable technical execution.",
    },
    {
      title: "Senior-level communication",
      copy:
        "Clear status updates, scoped milestones, and practical trade-off guidance keep projects on track.",
    },
    {
      title: "Secure by default",
      copy:
        "Security, performance, and maintainability are treated as baseline requirements, not add-ons.",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Discovery and scope",
      copy: "We clarify goals, constraints, and the highest-impact technical opportunities.",
    },
    {
      step: "02",
      title: "Build and integrate",
      copy: "Implementation ships in practical stages, with integrations and quality checks in each phase.",
    },
    {
      step: "03",
      title: "Launch and optimize",
      copy: "After release, we tune performance, automation flow, and lead conversion signals.",
    },
  ];

  const servicePaths = [
    {
      href: "/services/business-websites",
      title: "Web Development",
      copy: "Modern, conversion-focused websites designed to build trust and generate qualified leads.",
    },
    {
      href: "/services/custom-web-apps",
      title: "App Development",
      copy: "Custom software, portals, and tools built around your real operations and growth goals.",
    },
    {
      href: "/services/automation-integrations",
      title: "Automation + AI Integration",
      copy: "Automate repetitive tasks and connect systems so your team can focus on high-value work.",
    },
  ];

  const insightLinks = [
    {
      href: "/insights/how-to-get-more-leads-from-your-website",
      title: "How to Get More Leads From Your Website",
      copy: "Practical improvements that increase inquiries without increasing ad spend.",
    },
    {
      href: "/insights/business-website-cost-breakdown",
      title: "Business Website Cost Breakdown",
      copy: "Understand where budget goes and how to scope a site that actually performs.",
    },
    {
      href: "/insights/automation-for-small-business-operations",
      title: "Automation for Small Business Operations",
      copy: "Find high-impact process bottlenecks you can automate first.",
    },
  ];

  const faqItems = [
    {
      question: "Do you work with both individuals and businesses?",
      answer:
        "Yes. ZeroCool Development supports both solo operators and growing teams with right-sized technology solutions.",
    },
    {
      question: "Do you offer AI integration for existing software?",
      answer:
        "Yes. We can connect OpenAI-powered workflows to your website, CRM, internal tools, and customer support systems.",
    },
    {
      question: "How quickly can we start?",
      answer:
        "Most requests receive a response within one business day with clear next steps and timeline options.",
    },
  ];

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="glass-panel animate-rise relative overflow-hidden rounded-3xl p-7 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(71,133,255,0.28)_0%,rgba(71,133,255,0)_70%)]" />
          <div className="mb-5 flex items-center justify-between gap-3">
            <Image
              src="/logo.png"
              alt="ZeroCool Development logo"
              width={168}
              height={112}
              className="brand-logo"
              priority
            />
            <div className="flex gap-2">
              <Link href="/services" className="label-chip inline-flex">
                Services
              </Link>
              <Link href="/insights" className="label-chip inline-flex">
                Insights
              </Link>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
                ZeroCool Development builds secure digital systems for growth.
                <span className="text-blue-300">
                  {" "}
                  Websites, apps, automation, and AI integration.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200/85 md:text-lg">
                Partner with a technical team that can design, build, and optimize digital
                products tied to real business outcomes. From lead generation websites to custom
                applications and AI-enabled automation, every project is scoped for measurable
                impact.
              </p>
              <div className="hero-actions mt-6 flex flex-wrap gap-3">
                <TrackedLink
                  href="#contact"
                  className="cta-primary"
                  eventName="hero_project_estimate_click"
                >
                  Start a Project
                </TrackedLink>
                <TrackedLink
                  href={bookingUrl}
                  className="cta-secondary"
                  eventName="hero_consult_click"
                >
                  Schedule Consultation
                </TrackedLink>
              </div>
              <div className="hero-proof-grid mt-6 grid gap-2 sm:grid-cols-3">
                <div className="proof-chip">Backend security built-in</div>
                <div className="proof-chip">SEO and conversion foundations</div>
                <div className="proof-chip">Automation-ready architecture</div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200/20 bg-slate-950/60 p-5">
              <p className="text-xs font-medium tracking-[0.25em] text-blue-200/80 uppercase">
                Ideal Engagements
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-100/90">
                <li>Businesses modernizing lead generation and conversion paths</li>
                <li>Teams replacing manual operations with automation</li>
                <li>Organizations integrating AI into existing workflows</li>
                <li>Founders building MVPs and production web apps</li>
              </ul>
            </div>
          </div>
        </header>

        <section className="section-stack animate-rise-delayed grid gap-4 md:grid-cols-2">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">Services</h2>
            <p className="section-copy mt-3">
              Full-stack delivery for modern business software. Every engagement combines
              strategy, implementation, and operational follow-through.
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-slate-100/90 sm:grid-cols-2">
              {capabilities.map((skill) => (
                <li key={skill} className="tech-pill">
                  {skill}
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">Approach</h2>
            <p className="section-copy mt-3">
              ZeroCool Development combines product thinking, engineering execution, and
              automation design so your technology decisions stay aligned with revenue,
              efficiency, and customer experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {techStack.map((item) => (
                <span key={item} className="stack-chip">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4 md:grid-cols-3">
          {servicePaths.map((service) => (
            <Link key={service.href} href={service.href} className="project-card">
              <p className="project-tag">Service Path</p>
              <h2 className="project-title">{service.title}</h2>
              <p className="project-copy">{service.copy}</p>
            </Link>
          ))}
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4 md:grid-cols-3">
          {deliveryStandards.map((item) => (
            <article key={item.title} className="glass-panel rounded-3xl p-6 md:p-8">
              <h2 className="section-heading">{item.title}</h2>
              <p className="section-copy mt-3">{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">Delivery Process</h2>
            <div className="mt-5 grid gap-3">
              {processSteps.map((item) => (
                <div key={item.step} className="faq-card">
                  <p className="project-tag">Step {item.step}</p>
                  <h3 className="section-heading mt-1">{item.title}</h3>
                  <p className="section-copy mt-2">{item.copy}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-3xl p-6 md:p-8" id="contact">
            <h2 className="section-title">Contact ZeroCool Development</h2>
            <p className="section-copy mt-3 section-intro">
              Use this intake form for web development, app development, automation, AI
              integration, or consulting requests. Most responses are sent within one
              business day.
            </p>
            <div className="mt-5 grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-start">
              <LeadForm />
              <aside className="direct-contact-card">
                <h3 className="section-heading">Direct Contact</h3>
                <div className="direct-contact-list">
                  <div className="contact-row">
                    <p className="contact-key">Email</p>
                    <p className="contact-value">
                      <a href={`mailto:${contactEmail}`} className="contact-link">
                        {contactEmail}
                      </a>
                    </p>
                  </div>
                  <div className="contact-row">
                    <p className="contact-key">Consult</p>
                    <p className="contact-value">
                      <a href={bookingUrl} className="contact-link">
                        Request Consultation
                      </a>
                    </p>
                  </div>
                  <div className="contact-row">
                    <p className="contact-key">Focus</p>
                    <p className="contact-value">Web • Apps • Automation • AI</p>
                  </div>
                </div>
              </aside>
            </div>
          </article>
        </section>

        <section className="section-stack animate-rise-delayed-3 glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Insights</h2>
          <p className="section-copy mt-3 section-intro">
            Explore conversion, technology planning, and automation guides for growth-focused
            teams.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {insightLinks.map((insight) => (
              <Link key={insight.href} href={insight.href} className="project-card">
                <p className="project-tag">Guide</p>
                <h3 className="project-title">{insight.title}</h3>
                <p className="project-copy">{insight.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-3 grid gap-4 md:grid-cols-3">
          {faqItems.map((item) => (
            <article key={item.question} className="faq-card">
              <h3 className="faq-question">{item.question}</h3>
              <p className="faq-answer">{item.answer}</p>
            </article>
          ))}
        </section>
      </main>

      <div className="sticky-mobile-cta">
        <TrackedLink
          href="#contact"
          className="cta-primary"
          eventName="mobile_estimate_click"
        >
          Start Project
        </TrackedLink>
        <TrackedLink
          href={bookingUrl}
          className="cta-secondary"
          eventName="mobile_consult_click"
        >
          Consult
        </TrackedLink>
      </div>
    </div>
  );
}
