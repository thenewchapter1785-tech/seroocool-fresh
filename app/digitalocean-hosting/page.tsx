import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "DigitalOcean Hosting Setup | ZeroCool Development",
  description:
    "DigitalOcean hosting setup and optimization for Next.js and modern web apps with secure deployment workflows and production monitoring.",
  path: "/digitalocean-hosting",
});

export default function DigitalOceanHostingPage() {
  return (
    <SeoLandingTemplate
      path="/digitalocean-hosting"
      kicker="DigitalOcean Hosting"
      title="DigitalOcean Hosting Built for Reliability"
      description="Deploy and manage your web application on DigitalOcean with production-grade configuration and clear deployment workflows."
      benefits={[
        "Production app platform configuration",
        "Environment variable and secret hygiene",
        "Deployment verification and rollback planning",
        "Cloudflare-compatible architecture",
      ]}
      faq={[
        {
          question: "Can you migrate my site to DigitalOcean?",
          answer:
            "Yes. We can migrate from many existing hosting providers and preserve domain, DNS, and SEO continuity.",
        },
        {
          question: "Will this be easy to maintain later?",
          answer:
            "Yes. We provide maintainable deployment scripts and documentation so your team can operate confidently.",
        },
      ]}
    />
  );
}
