import type { Metadata } from "next";
import SeoLandingTemplate from "../seo-landing-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "HubSpot Integration Services | ZeroCool Development",
  description:
    "HubSpot integration services to connect forms, lead routing, lifecycle updates, and automation across your website and business systems.",
  path: "/hubspot-integration",
});

export default function HubSpotIntegrationPage() {
  return (
    <SeoLandingTemplate
      path="/hubspot-integration"
      kicker="CRM Integration"
      title="HubSpot Integration for Better Lead Visibility"
      description="Connect your site and internal workflows with HubSpot so new leads are captured, enriched, and routed without delays."
      benefits={[
        "Secure lead capture and contact upsert",
        "Lifecycle and source attribution support",
        "Automation-ready CRM data structure",
        "Improved handoff from marketing to sales",
      ]}
      faq={[
        {
          question: "Can you integrate custom forms with HubSpot?",
          answer:
            "Yes. We can connect custom website forms to HubSpot using secure backend APIs and validation logic.",
        },
        {
          question: "Do you support workflow automation in HubSpot?",
          answer:
            "Yes. We can help configure and align workflow logic for lead follow-up and pipeline transitions.",
        },
      ]}
    />
  );
}
