import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { serviceCatalog } from "@/lib/services";
import { getSiteUrl } from "@/lib/env";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return serviceCatalog.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(props: ServicePageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const service = serviceCatalog.find((item) => item.slug === slug);

  if (!service) {
    return buildPageMetadata({
      title: "Service",
      description: "Technology services by ZeroCool Development.",
      path: "/services",
    });
  }

  return buildPageMetadata({
    title: `${service.name} | ZeroCool Development`,
    description: `${service.fullDescription} Serving Rhode Island and remote clients with fast, honest, affordable support.`,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage(props: ServicePageProps) {
  const { slug } = await props.params;
  const service = serviceCatalog.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        name: "ZeroCool Development",
        serviceType: service.name,
        description: service.fullDescription,
        areaServed: ["Rhode Island", "Remote"],
        provider: {
          "@type": "Organization",
          name: "ZeroCool Development",
          url: siteUrl,
        },
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
            name: "Services",
            item: `${siteUrl}/services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.name,
            item: `${siteUrl}/services/${service.slug}`,
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
          <p className="label-chip inline-flex">
            {service.category === "home" ? "Home Technology Service" : "Business Technology Service"}
          </p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            {service.name}
          </h1>
          <p className="section-copy mt-4 max-w-3xl">{service.fullDescription}</p>
          <p className="section-copy mt-4">
            Fast. Honest. Affordable. Friendly support for Rhode Island and remote clients.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">
              Request a Free Estimate
            </Link>
            <Link href="/free-consultation" className="cta-secondary inline-flex">
              Book Free Consultation
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Who This Helps</h2>
          <p className="section-copy mt-3">
            Ideal for home users, students, families, gamers, and small businesses that want
            straightforward technology help without confusing jargon.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {service.keywords.map((keyword) => (
              <span key={keyword} className="stack-chip">
                {keyword}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
