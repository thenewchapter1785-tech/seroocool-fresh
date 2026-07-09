import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Technology Blog | ZeroCool Development",
  description:
    "SEO-focused technology articles covering PC speed, malware warning signs, business websites, AI savings, cybersecurity, and Wi-Fi troubleshooting.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Growth Content Hub</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Technology Insights That Drive Better Decisions
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Educational content built for SEO visibility, trust, and conversion.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="project-card">
              <p className="project-tag">{post.readTime}</p>
              <h2 className="project-title">{post.title}</h2>
              <p className="project-copy">{post.excerpt}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
