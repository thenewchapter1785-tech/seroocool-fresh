import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Mobile App Development | ZeroCool Development",
  description:
    "Mobile app development services for startups and small businesses, including planning, build, API integration, and launch support.",
  path: "/mobile-app-development",
});

export default function MobileAppDevelopmentPage() {
  return (
    <SeoLandingTemplate
      path="/mobile-app-development"
      kicker="Mobile App Development"
      title="Launch Reliable Mobile Apps Faster"
      description="From MVP planning to production release, ZeroCool Development delivers mobile app solutions aligned to business outcomes and user retention."
      benefits={[
        "MVP strategy for faster launch",
        "API-ready backend integration",
        "Scalable architecture for growth",
        "Post-launch optimization and support",
      ]}
      faq={[
        {
          question: "Do you build for both iOS and Android?",
          answer:
            "Yes. We can plan and implement cross-platform and platform-specific strategies based on your product goals.",
        },
        {
          question: "Can you integrate with existing systems?",
          answer:
            "Yes. We integrate mobile apps with CRMs, payment systems, analytics, and custom internal platforms.",
        },
      ]}
    />
  );
}
