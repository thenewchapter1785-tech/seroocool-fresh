import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPostBySlug } from "@/lib/blog";
import { getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Blog",
      description: "Technology article.",
      path: "/blog",
    });
  }

  return buildPageMetadata({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.publishDate,
        dateModified: post.publishDate,
        mainEntityOfPage: postUrl,
        author: {
          "@type": "Organization",
          name: "ZeroCool Development",
        },
        publisher: {
          "@type": "Organization",
          name: "ZeroCool Development",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faq.map((item) => ({
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
            name: "Blog",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Blog Article</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            {post.title}
          </h1>
          <p className="response-note mt-3">
            {post.publishDate} • {post.readTime}
          </p>
          <p className="section-copy mt-5">{post.excerpt}</p>

          <div className="mt-7 grid gap-6">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="section-title">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="section-copy mt-3">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <section className="mt-7">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="mt-4 grid gap-4">
              {post.faq.map((item) => (
                <article key={item.question} className="faq-card">
                  <h3 className="faq-question">{item.question}</h3>
                  <p className="faq-answer">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h2 className="section-title">Related Services and Resources</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.internalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="stack-chip">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book-service" className="cta-primary inline-flex">
              Book Free Estimate
            </Link>
            <Link href="/#contact" className="cta-secondary inline-flex">
              Request Help
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
