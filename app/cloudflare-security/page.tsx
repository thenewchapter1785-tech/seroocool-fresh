import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cloudflare Security Hardening | ZeroCool Development",
  description:
    "Cloudflare security hardening for business websites with WAF, DNS, SSL/TLS, bot protection, and performance optimization.",
  path: "/cloudflare-security",
});

export default function CloudflareSecurityPage() {
  return (
    <SeoLandingTemplate
      path="/cloudflare-security"
      kicker="Secure Deployment"
      title="Cloudflare Security for Business Websites"
      description="Protect your digital presence with practical Cloudflare security controls, reliable DNS, and hardened edge delivery."
      benefits={[
        "WAF and bot mitigation strategy",
        "DNS and SSL/TLS configuration",
        "Performance and caching optimization",
        "Security rule tuning with observability",
      ]}
      faq={[
        {
          question: "Do I need Cloudflare if I already have hosting?",
          answer:
            "Yes. Cloudflare adds an important security and performance layer on top of your hosting environment.",
        },
        {
          question: "Can you configure this for DigitalOcean?",
          answer:
            "Yes. We regularly configure Cloudflare and DigitalOcean together for secure, reliable deployments.",
        },
      ]}
    />
  );
}
