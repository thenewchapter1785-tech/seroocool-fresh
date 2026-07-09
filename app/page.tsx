import Image from "next/image";
import Link from "next/link";
import LeadForm from "./lead-form";
import TrackedLink from "./tracked-link";

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://zerocool-development.com";
  const facebookPageUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ?? "https://facebook.com/";
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "mailto:zerocool.development.project@gmail.com?subject=Strategy%20Call%20-%20ZeroCool%20Development";
  const phoneHref = "tel:+14017862811";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Corey Derosiers",
        alternateName: "ZeroCool",
        url: siteUrl,
        email: "mailto:zerocool.development.project@gmail.com",
        telephone: "+1-401-786-2811",
        sameAs: [facebookPageUrl],
      },
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        url: siteUrl,
        areaServed: "US",
        serviceType: [
          "Custom Website Development",
          "Mobile Application Development",
          "Custom Business Software",
          "Software Automation",
          "UI/UX Design",
          "Computer Repair",
          "Custom PC Builds",
          "Hardware Diagnostics and Repair",
          "Computer Upgrades",
          "Virus and Malware Removal",
          "Performance Optimization",
          "Phone Troubleshooting",
          "Network and Wi-Fi Troubleshooting",
          "General Technical Support",
        ],
      },
      {
        "@type": "LocalBusiness",
        name: "ZeroCool Development",
        url: siteUrl,
        image: `${siteUrl}/logo.png`,
        email: "zerocool.development.project@gmail.com",
        telephone: "+1-401-786-2811",
        areaServed: "US",
        knowsAbout: [
          "Web development",
          "Mobile app development",
          "Computer repair",
          "Custom PC builds",
          "Business software",
          "Technical support",
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
            name: "Can you help with both software and hardware issues?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Services include custom websites, mobile apps, automation, software development, repairs, upgrades, diagnostics, and ongoing technical support.",
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
    "Custom Website Development",
    "Mobile Application Development (Android and iOS)",
    "Custom Business Software",
    "Software Automation",
    "UI/UX Design",
    "Computer Repair",
    "Custom PC Builds",
    "Hardware Diagnostics and Repair",
    "Computer Upgrades",
    "Virus and Malware Removal",
    "Performance Optimization",
    "Phone Troubleshooting",
    "Network and Wi-Fi Troubleshooting",
    "General Technical Support",
  ];

  const techStack = [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "Android",
    "Firebase",
    "PostgreSQL",
    "REST APIs",
    "AI Integrations",
  ];

  const trustStats = [
    { label: "Response Window", value: "1 Business Day" },
    { label: "Service Model", value: "One-on-One Support" },
    { label: "Pricing", value: "Honest + Affordable" },
  ];

  const deliveryStandards = [
    {
      title: "Real-world experience",
      copy:
        "I have been building computers since I was 12, and that hands-on experience shapes every recommendation and build decision.",
    },
    {
      title: "Professional communication",
      copy:
        "You get clear updates, practical options, and transparent scope so projects move forward without confusion.",
    },
    {
      title: "Craftsmanship with speed",
      copy:
        "High-quality execution and fast turnaround are priorities, whether you need software delivery or technical repair.",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Share the issue or goal",
      copy: "Tell me what you need built, fixed, upgraded, or automated in plain language.",
    },
    {
      step: "02",
      title: "Get a clear plan",
      copy: "You get practical recommendations, honest pricing, and a focused path to the right outcome.",
    },
    {
      step: "03",
      title: "Execute and deliver",
      copy: "I handle implementation with care, quality control, and communication from kickoff through completion.",
    },
  ];

  const servicePaths = [
    {
      href: "/services/business-websites",
      title: "Business Websites",
      copy: "Modern, conversion-focused websites designed to build trust and generate qualified leads.",
    },
    {
      href: "/services/custom-web-apps",
      title: "Custom Web Apps",
      copy: "Custom software, portals, and tools built around your real operations and growth goals.",
    },
    {
      href: "/services/automation-integrations",
      title: "Automation + APIs",
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
        "Yes. I provide one-on-one technical support for individuals and professional technology services for businesses.",
    },
    {
      question: "Are your services more affordable than big retail tech support?",
      answer:
        "In most cases, yes. You get personalized service, honest pricing, and high-quality work without paying big-box overhead.",
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
          <div className="mb-5 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ZeroCool Development logo"
              width={168}
              height={112}
              className="brand-logo"
              priority
            />
            <p className="label-chip inline-flex">ZeroCool Development</p>
          </div>
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
                Technology is my passion.
                <span className="text-blue-300"> I have been building computers since I was 12.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200/85 md:text-lg">
                ZeroCool Development helps individuals and businesses with
                professional, affordable technology solutions including websites,
                mobile apps, business software, automation, repair, upgrades,
                and ongoing technical support.
              </p>
              <div className="hero-actions mt-6 flex flex-wrap gap-3">
                <TrackedLink
                  href="#contact"
                  className="cta-primary"
                  eventName="hero_project_estimate_click"
                >
                  Get a Project Estimate
                </TrackedLink>
                <TrackedLink
                  href={phoneHref}
                  className="cta-secondary"
                  eventName="hero_call_click"
                >
                  Call 401-786-2811
                </TrackedLink>
              </div>
              <div className="hero-proof-grid mt-6 grid gap-2 sm:grid-cols-3">
                <div className="proof-chip">Personalized one-on-one service</div>
                <div className="proof-chip">Fast turnaround times</div>
                <div className="proof-chip">Professional craftsmanship</div>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-200/20 bg-slate-950/60 p-5">
              <p className="text-xs font-medium tracking-[0.25em] text-blue-200/80 uppercase">
                Best Fit
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-100/90">
                <li>Need: Personalized support instead of generic retail service</li>
                <li>Need: Honest pricing with practical recommendations</li>
                <li>Need: Reliable help across software, hardware, and networking</li>
                <li>Need: Technology that helps your business grow</li>
              </ul>
            </div>
          </div>
        </header>

        <section className="section-stack animate-rise-delayed grid gap-4 md:grid-cols-2">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">Services</h2>
            <p className="section-copy mt-3">
              Full-service support for digital products, systems, and devices.
              Every service is delivered with practical communication and
              results-focused execution.
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
            <h2 className="section-title">About Me</h2>
            <p className="section-copy mt-3">
              I started building computers at 12 and turned that passion into a
              professional service business. Today, I help people solve real
              technology problems with clean execution, honest guidance, and
              high-quality work.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {techStack.map((item) => (
                <span key={item} className="stack-chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="section-stack animate-rise-delayed grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-heading">Choose Your Service Path</h2>
            <Link href="/services" className="cta-secondary inline-flex">
              View All Services
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {servicePaths.map((service) => (
              <Link key={service.href} href={service.href} className="project-card">
                <p className="project-tag">Service</p>
                <h3 className="project-title">{service.title}</h3>
                <p className="project-copy">{service.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4 md:grid-cols-2">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">For Individuals</h2>
            <p className="section-copy mt-3">
              You do not need technical jargon to get strong results. From
              repairs and upgrades to troubleshooting and optimization, you get
              straightforward one-on-one support.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-100/90">
              <li className="audience-point">1. Clear diagnosis and honest recommendations.</li>
              <li className="audience-point">2. Affordable alternatives to big retail support.</li>
              <li className="audience-point">3. Fast turnaround and reliable communication.</li>
            </ul>
          </article>

          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">For Businesses</h2>
            <p className="section-copy mt-3">
              Grow your business with better websites, apps, automation, and
              process improvements. I build systems that look professional,
              perform well, and support long-term operations.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-100/90">
              <li className="audience-point">Lead-focused websites and UX design</li>
              <li className="audience-point">Custom software and mobile app development</li>
              <li className="audience-point">Automation and technical support that scales</li>
            </ul>
          </article>
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4">
          <h2 className="section-heading">Popular Engagements</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="project-card">
              <p className="project-tag">Website + Growth</p>
              <h3 className="project-title">Business Website Buildouts</h3>
              <p className="project-copy">
                Professional websites with strong messaging, fast performance,
                and clear calls to action designed to increase qualified leads.
              </p>
            </article>

            <article className="project-card">
              <p className="project-tag">Automation + Support</p>
              <h3 className="project-title">Operations and Device Optimization</h3>
              <p className="project-copy">
                From workflow automation to diagnostics and performance tuning,
                this service reduces friction and keeps teams and systems running smoothly.
              </p>
            </article>
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4">
          <h2 className="section-heading">Why Choose ZeroCool Development</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {trustStats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {deliveryStandards.map((item) => (
              <article key={item.title} className="testimonial-card">
                <p className="testimonial-author">{item.title}</p>
                <p className="testimonial-quote mt-3">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-3 grid gap-4">
          <h2 className="section-heading">What Happens Next</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((item) => (
              <article key={item.step} className="faq-card">
                <p className="project-tag">Step {item.step}</p>
                <h3 className="faq-question mt-2">{item.title}</h3>
                <p className="faq-answer">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-3 grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-heading">Free Guides</h2>
            <Link href="/insights" className="cta-secondary inline-flex">
              View All Guides
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {insightLinks.map((insight) => (
              <Link key={insight.href} href={insight.href} className="faq-card">
                <p className="project-tag">Guide</p>
                <h3 className="faq-question mt-2">{insight.title}</h3>
                <p className="faq-answer">{insight.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-3 grid gap-4">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {faqItems.map((item) => (
              <article key={item.question} className="faq-card">
                <h3 className="faq-question">{item.question}</h3>
                <p className="faq-answer">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="glass-panel animate-rise-delayed-3 rounded-3xl p-6 md:p-8"
        >
          <h2 className="section-title">Contact ZeroCool Development</h2>
          <p className="section-copy section-intro mt-3 max-w-4xl">
            Tell me what you need built, fixed, optimized, or automated.
            You will get a practical response with next steps that fit your
            goals, budget, and timeline.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
            <LeadForm />
            <div className="direct-contact-card rounded-2xl border border-blue-200/20 bg-slate-950/55 p-5">
              <h3 className="text-lg font-semibold text-blue-100">Direct Contact</h3>
              <p className="section-copy mt-3 text-sm">
                Reach out directly to start a one-on-one conversation about your needs.
              </p>
              <dl className="direct-contact-list">
                <div className="contact-row">
                  <dt className="contact-key">Name</dt>
                  <dd className="contact-value">Corey Derosiers</dd>
                </div>
                <div className="contact-row">
                  <dt className="contact-key">Phone</dt>
                  <dd className="contact-value">
                    <a href="tel:+14017862811" className="contact-link">
                      401-786-2811
                    </a>
                  </dd>
                </div>
                <div className="contact-row">
                  <dt className="contact-key">Email</dt>
                  <dd className="contact-value">
                    <a href="mailto:zerocool.development.project@gmail.com" className="contact-link">
                      zerocool.development.project@gmail.com
                    </a>
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={bookingUrl} className="cta-primary inline-flex">
                  Book a Strategy Call
                </a>
                <a href={phoneHref} className="cta-secondary inline-flex">
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs tracking-[0.18em] text-slate-300/70 uppercase">
          <div className="mb-3 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="ZeroCool Development logo"
              width={120}
              height={80}
              className="brand-logo"
            />
          </div>
          ZeroCool Development | Professional, affordable technology solutions
        </footer>

        <div className="sticky-mobile-cta">
          <TrackedLink
            href="#contact"
            className="cta-primary"
            eventName="start_project_click"
          >
            Start Your Project
          </TrackedLink>
          <TrackedLink
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="cta-secondary"
            eventName="mobile_book_call_click"
          >
            Book a Call
          </TrackedLink>
        </div>
      </main>
    </div>
  );
}
