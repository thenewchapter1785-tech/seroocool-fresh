import Link from "next/link";
import { getSiteUrl } from "@/lib/env";

type LandingTemplateProps = {
  path: string;
  kicker: string;
  title: string;
  description: string;
  benefits: string[];
  faq: Array<{ question: string; answer: string }>;
};

export default function SeoLandingTemplate(props: LandingTemplateProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${props.path}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        serviceType: props.kicker,
        description: props.description,
        url: pageUrl,
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
          {
            "@type": "ListItem",
            position: 2,
            name: props.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: props.faq.map((item) => ({
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
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">{props.kicker}</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            {props.title}
          </h1>
          <p className="section-copy mt-4 max-w-3xl">{props.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">
              Get Help Now
            </Link>
            <Link href="/free-estimate" className="cta-secondary inline-flex">
              Free Estimate
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Why People Choose ZeroCool Development</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-100/90 md:grid-cols-2">
            {props.benefits.map((benefit) => (
              <li key={benefit} className="tech-pill">
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {props.faq.map((item) => (
            <article key={item.question} className="faq-card">
              <h2 className="faq-question">{item.question}</h2>
              <p className="faq-answer">{item.answer}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Next Step</h2>
          <p className="section-copy mt-3">
            Tell us what is going on and we will walk you through clear options, timeline, and
            pricing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">
              Talk to ZeroCool
            </Link>
            <Link href="/free-estimate" className="cta-secondary inline-flex">
              Free Estimate
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
