import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Web Development Services | ZeroCool Development",
  description:
    "Custom web development for small businesses with SEO-ready architecture, lead generation focus, and secure deployment.",
  path: "/web-development",
});

export default function WebDevelopmentPage() {
  return (
    <SeoLandingTemplate
      path="/web-development"
      kicker="Website & App Development"
      title="Web Development for Lead Growth"
      description="ZeroCool Development builds high-performance websites designed to rank, convert, and scale for small businesses in Rhode Island and remote clients."
      benefits={[
        "SEO-first information architecture",
        "Conversion-focused user journeys",
        "Mobile-first responsive design",
        "Fast loading and Core Web Vitals optimization",
      ]}
      faq={[
        {
          question: "Can you redesign my existing website?",
          answer:
            "Yes. We can redesign and rebuild your site to improve performance, SEO, and lead conversion without losing your brand direction.",
        },
        {
          question: "Do you include security hardening?",
          answer:
            "Yes. We include secure headers, CSP, validation, and deployment best practices for Cloudflare and DigitalOcean environments.",
        },
      ]}
    />
  );
}
