import LeadForm from "./lead-form";
import TrackedLink from "./tracked-link";

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://zerocool-development.com";
  const facebookPageUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ?? "https://facebook.com/";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Corey Derosiers",
        alternateName: "$erocool",
        url: siteUrl,
        email: "mailto:thenewchapter1785@gmail.com",
        telephone: "+1-401-786-2811",
        sameAs: [facebookPageUrl],
      },
      {
        "@type": "ProfessionalService",
        name: "$erocool Development",
        url: siteUrl,
        areaServed: "US",
        serviceType: [
          "Business Website Development",
          "Web Application Development",
          "API Integrations",
          "Android App Development",
        ],
      },
    ],
  };

  const capabilities = [
    "Business Websites That Convert",
    "Clean UI Design and Brand Styling",
    "Android App Development",
    "Automation and API Integrations",
    "Full-Stack Product Development",
    "Speed, SEO, and Performance Tuning",
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
    { label: "Build Phases Managed", value: "6" },
    { label: "Delivery Coverage", value: "Web + Mobile + Backend" },
    { label: "Support Window", value: "Launch + Growth" },
  ];

  const testimonials = [
    {
      quote:
        "The process was easy to understand and the final site looked premium from day one.",
      author: "Small Business Owner",
    },
    {
      quote:
        "Clear architecture decisions and fast implementation. Great communication with technical teams.",
      author: "Product Team Lead",
    },
    {
      quote:
        "Exactly what we needed: strong design, clean code, and reliable project delivery.",
      author: "Startup Founder",
    },
  ];

  const faqItems = [
    {
      question: "I am not technical. Can I still work with you?",
      answer:
        "Yes. You explain your idea in plain language and I handle planning, design, and build from start to finish.",
    },
    {
      question: "Can you build a full custom product?",
      answer:
        "Yes. I build websites, web apps, Android apps, APIs, and full product ecosystems for business goals.",
    },
    {
      question: "How quickly can we start?",
      answer:
        "After your intake form is submitted, you get a follow-up with next steps and timeline options.",
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
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,255,198,0.25)_0%,rgba(0,255,198,0)_65%)]" />
          <p className="label-chip mb-5 inline-flex">Tag: $erocool</p>
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
                I build digital products
                <span className="text-cyan-300"> from idea to deployment.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200/85 md:text-lg">
                I help people turn ideas into real software without confusion,
                while still delivering production-grade engineering for teams
                that need advanced technical execution.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200/15 bg-slate-950/60 p-5">
              <p className="text-xs font-medium tracking-[0.25em] text-cyan-200/70 uppercase">
                Quick Resume
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-100/90">
                <li>Role: Full-Stack Developer</li>
                <li>Focus: Business-ready products</li>
                <li>Strength: Design + Engineering</li>
                <li>Delivery: Web, mobile, backend</li>
              </ul>
            </div>
          </div>
        </header>

        <section className="section-stack animate-rise-delayed grid gap-4 md:grid-cols-2">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">Core Services</h2>
            <p className="section-copy mt-3">
              From simple business pages to complex software systems, I build
              clear, polished products that are easy to use and built to grow.
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
            <h2 className="section-title">Technology Toolkit</h2>
            <p className="section-copy mt-3">
              Modern, battle-tested tools chosen to build fast, secure, and
              maintainable solutions.
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

        <section className="section-stack animate-rise-delayed-2 grid gap-4 md:grid-cols-2">
          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">If You Are New to Tech</h2>
            <p className="section-copy mt-3">
              You do not need to know coding terms. Tell me your idea and I will
              guide the full process in plain language, from concept to launch.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-100/90">
              <li className="audience-point">1. We define what you need.</li>
              <li className="audience-point">2. I design and build it for you.</li>
              <li className="audience-point">3. You get a live product you can use and grow.</li>
            </ul>
          </article>

          <article className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="section-title">If You Are a Technical Team</h2>
            <p className="section-copy mt-3">
              I can plug into existing workflows and deliver custom features with
              clean architecture, strong API design, and maintainable code.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-100/90">
              <li className="audience-point">Architecture planning and implementation</li>
              <li className="audience-point">Performance optimization and observability</li>
              <li className="audience-point">Reliable delivery from prototype to production</li>
            </ul>
          </article>
        </section>

        <section className="section-stack animate-rise-delayed-2 grid gap-4">
          <h2 className="section-heading">
            Featured Projects
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="project-card">
              <p className="project-tag">Project 01</p>
              <h3 className="project-title">Jon&apos;s Thoughts</h3>
              <p className="project-copy">
                A content platform for ideas and storytelling with a clean,
                readable experience for audiences and a scalable publishing flow
                for long-term growth.
              </p>
            </article>

            <article className="project-card">
              <p className="project-tag">Project 02</p>
              <h3 className="project-title">Housing Project</h3>
              <p className="project-copy">
                A housing-focused product that makes listing, search, and
                communication easier, with a trust-first design that works
                smoothly on desktop and mobile.
              </p>
            </article>
          </div>
        </section>

        <section className="section-stack animate-rise-delayed-3 grid gap-4">
          <h2 className="section-heading">
            Trust and Results
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {trustStats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="testimonial-card">
                <p className="testimonial-quote">&quot;{item.quote}&quot;</p>
                <p className="testimonial-author">{item.author}</p>
              </article>
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
          <h2 className="section-title">Contact and Project Intake</h2>
          <p className="section-copy section-intro mt-3 max-w-4xl">
            Tell me what you want to build. I will reply with the next best step
            for your project, whether you are just getting started or running a
            technical team.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
            <LeadForm />
            <div className="direct-contact-card rounded-2xl border border-cyan-200/15 bg-slate-950/55 p-5">
              <h3 className="text-lg font-semibold text-cyan-100">Direct Contact</h3>
              <p className="section-copy mt-3 text-sm">
                Reach out directly to start the conversation about your project.
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
                    <a href="mailto:thenewchapter1785@gmail.com" className="contact-link">
                      thenewchapter1785@gmail.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs tracking-[0.18em] text-slate-300/70 uppercase">
          $erocool | Build anything in code
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
            href={facebookPageUrl}
            target="_blank"
            rel="noreferrer"
            className="cta-secondary"
            eventName="facebook_message_click"
          >
            Message on Facebook
          </TrackedLink>
        </div>
      </main>
    </div>
  );
}
