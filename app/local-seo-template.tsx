import Link from "next/link";
import { getSiteUrl } from "@/lib/env";
import type { LocalSeoPage } from "@/lib/local-seo-pages";

type LocalSeoTemplateProps = {
  page: LocalSeoPage;
  path: string;
};

export default function LocalSeoTemplate({ page, path }: LocalSeoTemplateProps) {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: "ZeroCool Development",
        areaServed: [page.city, "Rhode Island"],
        serviceArea: page.region,
        url: `${siteUrl}${path}`,
      },
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        serviceType: page.services,
        areaServed: [page.city],
        description: page.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
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
          {
            "@type": "ListItem",
            position: 2,
            name: page.city,
            item: `${siteUrl}${path}`,
          },
        ],
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
          <p className="label-chip inline-flex">{page.region}</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            {page.title}
          </h1>
          <p className="section-copy mt-4 max-w-3xl">{page.intro}</p>
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
          <h2 className="section-title">Services Offered in {page.city}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.services.map((service) => (
              <span key={service} className="stack-chip">
                {service}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.keywords.map((keyword) => (
              <span key={keyword} className="proof-chip">
                {keyword}
              </span>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="mt-4 grid gap-4">
            {page.faq.map((item) => (
              <article key={item.question} className="faq-card">
                <h3 className="faq-question">{item.question}</h3>
                <p className="faq-answer">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
