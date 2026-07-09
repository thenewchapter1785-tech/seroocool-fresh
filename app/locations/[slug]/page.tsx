import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocationBySlug, locationPages } from "@/lib/locations";
import { buildPageMetadata } from "@/lib/seo";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return locationPages.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata(props: LocationPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const location = getLocationBySlug(slug);

  if (!location) {
    return buildPageMetadata({
      title: "Service Area",
      description: "Rhode Island service area page.",
      path: "/locations",
    });
  }

  return buildPageMetadata({
    title: `${location.locationName} Technology Services | ZeroCool Development`,
    description: location.description,
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationPage(props: LocationPageProps) {
  const { slug } = await props.params;
  const location = getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">{location.regionLabel}</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            {location.locationName} Technology Services
          </h1>
          <p className="section-copy mt-4 max-w-3xl">{location.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#contact" className="cta-primary inline-flex">
              Request Help in {location.locationName}
            </Link>
            <Link href="/book-service" className="cta-secondary inline-flex">
              Book Consultation
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Neighborhood Coverage</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {location.neighborhoods.map((neighborhood) => (
              <span key={neighborhood} className="stack-chip">
                {neighborhood}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Top Services</h2>
            <ul className="mt-3 grid gap-2 text-sm text-slate-200/90">
              {location.topServices.map((service) => (
                <li key={service}>- {service}</li>
              ))}
            </ul>
          </article>
          <article className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Common Issues</h2>
            <ul className="mt-3 grid gap-2 text-sm text-slate-200/90">
              {location.painPoints.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </article>
          <article className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Why Clients Choose Us</h2>
            <ul className="mt-3 grid gap-2 text-sm text-slate-200/90">
              {location.whyUs.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
