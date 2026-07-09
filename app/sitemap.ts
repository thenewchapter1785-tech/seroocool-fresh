import type { MetadataRoute } from "next";
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
  ];
}
