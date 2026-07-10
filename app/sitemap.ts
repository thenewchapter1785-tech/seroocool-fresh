import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog";
import { localSeoPages } from "@/lib/local-seo-pages";
import { serviceCatalog } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zerocool-development.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const dynamicServiceEntries: MetadataRoute.Sitemap = serviceCatalog.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.82,
  }));
  const dynamicLocalLandingEntries: MetadataRoute.Sitemap = localSeoPages.map((location) => ({
    url: `${siteUrl}/${location.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.84,
  }));
  const dynamicBlogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.76,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${siteUrl}/web-development`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/mobile-app-development`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${siteUrl}/ai-automation`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${siteUrl}/business-automation`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${siteUrl}/hubspot-integration`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/cloudflare-security`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/digitalocean-hosting`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/free-consultation`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: `${siteUrl}/book-service`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.94,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/estimate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/free-estimate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: `${siteUrl}/tech-support`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    {
      url: `${siteUrl}/diagnostic`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.83,
    },
    {
      url: `${siteUrl}/emergency-tech-support`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/plans`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.87,
    },
    {
      url: `${siteUrl}/free-guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/insights`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/insights/how-to-get-more-leads-from-your-website`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/insights/business-website-cost-breakdown`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/insights/automation-for-small-business-operations`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    ...dynamicServiceEntries,
    ...dynamicLocalLandingEntries,
    ...dynamicBlogEntries,
  ];
}
